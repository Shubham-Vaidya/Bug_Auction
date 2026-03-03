import mongoose from "mongoose";

const BugSchema = new mongoose.Schema(
    {
        bugId: {
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
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard", "Expert"],
            default: "Medium",
        },
        tag: {
            type: String,
            default: "🟡",
        },
        languageVersions: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

export default mongoose.models.Bug || mongoose.model("Bug", BugSchema);
