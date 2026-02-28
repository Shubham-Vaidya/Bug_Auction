import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        teamName: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "team",
            enum: ["admin", "team"],
        },
        language: {
            type: String,
        },
        roomId: {
            type: String,
        },
        wallet: {
            type: Number,
            default: 5000,
        },
        bugsWon: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Bug",
            },
        ]
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
