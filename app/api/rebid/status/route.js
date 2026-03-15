import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request) {
    try {
        await dbConnect();
        const { roomCode, userId, status } = await request.json();

        if (!roomCode || !userId || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        room.rebiddingStatus = status;
        await room.save();
        await broadcastRoomEvent(room.roomId, "roomStatusChanged", {
            scope: "REBID",
            rebiddingStatus: status,
            roomStatus: room.status,
            powerCardStatus: room.powerCardStatus,
        });

        return NextResponse.json({ success: true, message: `Rebidding status updated to ${status}` });
    } catch (error) {
        console.error("Rebid status update error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
