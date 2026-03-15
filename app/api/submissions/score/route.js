import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Submission from "@/models/Submission";
import Bug from "@/models/Bug";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request) {
    try {
        await dbConnect();
        const { submissionId, adminScore, adminId } = await request.json();

        if (!submissionId || adminScore === undefined || adminScore === null || !adminId) {
            return NextResponse.json({ error: "submissionId, adminScore, and adminId are required" }, { status: 400 });
        }

        const score = Number(adminScore);
        if (isNaN(score)) {
            return NextResponse.json({ error: "adminScore must be a number" }, { status: 400 });
        }

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Verify admin owns the room
        const room = await Room.findById(submission.roomId);
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        submission.adminScore = score;
        submission.profit = score - submission.purchasePrice;
        submission.status = "scored";
        await submission.save();

        const bug = await Bug.findById(submission.bugId).select("bugId name");
        await broadcastRoomEvent(room.roomId, "submissionScored", {
            submissionId: submission._id,
            teamName: submission.teamName,
            score,
            profit: submission.profit,
            bugId: bug?.bugId,
            bugName: bug?.name,
        });

        return NextResponse.json({
            success: true,
            message: `Scored ${submission.teamName}'s solution: ${score} pts, Profit: ₹${submission.profit}`,
            submission,
        });
    } catch (error) {
        console.error("Score submission error:", error);
        return NextResponse.json({ error: "Failed to score submission" }, { status: 500 });
    }
}
