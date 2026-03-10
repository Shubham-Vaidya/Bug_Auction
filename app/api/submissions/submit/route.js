import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Purchase from "@/models/Purchase";
import Submission from "@/models/Submission";
import Bug from "@/models/Bug";

export async function POST(request) {
    try {
        await dbConnect();
        const { userId, roomCode, bugStringId, solutionCode } = await request.json();

        if (!userId || !roomCode || !bugStringId || !solutionCode?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.status !== "ENDED") {
            return NextResponse.json({ error: "Submissions are only allowed after the auction ends" }, { status: 400 });
        }

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
        const existing = await Submission.findOne({ userId, roomId: room._id, bugId: bug._id });
        if (existing && existing.status === "scored") {
            return NextResponse.json({ error: "This submission has already been scored and cannot be changed" }, { status: 400 });
        }

        if (existing) {
            existing.solutionCode = solutionCode;
            await existing.save();
            return NextResponse.json({ success: true, message: "Solution updated successfully", submission: existing });
        }

        const submission = await Submission.create({
            userId,
            roomId: room._id,
            bugId: bug._id,
            teamName: purchase.teamName,
            bugTitle: bug.name,
            purchasePrice: purchase.purchasePrice,
            solutionCode,
        });

        return NextResponse.json({ success: true, message: "Solution submitted successfully", submission });
    } catch (error) {
        console.error("Submit solution error:", error);
        return NextResponse.json({ error: "Failed to submit solution" }, { status: 500 });
    }
}
