import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bugId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        roomId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
