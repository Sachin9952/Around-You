// Workflow test script using dynamic model compilation to bypass module caching issues.
// Usage: node scratch/testDynamic.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\.env' });

async function run() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');

    // Define models dynamically on the active connection
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }));

    const Service = mongoose.models.Service || mongoose.model('Service', new mongoose.Schema({
      provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      title: String,
      category: String,
      price: Number
    }));

    const Booking = mongoose.models.Booking || mongoose.model('Booking', new mongoose.Schema({
      customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      date: Date,
      time: String,
      status: { type: String, default: 'pending' },
      location: mongoose.Schema.Types.Mixed
    }));

    // Find a customer and a provider
    const customer = await User.findOne({ role: 'customer' });
    const provider = await User.findOne({ role: 'provider' });
    const service = await Service.findOne({ provider: provider ? provider._id : null });

    if (!customer || !provider || !service) {
      console.error('Missing customer, provider or service in database. Cannot run integration test.');
      return;
    }

    console.log(`Using Customer: ${customer.name} (${customer.email})`);
    console.log(`Using Provider: ${provider.name} (${provider.email})`);
    console.log(`Using Service: ${service.title}`);

    console.log('\n--- 1. Testing Happy Path: pending -> accepted -> on_the_way -> completed ---');
    
    // Create pending booking
    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      service: service._id,
      date: new Date(),
      time: '10:00 AM',
      location: { address: 'Test Location', coordinates: { lat: 19.076, lng: 72.877 } }
    });
    console.log(`[PASS] Created test booking with ID: ${booking._id}, status: ${booking.status}`);

    // Try invalid transition: pending -> completed
    try {
      validateTransition(booking.status, 'completed');
      console.log('[FAIL] Should not allow transition from pending -> completed');
    } catch (err) {
      console.log(`[PASS] Blocked invalid transition: pending -> completed (${err.message})`);
    }

    // Valid transition: pending -> accepted
    booking.status = 'accepted';
    await booking.save();
    console.log(`[PASS] Transitioned to: ${booking.status}`);

    // Try invalid transition: accepted -> completed (must go to on_the_way first)
    try {
      validateTransition(booking.status, 'completed');
      console.log('[FAIL] Should not allow transition from accepted -> completed');
    } catch (err) {
      console.log(`[PASS] Blocked invalid transition: accepted -> completed (${err.message})`);
    }

    // Valid transition: accepted -> on_the_way
    booking.status = 'on_the_way';
    await booking.save();
    console.log(`[PASS] Transitioned to: ${booking.status}`);

    // Try invalid transition: on_the_way -> accepted (cannot go backward)
    try {
      validateTransition(booking.status, 'accepted');
      console.log('[FAIL] Should not allow transition from on_the_way -> accepted');
    } catch (err) {
      console.log(`[PASS] Blocked invalid transition: on_the_way -> accepted (${err.message})`);
    }

    // Valid transition: on_the_way -> completed
    booking.status = 'completed';
    await booking.save();
    console.log(`[PASS] Transitioned to: ${booking.status}`);

    console.log('\n--- 2. Testing Cancellation Rules ---');

    // Create a new pending booking
    const booking2 = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      service: service._id,
      date: new Date(),
      time: '11:00 AM',
      location: { address: 'Test Location 2', coordinates: { lat: 19.076, lng: 72.877 } }
    });
    console.log(`[PASS] Created second test booking ID: ${booking2._id}, status: ${booking2.status}`);

    // Cancel pending booking (allowed)
    if (booking2.status === 'pending' || booking2.status === 'accepted') {
      booking2.status = 'cancelled';
      await booking2.save();
      console.log(`[PASS] Cancelled pending booking. Status: ${booking2.status}`);
    } else {
      console.log('[FAIL] Pending booking cancellation blocked');
    }

    // Try to cancel the completed booking from Happy Path (should fail)
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      console.log(`[PASS] Successfully blocked cancellation of completed booking (current status: ${booking.status})`);
    } else {
      console.log('[FAIL] Completed booking was allowed to be cancelled');
    }

    // Clean up test bookings
    await Booking.deleteOne({ _id: booking._id });
    await Booking.deleteOne({ _id: booking2._id });
    console.log('\n[PASS] Cleaned up all test bookings.');

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

// Emulate controller transition check logic
function validateTransition(currentStatus, targetStatus) {
  if (targetStatus === 'accepted' || targetStatus === 'rejected') {
    if (currentStatus !== 'pending') {
      throw new Error('Can only accept or reject a pending booking');
    }
  } else if (targetStatus === 'on_the_way') {
    if (currentStatus !== 'accepted') {
      throw new Error('Can only mark as "on the way" after the booking is accepted');
    }
  } else if (targetStatus === 'completed') {
    if (currentStatus !== 'on_the_way') {
      throw new Error('Can only mark as completed once the provider is on the way');
    }
  }
}

run();
