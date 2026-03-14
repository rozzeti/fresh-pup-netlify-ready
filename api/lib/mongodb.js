const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    client = new MongoClient(uri);
    clientPromise = client.connect();
} else {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}

module.exports = clientPromise;
