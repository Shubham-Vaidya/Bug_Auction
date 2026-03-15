import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Rebid from "@/models/Rebid";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request) {
    try {
        await dbConnect();
        const { roomCode, userId, rebidId } = await request.json();

        if (!roomCode || !userId || !rebidId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const rebid = await Rebid.findById(rebidId);
        if (!rebid) {
            return NextResponse.json({ error: "Rebid record not found" }, { status: 404 });
        }

        // Reset all other rebid bugs in this room that were 'AUCTIONING' to 'WAITING'
        await Rebid.updateMany(
            { roomId: room._id, status: "AUCTIONING" },
            { status: "WAITING" }
        );

        // Set this one as auctioning
        rebid.status = "AUCTIONING";
        await rebid.save();

        // Update room's active bug
        room.activeBug = rebid.bugId;
        await room.save();

        await broadcastRoomEvent(room.roomId, "rebidStarted", {
            rebidId: rebid._id,
            bugId: rebid.bugId,
        });
        await broadcastRoomEvent(room.roomId, "rebidPoolUpdated", {
            rebidId: rebid._id,
        });

        return NextResponse.json({ success: true, message: "Rebid bug is now live in auction" });
    } catch (error) {
        console.error("Rebid auction start error:", error);
        return NextResponse.json({ error: "Failed to start rebid auction" }, { status: 500 });
    }
}
