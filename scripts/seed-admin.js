/**
 * Seed Admin Script
 * Run: node scripts/seed-admin.js
 *
 * Reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD from environment variables.
 * Creates an admin user only if no admin currently exists in the database.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Error: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  if (!MONGO_URI) {
    console.error('Error: MONGO_URI must be set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}. Skipping seed.`);
      process.exit(0);
    }

    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    });

    console.log(`Admin created successfully: ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
