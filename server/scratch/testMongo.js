const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\.env' });

async function check() {
  console.log('Uri:', process.env.MONGO_URI);
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected successfully!');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}
check();
