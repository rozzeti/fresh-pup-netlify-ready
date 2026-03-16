// api/admin/seed.js

const mongoose = require('mongoose');
const Admin = require('../models/Admin'); // Adjust the path as necessary
const Service = require('../models/Service'); // Adjust the path as necessary

const seedAdmin = async () => {
    const adminData = {
        username: 'admin',
        password: 'securepassword', // Make sure to hash passwords in a real app
        email: 'admin@example.com',
    };

    const existingAdmin = await Admin.findOne({ username: adminData.username });
    if (!existingAdmin) {
        await Admin.create(adminData);
        console.log('Admin user seeded.');
    } else {
        console.log('Admin user already exists.');
    }
};

const seedServices = async () => {
    const servicesData = [
        { name: 'Service 1', description: 'Description of Service 1' },
        { name: 'Service 2', description: 'Description of Service 2' },
        { name: 'Service 3', description: 'Description of Service 3' },
    ];

    for (const service of servicesData) {
        const existingService = await Service.findOne({ name: service.name });
        if (!existingService) {
            await Service.create(service);
            console.log(`Service '${service.name}' seeded.`);
        } else {
            console.log(`Service '${service.name}' already exists.`);
        }
    }
};

const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true }); // Replace with your DB connection string
        await seedAdmin();
        await seedServices();
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

seedDatabase();