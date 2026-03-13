import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import PowerCard from "@/models/PowerCard";
import PowerCardPurchase from "@/models/PowerCardPurchase";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId, teamPlayerId, cardId, price } = await request.json();

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Only admin can allot power cards" }, { status: 403 });
        }

        if (room.status !== "ENDED") {
            return NextResponse.json(
                { error: "Power card allotment is allowed only after bug auction ends" },
                { status: 400 }
            );
        }

        const player = await RoomPlayer.findById(teamPlayerId);
        if (!player) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const card = await PowerCard.findOne({ cardId });
        if (!card) {
            return NextResponse.json({ error: "Power card not found" }, { status: 404 });
        }

        const allotPrice = price || card.marketValue;
        if (player.coins < allotPrice) {
            return NextResponse.json({
                error: `Not enough coins. Team has ₹${player.coins}, needs ₹${allotPrice}`,
            }, { status: 400 });
        }

        const existingPurchase = await PowerCardPurchase.findOne({
            powerCardId: card._id,
            roomId: room._id,
        });
        if (existingPurchase) {
            return NextResponse.json({
                error: `Power card ${card.cardId} already allotted to team ${existingPurchase.teamName}`,
            }, { status: 400 });
        }

        player.coins -= allotPrice;
        await player.save();

        const purchase = await PowerCardPurchase.create({
            userId: player.userId,
            roomId: room._id,
            powerCardId: card._id,
            purchasePrice: allotPrice,
            teamName: player.teamName,
        });

        return NextResponse.json({
            success: true,
            message: `${card.cardId} allotted to ${player.teamName} for ₹${allotPrice}`,
            purchase: {
                cardId: card.cardId,
                cardName: card.name,
                teamName: player.teamName,
                price: allotPrice,
                remainingCoins: player.coins,
                purchaseId: purchase._id,
            },
        });
    } catch (error) {
        console.error("Allot power card error:", error);
        return NextResponse.json({ error: "Failed to allot power card" }, { status: 500 });
    }
}
