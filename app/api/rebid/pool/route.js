import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Rebid from "@/models/Rebid";

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

        const pool = await Rebid.find({ roomId: room._id })
            .populate("bugId", "bugId name marketValue difficulty tag")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, pool });
    } catch (error) {
        console.error("Get rebid pool error:", error);
        return NextResponse.json({ error: "Failed to get rebid pool" }, { status: 500 });
    }
}
