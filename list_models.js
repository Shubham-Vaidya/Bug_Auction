const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = "AIzaSyCGmTQAm9f_AX6sdedoVMlIrDSNj8KKY3Q";
    console.log("------------------------------------------");
    console.log("Listing available models...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Use the underlying client to list models if possible, 
        // or just try different names.
        // Actually, the easiest is to just try a few common ones.
        
        const modelsToTry = [
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-1.5-pro-latest",
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
