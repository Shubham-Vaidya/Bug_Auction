const mongoose = require("mongoose");

async function checkSubmissions() {
    const MONGODB_URI = "mongodb+srv://barbiee3737_db_user:OlMqO8GFZbq9rx04@cluster0.lrkwfqq.mongodb.net/?appName=Cluster0";
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const s = await mongoose.connection.db.collection("submissions")
            .findOne({}, { sort: { updatedAt: -1 } });

        if (s) {
            console.log(`Latest Submission:`);
            console.log(`Team: ${s.teamName}, Bug: ${s.bugTitle}`);
            console.log(`Updated: ${s.updatedAt}`);
            console.log(`Result: ${s.geminiResult}`);
            console.log(`Analysis: ${s.geminiAnalysis}`);
        } else {
            console.log("No submissions found.");
        }

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSubmissions();
