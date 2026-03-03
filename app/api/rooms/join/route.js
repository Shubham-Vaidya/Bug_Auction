import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import User from "@/models/user";

export async function POST(request) {
    try {
        await dbConnect();
        const { roomCode, userId } = await request.json();

        if (!roomCode || !userId) {
            return NextResponse.json(
                { error: "Room code and user ID are required" },
                { status: 400 }
            );
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        if (room.status === "ENDED") {
            return NextResponse.json(
                { error: "Room has ended" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if already joined
        const existing = await RoomPlayer.findOne({ userId: user._id, roomId: room._id });
        if (existing) {
            return NextResponse.json({
                success: true,
                message: "Already joined",
                roomPlayer: existing,
            });
        }

        const roomPlayer = await RoomPlayer.create({
            userId: user._id,
            roomId: room._id,
            teamName: user.teamName,
            coins: room.coinsPerTeam,
            bugsWon: 0,
            status: "online",
        });

        return NextResponse.json({
            success: true,
            roomPlayer,
        });
    } catch (error) {
        console.error("Join room error:", error);
        return NextResponse.json(
            { error: "Failed to join room" },
            { status: 500 }
        );
    }
}
