const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\.env' });

// Disable buffering globally to see errors immediately
mongoose.set('bufferCommands', false);

async function run() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');

    // 1. Try native driver query
    console.log('Running native query...');
    const nativeUser = await mongoose.connection.db.collection('users').findOne({ email: 'priya@customer.com' });
    console.log('Native Query Result:', nativeUser ? nativeUser.email : 'Not found');

    // 2. Try Mongoose model query
    console.log('Requiring User model...');
    const User = require('c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\models\\User');
    console.log('Running Mongoose model query...');
    const mongooseUser = await User.findOne({ email: 'priya@customer.com' });
    console.log('Mongoose Query Result:', mongooseUser ? mongooseUser.email : 'Not found');

  } catch (err) {
    console.error('Execution failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}
run();
