import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bug from "@/models/Bug";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
    try {
        await dbConnect();

        const existingCount = await Bug.countDocuments();
        if (existingCount >= 10) {
            return NextResponse.json({
                success: true,
                message: `Bugs already seeded (${existingCount} found)`,
                count: existingCount,
            });
        }

        // Read bug data from JSON file
        const filePath = join(process.cwd(), "data", "bugData.json");
        const rawData = readFileSync(filePath, "utf-8");
        const bugData = JSON.parse(rawData);

        // Clear existing
        await Bug.deleteMany({});

        // Insert
        const result = await Bug.insertMany(bugData);

        return NextResponse.json({
            success: true,
            message: `${result.length} bugs seeded successfully`,
            count: result.length,
        });
    } catch (error) {
        console.error("Seed bugs error:", error);
        return NextResponse.json({ error: "Failed to seed bugs" }, { status: 500 });
    }
}
