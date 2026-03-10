import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Submission from "@/models/Submission";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const roomCode = searchParams.get("roomCode");

        if (!userId || !roomCode) {
            return NextResponse.json({ error: "userId and roomCode are required" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const submissions = await Submission.find({ userId, roomId: room._id })
            .populate("bugId", "bugId name tag difficulty")
            .lean();

        return NextResponse.json({ success: true, submissions });
    } catch (error) {
        console.error("Get team submissions error:", error);
        return NextResponse.json({ error: "Failed to get submissions" }, { status: 500 });
    }
}
