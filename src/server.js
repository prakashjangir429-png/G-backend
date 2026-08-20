import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import crypto from 'crypto';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { leadSocketAuth, socketAuth } from './middleware/socketMiddleware.js';


import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import leadRoutes from './routes/leadRoutes.js'
import supportRoutes from './routes/supportRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import assignRoutes from './routes/assignRoutes.js';
import leadStatus from './routes/leadStatus.js';
import assets from "./routes/assetsRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import KKKmain from './cronJob/humanize.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import blogCategoryRoutes from "./routes/blogCategoryRoutes.js";


dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
app.use("/uploads", express.static("uploads"));

// const io = new Server(server, {
//   cors: {
//     // origin: ["http://localhost:5173"],
//     origin: ["https://crm.gatewayabroadeducations.com"],
//     // origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// global.io = io;
// const leadIO = io.of("/lead-notifications");

// leadIO.use(socketAuth);

// leadIO.on("connection", (socket) => {
//   socket.join(socket.user._id.toString());
//   socket.on("disconnect", () => {
//   });
// });


const allowedOrigins = [
  "https://www.gatewayabroadeducations.com",
  "https://crm.gatewayabroadeducations.com",
  "https://join.gatewayabroadeducations.com",
  "https://portal.gatewayabroadeducations.com",
  "https://gatewayabroadeducations.com",
  "https://dashboard.gatewayabroadeducations.com",
  "https://m8j3lq9z-5173.inc1.devtunnels.ms",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8000",
  "http://localhost:5173",
  "https://6dtmqkkr-5173.inc1.devtunnels.ms",
  "https://portal-virid-eta.vercel.app",
  "https://m8j3lq9z-5173.inc1.devtunnels.ms",
  "https://admin-main-nu.vercel.app"
];
// app.use(cors());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
// app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use('/api/v1/leads', leadRoutes)
app.use('/api/v1/status', leadStatus);
app.use('/api/v1/assign', assignRoutes);
app.use('/api/v1/assets', assets);
app.use('/api/v1/page', pageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use('/api/v1/news', newsRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/blog-categories", blogCategoryRoutes);



// KKKmain()

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });

export default app;
