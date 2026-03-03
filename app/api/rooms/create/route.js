import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ARENA-";
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request) {
    try {
        await dbConnect();
        const { roomName, coinsPerTeam, userId } = await request.json();

        if (!roomName || !userId) {
            return NextResponse.json(
                { error: "Room name and user ID are required" },
                { status: 400 }
            );
        }

        // Generate unique room code
        let roomId;
        let isUnique = false;
        while (!isUnique) {
            roomId = generateRoomCode();
            const existing = await Room.findOne({ roomId });
            if (!existing) isUnique = true;
        }

        const room = await Room.create({
            roomId,
            roomName: roomName.trim(),
            coinsPerTeam: coinsPerTeam || 5000,
            status: "WAITING",
            createdBy: userId,
        });

        return NextResponse.json({
            success: true,
            room: {
                _id: room._id,
                roomId: room.roomId,
                roomName: room.roomName,
                coinsPerTeam: room.coinsPerTeam,
                status: room.status,
            },
        });
    } catch (error) {
        console.error("Create room error:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}
