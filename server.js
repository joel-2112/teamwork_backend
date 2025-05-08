require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
const PORT = process.env.PORT;
const authRoutes = require('./routes/authRoutes');
// ===== Test DB Connection =====
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
app.use('/api/v1/auth', authRoutes);

