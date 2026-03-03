import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Purchase from "@/models/Purchase";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }


        const players = await RoomPlayer.find({ roomId: room._id })
            .populate("userId", "username teamName")
            .lean();

        // Get purchases for each player
        const teams = await Promise.all(
            players.map(async (p) => {
                const purchases = await Purchase.find({ userId: p.userId?._id, roomId: room._id })
                    .populate("bugId", "bugId name marketValue difficulty tag")
                    .lean();
                return {
                    _id: p._id,
                    odid: p.userId?._id,
                    username: p.userId?.username,
                    teamName: p.teamName,
                    coins: p.coins,
                    bugsWon: p.bugsWon,
                    status: p.status,
                    purchases: purchases.map((pr) => ({
                        bugId: pr.bugId?.bugId,
                        bugName: pr.bugId?.name,
                        price: pr.purchasePrice,
                        difficulty: pr.bugId?.difficulty,
                        tag: pr.bugId?.tag,
                    })),
                };
            })
        );

        return NextResponse.json({ success: true, teams });
    } catch (error) {
        console.error("Get teams error:", error);
        return NextResponse.json({ error: "Failed to get teams" }, { status: 500 });
    }
}
