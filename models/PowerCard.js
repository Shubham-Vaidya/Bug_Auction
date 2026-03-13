import mongoose from "mongoose";

const PowerCardSchema = new mongoose.Schema(
    {
        cardId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        marketValue: {
            type: Number,
            required: true,
        },
        rarity: {
            type: String,
            enum: ["Common", "Rare", "Epic", "Legendary"],
            default: "Common",
        },
        tag: {
            type: String,
            default: "🟦",
        },
    },
    { timestamps: true }
);

export default mongoose.models.PowerCard || mongoose.model("PowerCard", PowerCardSchema);
