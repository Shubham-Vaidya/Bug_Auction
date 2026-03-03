import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
    try {
        await dbConnect();
        const { username, teamName, password } = await request.json();

        if (!username || !teamName || !password) {
            return NextResponse.json(
                { error: "Username, team name, and password are required" },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: "Username already taken" },
                { status: 409 }
            );
        }

        const user = await User.create({
            username: username.toLowerCase(),
            teamName: teamName.trim(),
            password,
            role: "player",
        });

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                teamName: user.teamName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
