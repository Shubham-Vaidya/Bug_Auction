const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, ".env.local") });

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("------------------------------------------");
    console.log("Fetching list of authorized models for this key...");

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in .env.local");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Authorized models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } else {
            console.log("No models returned. Response:", JSON.stringify(data));
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
    console.log("------------------------------------------");
}

listAllModels();
