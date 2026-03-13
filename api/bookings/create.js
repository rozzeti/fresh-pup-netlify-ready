const { MongoClient } = require('mongodb');

const uri = 'your_mongodb_connection_string'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const bookingData = req.body; // Expecting booking data in request body
            
            await client.connect();
            const database = client.db('your_database_name'); // Replace with your database name
            const bookingsCollection = database.collection('bookings');

            const result = await bookingsCollection.insertOne(bookingData);
            
            res.status(201).json({ message: 'Booking created successfully', bookingId: result.insertedId });
        } catch (error) {
            res.status(500).json({ message: 'Error saving booking', error: error.message });
        } finally {
            await client.close();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}