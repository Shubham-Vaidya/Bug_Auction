const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env.local") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("------------------------------------------");
    console.log("Listing available models...");

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in .env.local");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-pro"
        ];

        for (const modelName of modelsToTry) {
            console.log(`Trying model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`  SUCCESS with ${modelName}: ${response.text().substring(0, 20)}...`);
                break;
            } catch (err) {
                console.log(`  FAILED with ${modelName}: ${err.message.substring(0, 50)}`);
            }
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
    console.log("------------------------------------------");
}

listModels();
