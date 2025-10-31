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


//get all user

export const getAllEnrolled = async (req, res, next) => {
  try {
    const { track, search, page = 1, limit = 10 } = req.body;
    const query = {};

    // Filter by learning track
    if (track) query.learningtrack = track;

    // Search by name, email, or phone number (case-insensitive)
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination setup
    const skip = (page - 1) * limit;

    // Fetch total count and paginated data
    const total = await Enroll.countDocuments(query);
    const enrolled = await Enroll.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: show latest first

    // Response
    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: enrolled,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
