// Seed script — creates an admin user and sample data for testing
// Usage: node utils/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@aroundyou.com',
      password: 'admin123',
      role: 'admin',
      isApproved: true,
    });

    // Create a sample provider
    const provider = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@provider.com',
      password: 'password123',
      phone: '9876543210',
      role: 'provider',
      isApproved: true,
    });

    // Create a sample customer
    const customer = await User.create({
      name: 'Priya Patel',
      email: 'priya@customer.com',
      password: 'password123',
      phone: '9876543211',
      role: 'customer',
      isApproved: true,
    });

    // Create sample services
    const services = await Service.insertMany([
      {
        provider: provider._id,
        title: 'Professional Plumbing Services',
        description: 'Expert plumbing repair, installation, and maintenance. Available for emergencies.',
        category: 'plumber',
        price: 500,
        priceType: 'hourly',
        location: 'Mumbai',
      },
      {
        provider: provider._id,
        title: 'Electrical Wiring & Repair',
        description: 'Complete electrical solutions including wiring, switch repair, and appliance installation.',
        category: 'electrician',
        price: 400,
        priceType: 'hourly',
        location: 'Mumbai',
      },
      {
        provider: provider._id,
        title: 'Deep Home Cleaning',
        description: 'Thorough cleaning service for your entire home. Includes kitchen, bathroom, and living areas.',
        category: 'cleaner',
        price: 2000,
        priceType: 'fixed',
        location: 'Mumbai',
      },
      {
        provider: provider._id,
        title: 'Wall Painting & Texturing',
        description: 'Professional wall painting with premium paints. Texture and design options available.',
        category: 'painter',
        price: 3000,
        priceType: 'fixed',
        location: 'Delhi',
      },
      {
        provider: provider._id,
        title: 'Furniture Repair & Custom Work',
        description: 'Expert carpentry for furniture repair, custom shelving, and woodwork.',
        category: 'carpenter',
        price: 600,
        priceType: 'hourly',
        location: 'Bangalore',
      },
    ]);

    console.log('Seed data created successfully!');
    console.log(`Admin:    admin@aroundyou.com / admin123`);
    console.log(`Provider: rahul@provider.com / password123`);
    console.log(`Customer: priya@customer.com / password123`);
    console.log(`Services: ${services.length} created`);

    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
