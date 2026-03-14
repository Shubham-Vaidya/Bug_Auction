import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PowerCard from "@/models/PowerCard";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
    try {
        await dbConnect();

        const existingCount = await PowerCard.countDocuments();
        if (existingCount >= 6) {
            return NextResponse.json({
                success: true,
                message: `Power cards already seeded (${existingCount} found)`,
                count: existingCount,
            });
        }

        const filePath = join(process.cwd(), "data", "powerCardData.json");
        const rawData = readFileSync(filePath, "utf-8");
        const powerCardData = JSON.parse(rawData);

        await PowerCard.deleteMany({});
        const result = await PowerCard.insertMany(powerCardData);

        return NextResponse.json({
            success: true,
            message: `${result.length} power cards seeded successfully`,
            count: result.length,
        });
    } catch (error) {
        console.error("Seed power cards error:", error);
        return NextResponse.json({ error: "Failed to seed power cards" }, { status: 500 });
    }
}
