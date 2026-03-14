import mongoose from "mongoose";

const PowerCardPurchaseSchema = new mongoose.Schema(
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
        powerCardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PowerCard",
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        teamName: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.PowerCardPurchase || mongoose.model("PowerCardPurchase", PowerCardPurchaseSchema);
