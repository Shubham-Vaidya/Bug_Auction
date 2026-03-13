import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() })
            .setOptions({ strictPopulate: false })
            .populate("activeBug", "bugId name description marketValue difficulty tag")
            .populate("activePowerCard", "cardId name description marketValue rarity tag");
        
        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            room: {
                _id: room._id,
                roomId: room.roomId,
                roomName: room.roomName,
                coinsPerTeam: room.coinsPerTeam,
                status: room.status,
                createdAt: room.createdAt,
                activeBug: room.activeBug || null,
                activePowerCard: room.activePowerCard || null,
                rebiddingStatus: room.rebiddingStatus || "INACTIVE",
                powerCardStatus: room.powerCardStatus || "WAITING",
            },
        });
    } catch (error) {
        console.error("Room status error:", error);
        return NextResponse.json(
            { error: "Failed to get room status" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { status, userId, scope = "BUG" } = await request.json();

        if (!status || !userId) {
            return NextResponse.json({ error: "Missing status or userId" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Verify admin
        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (scope === "POWER") {
            if (room.status !== "ENDED") {
                return NextResponse.json(
                    { error: "Bug auction must end before power card phase starts" },
                    { status: 400 }
                );
            }
            room.powerCardStatus = status;
        } else {
            room.status = status;
        }
        await room.save();

        return NextResponse.json({ success: true, message: `${scope} status updated to ${status}` });
    } catch (error) {
        console.error("Update room status error:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}
