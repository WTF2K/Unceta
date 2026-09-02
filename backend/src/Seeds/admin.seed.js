const bcrypt = require('bcryptjs');

async function seedAdmin({ admins }) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('Admin seed skipped: set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.');
    return;
  }

  const existingAdmin = await admins.findOne({ where: { email } });
  if (existingAdmin) return;

  await admins.create({ email, password_hash: await bcrypt.hash(password, 12) });
  console.log(`Initial administrator created for ${email}`);
}

module.exports = seedAdmin;