import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Bug from "@/models/Bug";
import Purchase from "@/models/Purchase";
import Rebid from "@/models/Rebid";

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { userId, teamPlayerId, bugId, price } = await request.json();

        // Validate admin
        const room = await Room.findOne({ roomId: roomCode.toUpperCase() });
        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.createdBy.toString() !== userId) {
            return NextResponse.json({ error: "Only admin can allot bugs" }, { status: 403 });
        }

        // Get the team player
        const player = await RoomPlayer.findById(teamPlayerId);
        if (!player) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Get the bug by string ID
        const bug = await Bug.findOne({ bugId });
        if (!bug) {
            return NextResponse.json({ error: "Bug not found" }, { status: 404 });
        }

        // Check if team has enough coins
        const allotPrice = price || bug.marketValue;
        if (player.coins < allotPrice) {
            return NextResponse.json({
                error: `Not enough coins. Team has ₹${player.coins}, needs ₹${allotPrice}`,
            }, { status: 400 });
        }

        // Check if bug already assigned in this room
        const existingPurchase = await Purchase.findOne({ bugId: bug._id, roomId: room._id });
        if (existingPurchase) {
            return NextResponse.json({
                error: `Bug ${bug.bugId} already allotted to team ${existingPurchase.teamName}`,
            }, { status: 400 });
        }

        // Atomically deduct coins so repeated requests cannot overspend.
        const updatedPlayer = await RoomPlayer.findOneAndUpdate(
            { _id: player._id, coins: { $gte: allotPrice } },
            { $inc: { coins: -allotPrice, bugsWon: 1 } },
            { new: true }
        );

        if (!updatedPlayer) {
            return NextResponse.json({
                error: `Not enough coins. Team has ₹${player.coins}, needs ₹${allotPrice}`,
            }, { status: 400 });
        }

        let purchase;
        try {
            purchase = await Purchase.create({
                userId: updatedPlayer.userId,
                roomId: room._id,
                bugId: bug._id,
                purchasePrice: allotPrice,
                teamName: updatedPlayer.teamName,
            });
        } catch (createErr) {
            // Duplicate-key means another request allotted this bug first.
            if (createErr?.code === 11000) {
                await RoomPlayer.findByIdAndUpdate(updatedPlayer._id, {
                    $inc: { coins: allotPrice, bugsWon: -1 },
                });

                return NextResponse.json({
                    error: `Bug ${bug.bugId} already allotted to another team`,
                }, { status: 400 });
            }

            // Roll back player state for unexpected purchase failures.
            await RoomPlayer.findByIdAndUpdate(updatedPlayer._id, {
                $inc: { coins: allotPrice, bugsWon: -1 },
            });
            throw createErr;
        }

        // If it was a rebid bug, mark it as SOLD
        await Rebid.findOneAndUpdate(
            { bugId: bug._id, roomId: room._id, status: { $ne: "SOLD" } },
            { status: "SOLD" }
        );

        return NextResponse.json({
            success: true,
            message: `${bug.bugId} allotted to ${player.teamName} for ₹${allotPrice}`,
            purchase: {
                bugId: bug.bugId,
                bugName: bug.name,
                teamName: updatedPlayer.teamName,
                price: allotPrice,
                remainingCoins: updatedPlayer.coins,
            },
        });
    } catch (error) {
        console.error("Allot bug error:", error);
        return NextResponse.json({ error: "Failed to allot bug" }, { status: 500 });
    }
}
