const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    const apiKey = "AIzaSyCGmTQAm9f_AX6sdedoVMlIrDSNj8KKY3Q";
    console.log("------------------------------------------");
    console.log("Checking GEMINI_API_KEY...");
    console.log("API Key found (starts with):", apiKey.substring(0, 5) + "...");

    try {
        console.log("Initializing Gemini Pro (flash)...");
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
