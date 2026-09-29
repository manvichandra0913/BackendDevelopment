require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

// Centralized error response prevents stack traces being sent to clients.
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  return res.status(500).json({ message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined. Add it to your .env file.');
    }
    await connectDB();
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Server failed to start');
    process.exit(1);
  }
};

startServer();

module.exports = app;
