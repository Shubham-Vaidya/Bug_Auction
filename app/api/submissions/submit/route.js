import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Purchase from "@/models/Purchase";
import Submission from "@/models/Submission";
import Bug from "@/models/Bug";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request) {
    try {
        await dbConnect();
        const { userId, roomCode, bugStringId, solutionCode, language } = await request.json();

        if (!userId || !roomCode || !bugStringId || !solutionCode?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Submissions are now allowed as soon as a bug is acquired
        // The room.status check has been removed per request.

        // Resolve bug string ID to ObjectId
        const bug = await Bug.findOne({ bugId: bugStringId });
        if (!bug) {
            return NextResponse.json({ error: "Bug not found" }, { status: 404 });
        }

        // Verify the team owns this bug
        const purchase = await Purchase.findOne({ userId, roomId: room._id, bugId: bug._id });
        if (!purchase) {
            return NextResponse.json({ error: "You did not purchase this bug" }, { status: 403 });
        }

        // Upsert: allow re-submission only if not yet scored
        let submission = await Submission.findOne({ userId, roomId: room._id, bugId: bug._id });
        if (submission && submission.status === "scored") {
            return NextResponse.json({ error: "This submission has already been scored and cannot be changed" }, { status: 400 });
        }

        if (submission) {
            submission.solutionCode = solutionCode;
            submission.geminiResult = "waiting"; // Reset on re-submission
            await submission.save();
        } else {
            submission = await Submission.create({
                userId,
                roomId: room._id,
                bugId: bug._id,
                teamName: purchase.teamName,
                bugTitle: bug.name,
                purchasePrice: purchase.purchasePrice,
                solutionCode,
            });
        }

        // --- GEMINI INTEGRATION ---
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("DEBUG: Gemini API Key present:", !!apiKey);
        
        if (apiKey) {
            try {
                console.log("DEBUG: Initializing Gemini Pro...");
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(apiKey);
                
                // Try several model names in order of preference
                const models = [
                    "gemini-2.5-flash",
                    "gemini-2.0-flash", 
                    "gemini-flash-latest",
                    "gemini-pro-latest"
                ];
                let trialLogs = [];
                let success = false;

                for (const modelName of models) {
                    try {
                        console.log(`DEBUG: Trying model ${modelName}...`);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const buggyCode = bug.languageVersions?.[language] || "Not available";
                        
                        const prompt = `
                            You are a code reviewer in a "Bug Auction" competition.
                            A user has submitted a fix for a bug.
                            
                            BUGGY CODE:
                            ${buggyCode}
                            
                            USER'S SUBMITTED FIX:
                            ${solutionCode}
                            
                            Is the user's fix correct? 
                            Respond with "yes" if the bug is fixed correctly, and "no" if the bug is still present or the fix is incorrect.
                            
                            Follow this format EXACTLY:
                            RESULT: [yes/no]
                            REASON: [Short explanation in one sentence]
                        `;

                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();
                        console.log(`DEBUG: Raw Response from ${modelName}:`, text);

                        const geminiResultMatch = text.match(/RESULT:\s*(yes|no|YES|NO)/i);
                        const geminiReasonMatch = text.match(/REASON:\s*(.*)/i);

                        if (geminiResultMatch) {
                            submission.geminiResult = geminiResultMatch[1].toLowerCase();
                        } else {
                            if (text.toLowerCase().includes("result: yes")) submission.geminiResult = "yes";
                            else if (text.toLowerCase().includes("result: no")) submission.geminiResult = "no";
                        }

                        if (geminiReasonMatch) {
                            submission.geminiAnalysis = geminiReasonMatch[1].trim();
                        }
                        
                        success = true;
                        break; 
                    } catch (err) {
                        console.log(`DEBUG: Model ${modelName} failed:`, err.message);
                        trialLogs.push(`${modelName}: ${err.message}`);
                    }
                }

                if (!success) {
                    submission.geminiAnalysis = "All models failed: " + trialLogs.join(" | ");
                    await submission.save();
                } else {
                    await submission.save();
                }
                console.log("DEBUG: Gemini Process Finished. Success:", success);
            } catch (geminiError) {
                console.error("Gemini Critical Error:", geminiError);
                submission.geminiAnalysis = "Critical Error: " + geminiError.message;
                await submission.save();
            }
        } else {
            console.log("DEBUG: Skipping Gemini review - No API Key found in process.env");
        }

        await broadcastRoomEvent(room.roomId, "solutionSubmitted", {
            submissionId: submission._id,
            teamName: submission.teamName,
            bugId: bug.bugId,
        });

        return NextResponse.json({ success: true, message: "Solution processed. Gemini review updated.", submission });
    } catch (error) {
        console.error("Submit solution error:", error);
        return NextResponse.json({ error: "Failed to submit solution" }, { status: 500 });
    }
}
