const mongoose = require("mongoose");
const { bugsData } = require("./data/bugsData");

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

const Bug = mongoose.models.Bug || mongoose.model("Bug", BugSchema);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bug_auction";

async function seedBugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Bug.deleteMany({});
    console.log("Old bugs removed");

    await Bug.insertMany(bugsData);
    console.log("New bugs inserted successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedBugs();
