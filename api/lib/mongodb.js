const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

let client;
let clientPromise;

if (process.env.VERCEL_ENV) {
    // In Production Mode
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
} else {
    // In Development Mode
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}

module.exports = clientPromise;
