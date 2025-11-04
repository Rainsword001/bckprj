import express from 'express';
import { DB } from "./database/mongodb.js";
import {PORT} from './config/env.js';
import authRouter from './routes/auth.routes.js';
import enrollRouter from './routes/enroll.route.js';
import markRoute from './routes/attendance.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


const app = express();

// Midddlewar
app.use(cookieParser());
app.use(express.json()) // it parse out info to be display
app.use(cors({
    origin: "http://localhost:3000",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.urlencoded({extended: true}))


app.use('/api/v1/auth', authRouter);
app.use('/api/v1', enrollRouter);
app.use('/api/v1', enrollRouter);
app.use('/api/v1', markRoute)






app.listen(PORT, () => {
    DB();
    console.log(`Server is running`);
});


