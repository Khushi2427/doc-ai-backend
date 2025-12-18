import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import businessRoutes from "./routes/business.routes.js";
import testRoutes from "./routes/test.routes.js";

import fileRoutes from "./routes/fileRoutes.js";
import extractRoutes from "./routes/extractRoutes.js";
import apiKeyRoutes from "./routes/apiKeyRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

//✅ 1. Enable CORS before everything else
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://docxtract-three.vercel.app"
    ],

    credentials: true,
  })
);

  
  // ✅ 2. Middleware before routes
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth', authLimiter);
  app.use('/api/auth', authRoutes);
  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/test", testRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/extract", extractRoutes);
app.use("/api/apikey", apiKeyRoutes);


  // ✅ 4. Start server

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  });