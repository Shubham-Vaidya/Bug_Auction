import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["WAITING", "LIVE", "LOCKED", "SOLVING", "ENDED"],
            default: "WAITING",
        },
        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        currentBug: {
            type: String, // String to store the bug ID (e.g., 'BUG-404')
        },
    },
    { timestamps: true }
);

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
