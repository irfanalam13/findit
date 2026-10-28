
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import User from '../src/models/User.js';

dotenv.config();

const rl = readline.createInterface({ input, output });

async function promoteAdmin() {
  try {
    const email = (
      await rl.question('Enter your registered Findit email: ')
    ).trim().toLowerCase();

    if (!email || !email.includes('@')) {
      console.log('Please enter a valid email address.');
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from server/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const user = await User.findOne({ email });

    if (!user) {
      console.log('No Findit account found with that email.');
      return;
    }

    console.log('\nAccount found:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Current role:', user.role);
    console.log('Email verified:', user.isEmailVerified);
    console.log('Suspended:', user.isSuspended);

    if (!user.isEmailVerified) {
      console.log(
        '\nThis account is not email-verified. Verify it before using admin access.'
      );
      return;
    }

    if (user.isSuspended) {
      console.log(
        '\nThis account is suspended. Resolve the suspension first.'
      );
      return;
    }

    if (user.role === 'admin') {
      console.log('\nThis account is already an admin.');
      return;
    }

    const confirmation = (
      await rl.question(
        '\nPromote this account to admin? Type YES to confirm: '
      )
    ).trim();

    if (confirmation !== 'YES') {
      console.log('Cancelled. No changes made.');
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log('\nSuccess! Account promoted to admin.');
    console.log('Updated role:', user.role);
  } catch (error) {
    console.error('\nFailed:', error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

promoteAdmin();

