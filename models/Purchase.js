import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
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
        bugId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
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

// A bug can only be allotted once per room.
PurchaseSchema.index({ roomId: 1, bugId: 1 }, { unique: true });

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
