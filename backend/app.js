import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import authRoutes from './route/authRoutes.js';
import dbConnect from './config/dbConnect.js';
import cors from 'cors';
import path from 'path';

//Database Connection (Required for serverless environments)
dbConnect();

//Express ref
const app = express();

const __dirname = path.resolve();

//Middleware
app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
    });
}

export default app;
