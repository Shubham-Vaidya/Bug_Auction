import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";

// Helper function to generate a random 6-character uppercase string
function generateRoomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function POST(req) {
    try {
        await dbConnect();

        // Generate a unique 6-character room ID
        const roomId = generateRoomId();

        // Attempt to parse request body to check if createdBy was passed
        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            // Body may be empty, which is fine
        }

        // Create the room document in the database
        const newRoom = await Room.create({
            roomId: roomId,
            createdBy: body.createdBy || null,
            status: "WAITING",
            teams: [],
        });

        return NextResponse.json(
            { success: true, room: newRoom },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
