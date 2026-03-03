import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import RoomPlayerPuzzle from "@/models/RoomPlayerPuzzle";
import Puzzle from "@/models/Puzzle";

// Fisher-Yates shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId } = await request.json();

        // Get room
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json(
                { error: "Only the room admin can start the room" },
                { status: 403 }
            );
        }

        if (room.status !== "waiting") {
            return NextResponse.json(
                { error: "Room is not in waiting state" },
                { status: 400 }
            );
        }

        // Get all players in the room
        const players = await RoomPlayer.find({ roomId: room._id });
        if (players.length === 0) {
            return NextResponse.json(
                { error: "No players have joined the room yet" },
                { status: 400 }
            );
        }

        // Get all puzzles
        const allPuzzles = await Puzzle.find({});
        if (allPuzzles.length < room.puzzleCountPerTeam) {
            return NextResponse.json(
                { error: `Not enough puzzles. Need ${room.puzzleCountPerTeam}, have ${allPuzzles.length}` },
                { status: 400 }
            );
        }

        const puzzleIds = allPuzzles.map((p) => p._id);

        // Assign random puzzles to each player
        const puzzleAssignments = [];
        for (const player of players) {
            const shuffled = shuffleArray(puzzleIds);
            const selected = shuffled.slice(0, room.puzzleCountPerTeam);

            for (let i = 0; i < selected.length; i++) {
                puzzleAssignments.push({
                    userId: player.userId,
                    roomId: room._id,
                    puzzleId: selected[i],
                    orderNumber: i + 1,
                    status: "unsolved",
                });
            }
        }

        // Clear any existing puzzle assignments for this room (in case of restart)
        await RoomPlayerPuzzle.deleteMany({ roomId: room._id });

        // Create all puzzle assignments
        await RoomPlayerPuzzle.insertMany(puzzleAssignments);

        // Update player statuses
        await RoomPlayer.updateMany(
            { roomId: room._id },
            { $set: { status: "playing" } }
        );

        // Start the room
        room.status = "active";
        room.startTime = new Date();
        await room.save();

        return NextResponse.json({
            success: true,
            message: "Room started! Puzzles assigned to all teams.",
            startTime: room.startTime,
        });
    } catch (error) {
        console.error("Start room error:", error);
        return NextResponse.json(
            { error: "Failed to start room" },
            { status: 500 }
        );
    }
}
