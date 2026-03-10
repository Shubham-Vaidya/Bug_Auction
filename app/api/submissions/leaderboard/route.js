import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Submission from "@/models/Submission";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const roomCode = searchParams.get("roomCode");

        if (!roomCode) {
            return NextResponse.json({ error: "roomCode is required" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Aggregate total profit per team from scored submissions only
        const profitData = await Submission.aggregate([
            { $match: { roomId: room._id, status: "scored" } },
            {
                $group: {
                    _id: "$teamName",
                    totalProfit: { $sum: "$profit" },
                    totalScore: { $sum: "$adminScore" },
                    submissionsCount: { $sum: 1 },
                },
            },
            { $sort: { totalProfit: -1 } },
        ]);

        // Map to { teamName -> { totalProfit, totalScore, submissionsCount } }
        const profitMap = {};
        for (const row of profitData) {
            profitMap[row._id] = {
                totalProfit: row.totalProfit,
                totalScore: row.totalScore,
                submissionsCount: row.submissionsCount,
            };
        }

        return NextResponse.json({ success: true, profitMap, leaderboard: profitData.map(r => ({ teamName: r._id, ...r })) });
    } catch (error) {
        console.error("Submission leaderboard error:", error);
        return NextResponse.json({ error: "Failed to get leaderboard" }, { status: 500 });
    }
}
