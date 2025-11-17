import express from 'express';
import { DB } from "./database/mongodb.js";
import {PORT} from './config/env.js';
import authRouter from './routes/auth.routes.js';
import enrollRouter from './routes/enroll.route.js';
import cron from 'node-cron';
import { autoMarkAbsence} from './controllers/attendance.controller.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import attendaceRouter from './routes/attendance.route.js';

const app = express();

// Midddlewar
app.use(cookieParser());
app.use(express.json()) // it parse out info to be display
app.use(cors({
    origin: ["https://attendance-en.onrender.com", "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.urlencoded({extended: true}))


app.use('/api/v1/auth', authRouter);
app.use('/api/v1', enrollRouter);
app.use('/api/v1', attendaceRouter);



cron.schedule('29 13 * * *', async () => {
    console.log("Testing Auto marking")
    
    await autoMarkAbsence(null, null)
})


app.listen(PORT, () => {
    DB();
    console.log(`Server is running`);
});





