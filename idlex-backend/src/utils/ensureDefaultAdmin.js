const env = require('../config/env');
const User = require('../models/User');

// Idempotently creates (or promotes) the default admin account so the
// admin console is usable right after `npm run dev` — the Node equivalent
// of Django's auto-createsuperuser. Credentials come from env with a
// sensible dev default (admin@gmail.com / admin).
async function ensureDefaultAdmin() {
  let admin = await User.findOne({ email: env.admin.email });
  if (admin) {
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
      console.log(
        `[admin] Promoted existing user to admin: ${env.admin.email} (password NOT reset — set ADMIN_PASSWORD to change it)`
      );
    }
    return admin;
  }

  admin = await User.create({
    name: 'Admin',
    email: env.admin.email,
    password: env.admin.password,
    role: 'admin',
    isOwner: true,
    isRenter: true,
    isEmailVerified: true,
  });
  console.log(`[admin] Default admin ready — ${env.admin.email} / ${env.admin.password}`);
  return admin;
}

module.exports = ensureDefaultAdmin;
