const { MongoClient } = require('mongodb');

// MongoDB Connection URI
const uri = 'mongodb://burntwithsalt:Passwordforthis2035!@127.0.0.1:27017/admin';

// Create a new MongoClient
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(); // Default database
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
}

module.exports = { connectToDatabase, getDb };
