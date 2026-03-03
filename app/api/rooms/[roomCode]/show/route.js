import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import Bug from "@/models/Bug";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId, bugId } = await request.json();

        if (!userId || !bugId) {
            return NextResponse.json(
                { error: "userId and bugId are required" },
                { status: 400 }
            );
        }

        // Find room
        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json(
                { error: "Only the room admin can reveal bugs" },
                { status: 403 }
            );
        }

        // Find bug
        const bug = await Bug.findById(bugId);
        if (!bug) {
            return NextResponse.json({ error: "Bug not found" }, { status: 404 });
        }

        // Set activeBug — replaces any previously shown bug (one at a time)
        room.activeBug = bug._id;
        await room.save();

        return NextResponse.json({
            success: true,
            message: `Bug ${bug.bugId} is now live`,
            activeBug: {
                _id: bug._id,
                bugId: bug.bugId,
                name: bug.name,
                description: bug.description,
                marketValue: bug.marketValue,
                difficulty: bug.difficulty,
                tag: bug.tag,
            },
        });
    } catch (error) {
        console.error("Show bug error:", error);
        return NextResponse.json(
            { error: "Failed to reveal bug" },
            { status: 500 }
        );
    }
}
