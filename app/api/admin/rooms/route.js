import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Purchase from "@/models/Purchase";
import PowerCardPurchase from "@/models/PowerCardPurchase";
import Rebid from "@/models/Rebid";
import Submission from "@/models/Submission";

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

export async function DELETE(request) {
    try {
        await dbConnect();
        const { roomId, userId } = await request.json();

        if (!roomId || !userId) {
            return NextResponse.json(
                { error: "roomId and userId are required" },
                { status: 400 }
            );
        }

        const room = await Room.findById(roomId);
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        if (room.createdBy?.toString() !== userId) {
            return NextResponse.json(
                { error: "You are not allowed to delete this room" },
                { status: 403 }
            );
        }

        await Promise.all([
            RoomPlayer.deleteMany({ roomId: room._id }),
            Purchase.deleteMany({ roomId: room._id }),
            PowerCardPurchase.deleteMany({ roomId: room._id }),
            Rebid.deleteMany({ roomId: room._id }),
            Submission.deleteMany({ roomId: room._id }),
        ]);

        await Room.deleteOne({ _id: room._id });

        return NextResponse.json({
            success: true,
            message: "Room deleted permanently",
        });
    } catch (error) {
        console.error("Delete room error:", error);
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        );
    }
}
