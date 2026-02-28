import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import User from "@/models/User";

export async function POST(req) {
    try {
        await dbConnect();

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { teamName, roomId, language } = body;

        if (!teamName || !roomId) {
            return NextResponse.json(
                { success: false, error: "Team name and room ID are required." },
                { status: 400 }
            );
        }

        // Find room
        const room = await Room.findOne({ roomId });
        if (!room) {
            return NextResponse.json(
                { success: false, error: "Room not found." },
                { status: 404 }
            );
        }

        // Create user with role "team"
        const newUser = await User.create({
            teamName,
            roomId,
            language: language || "JavaScript",
            role: "team"
        });

        // Add user to room.teams
        room.teams.push(newUser._id);
        await room.save();

        return NextResponse.json(
            { success: true, message: "Successfully joined room", user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error joining room:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
