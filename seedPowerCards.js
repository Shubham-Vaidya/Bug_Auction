const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Manually load MONGODB_URI from .env.local
const envPath = path.join(__dirname, ".env.local");
let MONGODB_URI = "";
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) MONGODB_URI = match[1].trim();
}
MONGODB_URI = MONGODB_URI || "mongodb://127.0.0.1:27017/bug_auction";

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

const PowerCard = mongoose.models.PowerCard || mongoose.model("PowerCard", PowerCardSchema);
// MONGODB_URI is already defined above

async function seedPowerCards() {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is not defined in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const dataPath = path.join(__dirname, "data", "powerCardData.json");
        const rawData = fs.readFileSync(dataPath, "utf8");
        const powerCards = JSON.parse(rawData);

        console.log(`Found ${powerCards.length} cards in JSON. Syncing...`);

        for (const card of powerCards) {
            await PowerCard.findOneAndUpdate(
                { cardId: card.cardId },
                {
                    name: card.name,
                    description: card.description,
                    marketValue: card.marketValue,
                    rarity: card.rarity,
                    tag: card.tag
                },
                { upsert: true, new: true }
            );
        }

        console.log("Power cards seeded/updated successfully");
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

seedPowerCards();
