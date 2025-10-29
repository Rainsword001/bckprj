import express from 'express';
import { DB } from "./database/mongodb.js";
import {PORT} from './config/env.js';
import authRouter from './routes/auth.routes.js';;
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
    allowedHeaders: ["Content-Type", "Autthorization"],
}))
app.use(express.urlencoded({extended: true}))


app.use('/api/v1/auth', authRouter);






app.listen(PORT, () => {
    DB();
    console.log(`Server is running`);
})