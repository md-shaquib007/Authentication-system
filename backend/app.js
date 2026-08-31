import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
dotenv.config();
import authRoutes from './route/authRoutes.js';
import cors from 'cors';
import path from 'path';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const __dirname = path.resolve();

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
    : ['http://localhost:5173'];

app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus =
        dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbStatus,
    });
});

app.use(helmet());

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

app.use(errorHandler);

export default app;
