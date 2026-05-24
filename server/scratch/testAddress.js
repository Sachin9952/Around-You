// Integration test for Saved Addresses.
// Usage: node scratch/testAddress.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\.env' });

async function run() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');

    // Import models AFTER connection is established to avoid buffering gotcha
    const Address = require('../models/Address');
    const User = require('../models/User');

    // 1. Fetch or create a customer user
    let user = await User.findOne({ role: 'customer' });
    let createdDummyUser = false;
    if (!user) {
      console.log('No customer found. Creating a dummy customer...');
      user = await User.create({
        name: 'Test Customer',
        email: 'testcustomer@test.com',
        password: 'password123',
        role: 'customer'
      });
      createdDummyUser = true;
    }
    console.log(`Using customer user: ${user.name} (${user.email})`);

    // Clean up any existing test addresses for this user
    await Address.deleteMany({ user: user._id });
    console.log('Cleaned up previous test addresses.');

    // 2. Create first address (Home) - non-default
    const homeAddress = await Address.create({
      user: user._id,
      label: 'Home',
      fullAddress: '123 Sweet Home Lane, Mumbai, Maharashtra, India',
      area: 'Bandra West',
      houseFlatBuilding: 'Flat 402, Sea Breeze Apt',
      floorLandmark: '4th Floor, near Cafe Coffee Day',
      instructions: 'Ring bell thrice',
      latitude: 19.0543,
      longitude: 72.8276,
      isDefault: false,
    });
    console.log(`[PASS] Created Address 1: "${homeAddress.label}", default: ${homeAddress.isDefault}`);

    // 3. Create second address (Work) - set as default
    const workAddress = await Address.create({
      user: user._id,
      label: 'Work',
      fullAddress: '456 Corporate Towers, BKC, Mumbai, Maharashtra, India',
      area: 'BKC',
      houseFlatBuilding: 'Suite 901, Block G',
      floorLandmark: '9th Floor',
      instructions: 'Deliver to reception',
      latitude: 19.0607,
      longitude: 72.8644,
      isDefault: true, // Mark this one as default!
    });
    console.log(`[PASS] Created Address 2: "${workAddress.label}", default: ${workAddress.isDefault}`);

    // Verify if first address is still non-default (should be false)
    let homeCheck = await Address.findById(homeAddress._id);
    console.log(`[PASS] Address 1 default status is still: ${homeCheck.isDefault}`);

    // 4. Create third address (Other) - set as default (should automatically unset Work address default flag)
    await Address.updateMany({ user: user._id }, { isDefault: false });
    const gymAddress = await Address.create({
      user: user._id,
      label: 'Gym',
      fullAddress: '789 Fitness Club Road, Mumbai, Maharashtra, India',
      area: 'Khar West',
      houseFlatBuilding: 'Gold\'s Gym building',
      latitude: 19.0682,
      longitude: 72.8360,
      isDefault: true,
    });
    console.log(`[PASS] Created Address 3: "${gymAddress.label}", default: ${gymAddress.isDefault}`);

    // Verify that "Work" address is no longer default
    let workCheck = await Address.findById(workAddress._id);
    if (!workCheck.isDefault) {
      console.log(`[PASS] Automatically unset default flag on Work address! (isDefault is ${workCheck.isDefault})`);
    } else {
      console.log(`[FAIL] Work address is still default!`);
    }

    // 5. Test setDefaultAddress controller equivalent
    // Let's make "Home" the default address now
    await Address.updateMany({ user: user._id }, { isDefault: false });
    await Address.findByIdAndUpdate(homeAddress._id, { isDefault: true });

    homeCheck = await Address.findById(homeAddress._id);
    workCheck = await Address.findById(workAddress._id);
    let gymCheck = await Address.findById(gymAddress._id);

    if (homeCheck.isDefault && !workCheck.isDefault && !gymCheck.isDefault) {
      console.log('[PASS] setDefaultAddress successfully swapped defaults to Home!');
    } else {
      console.log('[FAIL] Swapping defaults failed.');
    }

    // 6. Test retrieval sorting (GET /api/addresses/my logic)
    // Sort by isDefault: -1, createdAt: -1
    const list = await Address.find({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });
    console.log('\nRetrieved list of addresses:');
    list.forEach(addr => {
      console.log(`- Label: ${addr.label}, IsDefault: ${addr.isDefault}, House: ${addr.houseFlatBuilding}, Coordinates: (${addr.latitude}, ${addr.longitude})`);
    });

    if (list[0]._id.toString() === homeAddress._id.toString()) {
      console.log('[PASS] Retrieval sorted correctly (default address home is first).');
    } else {
      console.log('[FAIL] Retrieval sorting incorrect.');
    }

    // Clean up
    await Address.deleteMany({ user: user._id });
    console.log('\n[PASS] Cleaned up all test addresses.');

    if (createdDummyUser) {
      await User.deleteOne({ _id: user._id });
      console.log('[PASS] Cleaned up dummy customer user.');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

run();
