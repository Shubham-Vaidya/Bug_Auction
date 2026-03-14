import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Purchase from "@/models/Purchase";
import PowerCardPurchase from "@/models/PowerCardPurchase";

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
                    .populate("bugId", "bugId name description marketValue difficulty tag")
                    .lean();
                const powerCardPurchases = await PowerCardPurchase.find({ userId: p.userId?._id, roomId: room._id })
                    .populate("powerCardId", "cardId name description marketValue rarity tag")
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
                        description: pr.bugId?.description,
                        price: pr.purchasePrice,
                        difficulty: pr.bugId?.difficulty,
                        tag: pr.bugId?.tag,
                    })),
                    powerCardPurchases: powerCardPurchases.map((pc) => ({
                        cardId: pc.powerCardId?.cardId,
                        cardName: pc.powerCardId?.name,
                        description: pc.powerCardId?.description,
                        price: pc.purchasePrice,
                        rarity: pc.powerCardId?.rarity,
                        tag: pc.powerCardId?.tag,
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
