import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/Room";
import RoomPlayer from "@/models/RoomPlayer";
import Purchase from "@/models/Purchase";
import PowerCardPurchase from "@/models/PowerCardPurchase";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { roomCode } = await params;
        const { searchParams } = new URL(request.url);
        const requesterUserId = searchParams.get("userId");

        // Fallback mapping in case DB bugs are older and missing languageVersions.
        let bugCodeById = new Map();
        try {
            const filePath = join(process.cwd(), "data", "bugData.json");
            const raw = readFileSync(filePath, "utf-8");
            const bugData = JSON.parse(raw);
            bugCodeById = new Map(
                bugData.map((b) => [b.bugId, b.languageVersions || {}])
            );
        } catch (e) {
            console.error("Failed to load bugData fallback:", e);
        }

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
                const isRequester = requesterUserId && String(p.userId?._id || p.userId) === String(requesterUserId);
                const purchases = await Purchase.find({ userId: p.userId?._id, roomId: room._id })
                    .populate("bugId", "bugId name description marketValue difficulty tag languageVersions")
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
                        ...(function () {
                            const dbCode = pr.bugId?.languageVersions || {};
                            const fallbackCode = bugCodeById.get(pr.bugId?.bugId) || {};
                            const mergedCode = Object.keys(dbCode).length > 0 ? dbCode : fallbackCode;
                            return {
                                bugId: pr.bugId?.bugId,
                                bugName: pr.bugId?.name,
                                description: pr.bugId?.description,
                                price: pr.purchasePrice,
                                difficulty: pr.bugId?.difficulty,
                                tag: pr.bugId?.tag,
                                languageVersions: isRequester ? mergedCode : {},
                            };
                        })(),
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
