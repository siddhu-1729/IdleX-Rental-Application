// One-off script: `npm run seed:admin`
// Creates (or promotes) the initial admin user from .env values, the
// Node equivalent of Django's `createsuperuser`.
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');

async function run() {
  await mongoose.connect(env.mongoUri);

  let admin = await User.findOne({ email: env.admin.email });
  if (admin) {
    admin.role = 'admin';
    await admin.save();
    console.log(`[seed] Existing user promoted to admin: ${env.admin.email}`);
  } else {
    admin = await User.create({
      name: 'Admin',
      email: env.admin.email,
      password: env.admin.password,
      role: 'admin',
      isOwner: true,
      isRenter: true,
      isEmailVerified: true,
    });
    console.log(`[seed] Admin created: ${env.admin.email}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
