'use strict';

const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');

const seedDatabase = async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();

    // Seed admin user
    const adminUser = new User({
        username: 'admin',
        password: 'adminpassword', // Ideally should be hashed
        role: 'admin'
    });
    await adminUser.save();

    // Seed default services
    const services = [
        new Service({ name: 'Service 1', description: 'Description for Service 1' }),
        new Service({ name: 'Service 2', description: 'Description for Service 2' }),
        new Service({ name: 'Service 3', description: 'Description for Service 3' }),
    ];
    await Service.insertMany(services);

    console.log('Database seeded successfully');
    mongoose.connection.close();
};

seedDatabase();
