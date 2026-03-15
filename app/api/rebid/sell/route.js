import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Purchase from "@/models/Purchase";
import Submission from "@/models/Submission";
import Rebid from "@/models/Rebid";
import Bug from "@/models/Bug";
import { broadcastRoomEvent } from "@/lib/realtime";

export async function POST(request) {
    try {
        await dbConnect();
        const { userId, roomCode, bugStringId } = await request.json();

        if (!userId || !roomCode || !bugStringId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.rebiddingStatus !== "ACCEPTING") {
            return NextResponse.json({ error: "Rebidding is not accepting sales right now" }, { status: 400 });
        }

        const bug = await Bug.findOne({ bugId: bugStringId });
        if (!bug) {
            return NextResponse.json({ error: "Bug not found" }, { status: 404 });
        }

        // Check if solution submitted
        const submission = await Submission.findOne({ userId, roomId: room._id, bugId: bug._id });
        if (submission) {
            return NextResponse.json({ error: "Cannot sell a bug with a submitted solution" }, { status: 400 });
        }

        // Find purchase
        const purchase = await Purchase.findOne({ userId, roomId: room._id, bugId: bug._id });
        if (!purchase) {
            return NextResponse.json({ error: "You don't own this bug" }, { status: 404 });
        }

        const refundAmount = purchase.purchasePrice;

        // Find player to refund
        const player = await RoomPlayer.findOne({ userId, roomId: room._id });
        if (!player) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        // Transaction
        player.coins += refundAmount;
        player.bugsWon = Math.max(0, player.bugsWon - 1);
        await player.save();

        // Create rebid record
        await Rebid.create({
            bugId: bug._id,
            roomId: room._id,
            previousOwner: userId,
            previousTeamName: purchase.teamName,
            originalPrice: refundAmount,
            status: "WAITING",
        });

        // Delete purchase
        await Purchase.deleteOne({ _id: purchase._id });

        await broadcastRoomEvent(room.roomId, "rebidPoolUpdated", {
            bugId: bug.bugId,
            previousTeamName: purchase.teamName,
            refundAmount,
        });

        return NextResponse.json({
            success: true,
            message: `Bug sold for rebid. ₹${refundAmount} refunded.`,
        });
    } catch (error) {
        console.error("Sell for rebid error:", error);
        return NextResponse.json({ error: "Failed to sell bug" }, { status: 500 });
    }
}
