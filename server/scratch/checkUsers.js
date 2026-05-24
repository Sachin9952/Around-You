const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:\\Users\\ASUS\\OneDrive\\Desktop\\Around-You\\server\\.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Total users:', users.length);
    console.log('Users:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
