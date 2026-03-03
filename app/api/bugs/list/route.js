import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bug from "@/models/Bug";

export async function GET() {
    try {
        await dbConnect();
        const bugs = await Bug.find({}).sort({ marketValue: -1 }).lean();
        return NextResponse.json({ success: true, bugs });
    } catch (error) {
        console.error("List bugs error:", error);
        return NextResponse.json({ error: "Failed to list bugs" }, { status: 500 });
    }
}
