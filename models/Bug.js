import mongoose from "mongoose";

const BugSchema = new mongoose.Schema(
    {
        bugId: {
            type: String,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
        },
        marketValue: {
            type: Number,
            required: true,
        },
        difficulty: {
            type: String,
        },
        languageVersions: {
            type: Object, // key-value pair of language -> question text
            default: {}
        },
    },
    { timestamps: true }
);

export default mongoose.models.Bug || mongoose.model("Bug", BugSchema);
