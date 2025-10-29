import mongoose from "mongoose";
import {DB_URL} from '../config/env.js'

//async function to connect to database
export const DB = async () => {
    try{
        await mongoose.connect(DB_URL)
        console.log('database is connected')
    }  catch(error){
        console.log('Oops! not connected', error)
    }
}