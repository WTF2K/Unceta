const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { admins } = require('../Config/database');
const { COOKIE_NAME } = require('../Middleware/auth.middleware');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 8 * 60 * 60 * 1000
};

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'JWT_SECRET is missing from backend/.env.' });

    const admin = await admins.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id_admin: admin.id_admin, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.cookie(COOKIE_NAME, token, cookieOptions).status(200).json({ email: admin.email });
  } catch (error) {
    console.error('Admin login failed:', error);
    return res.status(500).json({ message: 'Unable to complete administrator sign in.' });
  }
}

function logout(req, res) {
  return res.clearCookie(COOKIE_NAME, cookieOptions).status(204).send();
}

function session(req, res) {
  return res.status(200).json({ authenticated: true, admin: req.admin });
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'The new password must contain at least 8 characters.' });
    }

    const admin = await admins.findByPk(req.admin.id_admin);
    if (!admin) return res.status(401).json({ message: 'Administrator account not found.' });
    if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
      return res.status(401).json({ message: 'The current password is incorrect.' });
    }

    await admin.update({ password_hash: await bcrypt.hash(newPassword, 12) });
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Admin password change failed:', error);
    return res.status(500).json({ message: 'Unable to change the password.' });
  }
}

module.exports = { login, logout, session, changePassword };