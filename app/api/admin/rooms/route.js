import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Get all rooms created by this admin
        const rooms = await Room.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean();

        // For each room, get team counts
        const roomsWithTeams = await Promise.all(
            rooms.map(async (room) => {
                const teamCount = await RoomPlayer.countDocuments({ roomId: room._id });
                return {
                    ...room,
                    teamCount,
                };
            })
        );

        return NextResponse.json({
            success: true,
            rooms: roomsWithTeams,
        });
    } catch (error) {
        console.error("Admin rooms error:", error);
        return NextResponse.json(
            { error: "Failed to get rooms" },
            { status: 500 }
        );
    }
}
