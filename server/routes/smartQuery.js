const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const { pipeline } = require('@xenova/transformers');
const { verifyToken } = require('../middleware/auth');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grievance-portal';

// Initialize the text generation pipeline
let textGenerator;
async function initializePipeline() {
    if (!textGenerator) {
        textGenerator = await pipeline('text-generation', 'Xenova/gpt2');
    }
}

// Initialize the pipeline when the server starts
initializePipeline().catch(console.error);

router.post('/', verifyToken, async (req, res) => {
    try {
        const { query } = req.body;

        // Connect to MongoDB
        const client = await MongoClient.connect(mongoURI);
        const db = client.db();

        // Get relevant data from MongoDB based on the query
        const grievances = await db.collection('grievances').find({}).toArray();
        const resources = await db.collection('resources').find({}).toArray();
        const users = await db.collection('users').find({}).toArray();

        // Prepare context for the LLM
        const context = {
            grievances: grievances.slice(0, 5), // Limit to 5 most recent
            resources: resources.slice(0, 5),
            users: users.slice(0, 5)
        };

        // Generate response using the LLM
        const prompt = `Context: ${JSON.stringify(context)}\n\nUser Query: ${query}\n\nAssistant:`;
        const response = await textGenerator(prompt, {
            max_length: 200,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.2
        });

        // Close MongoDB connection
        await client.close();

        // Send the response
        res.json({ response: response[0].generated_text });
    } catch (error) {
        console.error('Error in smart query:', error);
        res.status(500).json({ error: 'Failed to process query' });
    }
});

module.exports = router; 