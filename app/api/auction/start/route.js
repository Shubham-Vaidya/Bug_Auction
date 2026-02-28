import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";

export async function POST(req) {
    try {
        await dbConnect();

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { roomId } = body;

        if (!roomId) {
            return NextResponse.json(
                { success: false, error: "Room ID is required." },
                { status: 400 }
            );
        }

        // Find room and update status to LIVE
        const room = await Room.findOneAndUpdate(
            { roomId },
            { status: "LIVE" },
            { new: true }
        );

        if (!room) {
            return NextResponse.json(
                { success: false, error: "Room not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, room },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error starting auction:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
