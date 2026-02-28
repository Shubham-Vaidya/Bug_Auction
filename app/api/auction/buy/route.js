import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import User from "@/models/User";
import Purchase from "@/models/Purchase";

export async function POST(req) {
    try {
        await dbConnect();

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { teamId, bugId, purchasePrice } = body;

        if (!teamId || !bugId || purchasePrice === undefined) {
            return NextResponse.json(
                { success: false, error: "Missing required fields." },
                { status: 400 }
            );
        }

        // Find user to get roomId
        const user = await User.findById(teamId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Team/User not found." },
                { status: 404 }
            );
        }

        const roomId = user.roomId;

        // Check if room is LIVE
        const room = await Room.findOne({ roomId });
        if (!room) {
            return NextResponse.json(
                { success: false, error: "Room not found." },
                { status: 404 }
            );
        }

        if (room.status !== "LIVE") {
            return NextResponse.json(
                { success: false, error: "Auction is not live in this room." },
                { status: 400 }
            );
        }

        // Deduct wallet from User
        if (user.wallet < purchasePrice) {
            return NextResponse.json(
                { success: false, error: "Insufficient wallet balance." },
                { status: 400 }
            );
        }

        user.wallet -= purchasePrice;

        // Add bug to user.bugsWon
        user.bugsWon.push(bugId);
        await user.save();

        // Create Purchase entry
        const purchase = await Purchase.create({
            teamId,
            bugId,
            purchasePrice,
            roomId
        });

        return NextResponse.json(
            { success: true, message: "Purchase successful", purchase, user },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating purchase:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
