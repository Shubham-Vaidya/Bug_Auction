import mongoose from "mongoose";

const RoomPlayerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        teamName: {
            type: String,
            required: true,
        },
        coins: {
            type: Number,
            required: true,
            default: 5000,
        },
        bugsWon: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["online", "idle"],
            default: "online",
        },
    },
    { timestamps: true }
);

RoomPlayerSchema.index({ userId: 1, roomId: 1 }, { unique: true });

export default mongoose.models.RoomPlayer || mongoose.model("RoomPlayer", RoomPlayerSchema);
