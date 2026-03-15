import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Bug from "@/models/Bug";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId } = await request.json();

        // Get room
        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json(
                { error: "Only the room admin can start the room" },
                { status: 403 }
            );
        }

        if (room.status !== "WAITING") {
            return NextResponse.json(
                { error: "Room is not in WAITING state" },
                { status: 400 }
            );
        }

        // Get all players in the room
        const players = await RoomPlayer.find({ roomId: room._id });
        if (players.length === 0) {
            return NextResponse.json(
                { error: "No players have joined the room yet" },
                { status: 400 }
            );
        }

        // Update player statuses (to match RoomPlayer model if needed, 
        // though RoomPlayer model currently uses 'online'/'idle')
        await RoomPlayer.updateMany(
            { roomId: room._id },
            { $set: { status: "online" } }
        );

        // Start the room
        room.status = "LIVE";
        await room.save();
        await broadcastRoomEvent(room.roomId, "roomStatusChanged", {
            scope: "BUG",
            status: room.status,
        });

        return NextResponse.json({
            success: true,
            message: "Room started! Auction is now LIVE.",
            room: room,
        });
    } catch (error) {
        console.error("Start room error:", error);
        return NextResponse.json(
            { error: "Failed to start room" },
            { status: 500 }
        );
    }
}

