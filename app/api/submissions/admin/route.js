import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Submission from "@/models/Submission";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const adminId = searchParams.get("adminId");
        const roomCode = searchParams.get("roomCode");

        if (!adminId || !roomCode) {
            return NextResponse.json({ error: "adminId and roomCode are required" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Verify admin owns the room
        if (room.createdBy.toString() !== adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const submissions = await Submission.find({ roomId: room._id })
            .populate("bugId", "bugId name tag difficulty")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, submissions });
    } catch (error) {
        console.error("Get admin submissions error:", error);
        return NextResponse.json({ error: "Failed to get submissions" }, { status: 500 });
    }
}
