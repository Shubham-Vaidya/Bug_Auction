import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        const players = await RoomPlayer.find({ roomId: room._id })
            .populate("userId", "username teamName")
            .lean();

        // Calculate remaining time for each player
        const now = new Date();
        const elapsed = room.startTime ? now.getTime() - room.startTime.getTime() : 0;

        const leaderboard = players.map((p) => {
            let timeRemaining;
            if (p.status === "finished" && p.finalTimeRemaining !== null) {
                timeRemaining = p.finalTimeRemaining;
            } else if (room.status === "active") {
                timeRemaining = Math.max(0, room.timerDuration - elapsed - (p.penaltyTime || 0));
            } else {
                timeRemaining = 0;
            }

            return {
                teamName: p.teamName,
                username: p.userId?.username,
                solvedCount: p.solvedCount,
                penaltyTime: p.penaltyTime,
                timeRemaining,
                status: p.status,
                completedAt: p.completedAt,
            };
        });

        // Sort: most solved → highest time remaining → fastest completion
        leaderboard.sort((a, b) => {
            if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
            if (b.timeRemaining !== a.timeRemaining) return b.timeRemaining - a.timeRemaining;
            if (a.completedAt && b.completedAt) {
                return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
            }
            return 0;
        });

        // Add rank
        const ranked = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry,
        }));

        return NextResponse.json({
            success: true,
            leaderboard: ranked,
            roomStatus: room.status,
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json(
            { error: "Failed to get leaderboard" },
            { status: 500 }
        );
    }
}
