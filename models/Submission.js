import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
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
        teamName: {
            type: String,
            required: true,
        },
        bugTitle: {
            type: String,
            required: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        solutionCode: {
            type: String,
            default: "",
        },
        adminScore: {
            type: Number,
            default: null,
        },
        profit: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "scored"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Prevent duplicate submissions per team/room/bug
SubmissionSchema.index({ userId: 1, roomId: 1, bugId: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
