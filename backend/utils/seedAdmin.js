import mongoose from 'mongoose';
import Admin from '../model/admin.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.error('Usage: node utils/seedAdmin.js <email> <password>');
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const admin = new Admin({
      email,
      password,
      role: 'admin'
    });

    await admin.save();
    console.log(`Admin created successfully: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
