import mongoose from 'mongoose';
import admin from "../models/admin.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const SignUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, track } = req.body;

    // Check if any of the data is missing
    if (!name || !email || !password || !track) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await admin.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await admin.create(
      [{ name, email, password: hashPassword, track }],
      { session }
    );

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser[0]._id, email: newUser[0].email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "User created successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


//SIGNIN SET UP

export const SignIn = async (req, res, next) => {
  
  try {
    // Check if any of the data is missing
    const {email, password} = req.body

    if(!email || !password){
      return res.status(400).json({message: "All fields are required"})
    }

    // check if user is not exist
    const User = await admin.findOne({email})

    if(!User){
      return res.status(400).json({message: "user not found"})
    }

    // Check if password is correct

    const isPassword = await bcrypt.compare(password, User.password)

    if(!isPassword){
      return res.status(400).json({message: "Invalid password"})
    }


    // generate token
    const token = jwt.sign({user: User.id}, JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN })

      res.status(200).json({
        success: true,
        message: "Signin Successfull",
        token: token,
        data: {
          id: User.id,
          name: User.name,
          email: User.email,
          track: User.track
        }

      })


  } catch (error) {
    next(error)
  }
};
