import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error(
      'Usage: node scripts/promote-admin.js your-verified-email@example.com',
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing from server/.env.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(
        'User not found. Register and verify this account first.',
      );
    }

    if (!user.isEmailVerified) {
      throw new Error(
        'Verify the account email before promoting it.',
      );
    }

    user.role = 'admin';
    await user.save();

    console.log(`Administrator role assigned to ${user.email}.`);
  } finally {
    await mongoose.disconnect();
  }
}

promoteAdmin().catch((error) => {
  console.error('Could not promote administrator:', error.message);
  process.exitCode = 1;
});