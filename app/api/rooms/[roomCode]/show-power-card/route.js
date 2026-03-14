import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import PowerCard from "@/models/PowerCard";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId, cardId } = await request.json();

        if (!userId || !cardId) {
            return NextResponse.json(
                { error: "userId and cardId are required" },
                { status: 400 }
            );
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== userId) {
            return NextResponse.json(
                { error: "Only the room admin can reveal power cards" },
                { status: 403 }
            );
        }

        if (room.status !== "ENDED") {
            return NextResponse.json(
                { error: "Power card auction starts only after bug auction ends" },
                { status: 400 }
            );
        }

        const card = await PowerCard.findOne({ cardId });
        if (!card) {
            return NextResponse.json({ error: "Power card not found" }, { status: 404 });
        }

        room.activePowerCard = card._id;
        await room.save();

        return NextResponse.json({
            success: true,
            message: `Power card ${card.cardId} is now live`,
            activePowerCard: {
                _id: card._id,
                cardId: card.cardId,
                name: card.name,
                description: card.description,
                marketValue: card.marketValue,
                rarity: card.rarity,
                tag: card.tag,
            },
        });
    } catch (error) {
        console.error("Show power card error:", error);
        return NextResponse.json(
            { error: "Failed to reveal power card" },
            { status: 500 }
        );
    }
}
