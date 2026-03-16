const mongoose = require('mongoose');
const Admin = require('./models/Admin'); // Assuming you have an Admin model set up

const createAdminUser = async () => {
  const adminUser = new Admin({
    username: 'admin',
    password: 'securePassword123', // Ensure to hash passwords in production!
    email: 'admin@example.com',
    role: 'admin'
  });

  try {
    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdminUser();