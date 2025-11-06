import mongoose from "mongoose";
import Enroll from "../models/enroll.model.js";




export const studentEnroll = async (req, res, next) => {
   const session = await mongoose.startSession();
   session.startTransaction();

try {
    const {firstname, lastname, email, phonenumber, gender, learningtrack} = req.body;

    if(!firstname || !lastname || !email || !phonenumber || !gender || !learningtrack){
        return res.status(400).json({message: "All fileds are required"})
    }

    //validate users inputs
    const User = await Enroll.findOne({email}).session(session);

    if(User){
        return res.status(400).json({message: "User already exist"})
    }

    //create new user
const newUser = await Enroll.create([{firstname, lastname, email,
        phonenumber, gender, learningtrack
    }], {session});

    await session.commitTransaction();
    session.endSession()
    return res.status(201).json({
        message: "Enrolled Successfully"
    })



} catch (error) {
    await session.abortTransaction()
    session.endSession()
    next(error)    
}

}



