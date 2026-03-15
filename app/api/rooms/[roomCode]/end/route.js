import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId } = await request.json();

        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json(
                { error: "Only the room admin can end the room" },
                { status: 403 }
            );
        }

        // End the room
        room.status = "completed";
        await room.save();
        await broadcastRoomEvent(room.roomId || roomCode, "roomStatusChanged", {
            scope: "BUG",
            status: room.status,
        });

        // Mark all playing players as finished
        const now = new Date();
        const elapsed = now.getTime() - room.startTime.getTime();

        const playingPlayers = await RoomPlayer.find({
            roomId: room._id,
            status: "playing",
        });

        for (const player of playingPlayers) {
            const timeRemaining = Math.max(0, room.timerDuration - elapsed - player.penaltyTime);
            player.status = "finished";
            player.completedAt = now;
            player.finalTimeRemaining = timeRemaining;
            await player.save();
        }

        return NextResponse.json({
            success: true,
            message: "Room ended",
        });
    } catch (error) {
        console.error("End room error:", error);
        return NextResponse.json(
            { error: "Failed to end room" },
            { status: 500 }
        );
    }
}
