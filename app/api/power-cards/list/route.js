import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PowerCard from "@/models/PowerCard";

export async function GET() {
    try {
        await dbConnect();
        const powerCards = await PowerCard.find({}).sort({ marketValue: -1 }).lean();
        return NextResponse.json({ success: true, powerCards });
    } catch (error) {
        console.error("List power cards error:", error);
        return NextResponse.json({ error: "Failed to list power cards" }, { status: 500 });
    }
}
