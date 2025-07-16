import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from 'path';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import db from './models/index.js'; 
import errorHandler from "./middlewares/errorHandler.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import regionRoutes from "./routes/regionRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";
import woredaRoutes from "./routes/woredaRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import partnershipRoutes from "./routes/partnershipRoutes.js";
import serviceOrderRoutes from "./routes/serviceOrderRoutes.js";
import customerOrderRoutes from "./routes/customerOrderRoute.js";
import userFeedbackRoutes from "./routes/userFeadbackRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import roleRouote from "./routes/roleRoute.js"

// Initialize Express
const app = express();
const port = process.env.PORT || 5000;

// Serve static files from /uploads with CORS headers
app.use(
  "/uploads",
  express.static(path.join("uploads"), {
    setHeaders: (res, path) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    },
  })
);


// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to teamwork IT solution PLC",
    version: "1.0",
    endpoints: "/api/v1 => the first version ",
  });
});

// Main routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", roleRouote);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/job-applications", jobApplicationRoutes);
app.use("/api/v1/agents", agentRoutes);
app.use("/api/v1/regions", regionRoutes);
app.use("/api/v1/zones", zoneRoutes);
app.use("/api/v1/woredas", woredaRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/partnerships", partnershipRoutes);
app.use("/api/v1/service-orders", serviceOrderRoutes);
app.use("/api/v1/customer-orders", customerOrderRoutes);
app.use("/api/v1/user-feedbacks", userFeedbackRoutes);
app.use("/api/v1/abouts", aboutRoutes);
app.use("/api/v1/services", serviceRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server and sync database
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected successfully');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    await db.sequelize.sync({ alter: true }); 
    console.log('All models synced and tables created/updated');

    
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
