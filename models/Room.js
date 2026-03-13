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
        activePowerCard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PowerCard",
            default: null,
        },
        rebiddingStatus: {
            type: String,
            enum: ["INACTIVE", "ACCEPTING", "AUCTION"],
            default: "INACTIVE",
        },
        powerCardStatus: {
            type: String,
            enum: ["WAITING", "LIVE", "ENDED"],
            default: "WAITING",
        },
    },
    { timestamps: true }
);

const RoomModel = mongoose.models.Room || mongoose.model("Room", RoomSchema);

// In Next.js dev/hot-reload, an old compiled model can survive schema edits.
// Ensure new fields are present on cached models to avoid StrictPopulateError.
if (!RoomModel.schema.path("activePowerCard") || !RoomModel.schema.path("powerCardStatus")) {
    RoomModel.schema.add({
        activePowerCard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PowerCard",
            default: null,
        },
        powerCardStatus: {
            type: String,
            enum: ["WAITING", "LIVE", "ENDED"],
            default: "WAITING",
        },
    });
}

export default RoomModel;
