import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        roomName: {
            type: String,
            required: true,
        },
        coinsPerTeam: {
            type: Number,
            required: true,
            default: 5000,
        },
        status: {
            type: String,
            enum: ["WAITING", "LIVE", "ENDED"],
            default: "WAITING",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        activeBug: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);
