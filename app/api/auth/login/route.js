import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Check admin credentials from env first
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (username === adminUsername && password === adminPassword) {
            // Admin login via env — ensure admin exists in DB for room creation
            await dbConnect();
            let adminUser = await User.findOne({ username: adminUsername });

            if (!adminUser) {
                adminUser = await User.create({
                    username: adminUsername,
                    teamName: "SYSTEM",
                    password: adminPassword,
                    role: "admin",
                });
            }

            return NextResponse.json({
                success: true,
                user: {
                    _id: adminUser._id,
                    username: adminUser.username,
                    teamName: adminUser.teamName,
                    role: "admin",
                },
            });
        }

        // Otherwise, check player login from DB
        await dbConnect();
        const user = await User.findOne({ username: username.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.password !== password) {
            return NextResponse.json(
                { error: "Invalid password" },
                { status: 401 }
            );
        }

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
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Failed to login" },
            { status: 500 }
        );
    }
}
