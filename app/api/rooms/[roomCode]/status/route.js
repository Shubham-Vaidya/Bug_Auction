import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            room: {
                _id: room._id,
                roomId: room.roomId,
                roomName: room.roomName,
                coinsPerTeam: room.coinsPerTeam,
                status: room.status,
                createdAt: room.createdAt,
            },
        });
    } catch (error) {
        console.error("Room status error:", error);
        return NextResponse.json(
            { error: "Failed to get room status" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { status, userId } = await request.json();

        if (!status || !userId) {
            return NextResponse.json({ error: "Missing status or userId" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        room.status = status;
        await room.save();

        return NextResponse.json({ success: true, message: `Room status updated to ${status}` });
    } catch (error) {
        console.error("Update room status error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
