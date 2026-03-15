const crypto = require('crypto');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

module.exports = (req, res) => {
    const { email, password } = req.body;

    // Ensure both email and password are provided
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    // Check if the provided email and password match the admin credentials
    const isValidEmail = crypto.timingSafeEqual(Buffer.from(email), Buffer.from(ADMIN_EMAIL));
    const isValidPassword = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));

    if (isValidEmail && isValidPassword) {
        return res.status(200).send('Login successful!');
    } else {
        return res.status(401).send('Invalid email or password.');
    }
};