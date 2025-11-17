//HIDE YOUR .ENV DETAIL HERE
import { config } from "dotenv";

config({path: `.env.${process.env.NODE_ENV || 'production'}.local`})

export const{
    PORT,
    DB_URL,
    JWT_EXPIRES_IN,
    JWT_SECRET,
} = process.env




