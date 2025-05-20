const dotenv=require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
// import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const regionRoutes = require('./routes/regionRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const woredaRoutes = require('./routes/woredaRoutes');
const newsRoutes = require('./routes/newsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const partnershipRoutes = require('./routes/partnershipRoutes');
// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to teamwork the main api gateway',
        version: '1.0',
        endpoints: '/api/v1/{...version1}',
    });
});
//main routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/job-applications', jobApplicationRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/regions', regionRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/woredas', woredaRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/partnerships', partnershipRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await db.authenticate();
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();