require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { default: rateLimit } = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT;

// ===== Middleware =====
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ===== check DB Connection =====
sequelize.authenticate({ alter: true })
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));
// ===== Error Handler =====
app.use(errorHandler);
// ===== Start Server =====
app.listen(PORT, async () => {
  try {
    await sequelize.sync(); 
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error(' Error syncing DB:', err);
  }
});
// ===== Routes =====
app.get('/', (req, res) => {
  res.send('Welcome to teamwork i am working on API at the moment on --> /api/v1/users ');
});
// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
});
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users',userRoutes);
