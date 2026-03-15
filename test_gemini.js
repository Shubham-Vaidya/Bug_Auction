const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env.local") });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("------------------------------------------");
    console.log("Checking GEMINI_API_KEY...");

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY not found in .env.local");
        return;
    }

    try {
        console.log("Initializing Gemini...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Please respond with exactly one word: 'SUCCESS'";
        console.log("Sending test prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log("Raw Response:", text);
        if (text.toUpperCase().includes("SUCCESS")) {
            console.log("GEMINI API TEST PASSED!");
        } else {
            console.log("GEMINI API TEST FAILED (Unexpected response)");
        }
    } catch (error) {
        console.error("GEMINI API TEST FAILED (Error):", error.message);
    }
    console.log("------------------------------------------");
}

testGemini();
