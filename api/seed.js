const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');

const seedAdminUser = async () => {
    const adminUser = new User({
        username: 'admin',
        password: 'adminPassword',
        email: 'admin@example.com',
        role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user seeded.');
};

const seedDefaultServices = async () => {
    const services = [
        { name: 'Service 1', description: 'Description for Service 1' },
        { name: 'Service 2', description: 'Description for Service 2' },
        { name: 'Service 3', description: 'Description for Service 3' }
    ];

    await Service.insertMany(services);
    console.log('Default services seeded.');
};

const seedDatabase = async () => {
    await seedAdminUser();
    await seedDefaultServices();
    mongoose.connection.close();
};

mongoose.connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database.');
        seedDatabase();
    })
    .catch(err => console.error('Database connection error:', err));
