import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json(
            { success: true, message: "Database Connected" },
            { status: 200 }
        );
    } catch (error) {
        console.error("DB Connection Error:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
