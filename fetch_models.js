const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listAllModels() {
    const apiKey = "AIzaSyCGmTQAm9f_AX6sdedoVMlIrDSNj8KKY3Q";
    console.log("------------------------------------------");
    console.log("Fetching list of authorized models for this key...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // This is a direct fetch because the library's listModels might be tricky
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
