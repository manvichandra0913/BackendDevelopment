const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^\S+@\S+\.\S+$/;

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Add it to your .env file.');
  }

  // The token contains only a user identifier, never sensitive account data.
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

const validateCredentials = (name, email, password, needsName) => {
  if ((needsName && (typeof name !== 'string' || name.trim().length < 2)) ||
      typeof email !== 'string' || !emailPattern.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8) {
    return 'Provide a valid email and a password of at least 8 characters' +
      (needsName ? '; name must be at least 2 characters' : '');
  }
  return null;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const validationError = validateCredentials(name, email, password, true);
    if (validationError) return res.status(400).json({ message: validationError });

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: 'An account with this email already exists' });

    // The pre-save hook on User hashes the plain-text password before storage.
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    return res.status(201).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validationError = validateCredentials(null, email, password, false);
    if (validationError) return res.status(400).json({ message: validationError });

    // Explicitly select password because the schema excludes it by default.
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ token: createToken(user._id), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const getProfile = (req, res) => res.status(200).json({ user: publicUser(req.user) });

module.exports = { register, login, getProfile };
