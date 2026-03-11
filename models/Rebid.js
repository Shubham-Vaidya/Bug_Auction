import mongoose from "mongoose";

const RebidSchema = new mongoose.Schema(
    {
        bugId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bug",
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        previousOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        previousTeamName: {
            type: String,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["WAITING", "AUCTIONING", "SOLD"],
            default: "WAITING",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Rebid || mongoose.model("Rebid", RebidSchema);
