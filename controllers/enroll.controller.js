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



// helper function to prevent attendace marking on saturday and sunday

const isWeekend = (date) =>{
  const day = date.getDay()
  return day === 0 || day ===  6
}

// to know the start of the day

const startOfDay = (date) =>{
  const start = new Date(date)
  start.setHours(0,0,0,0)
  return start
}

// to know end of the day

const endOfDay = (date) =>{
  const end = new Date(date);
  end.setHours(23, 59, 99, 999);
  return end
}







//check if weekend
const weekend = (date) =>{
  const day = date.getDay()
  return day === 0 || day === 6
}


// start of the day
const getStartOFDay = (date) =>{
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  return start
}


//end of the day
const getEndOfDay = (date) => {
  const end = new Date(date)
  end.setHours(23, 59, 99, 999)

  return end
}


// get working days
const getWOrkingDays = (startDate, EndDate) =>{
  const workingDays = [ ];
  const current = new Date(startDate)
  while (current <= EndDate) {
    if (!isWeekend(current)){
          workingDays.push(new Date(current))
    }
  }
}





// mark attendance

export const markAttendance = async (req, res, next) => {
  
 try {
  const {email} = req.body;
  //validate email
  if(!email){
    return res.status(400).json({message: "Email is required"})
  };

  //validate student enrollment
  const student = await Enroll.findOne({email});

  if(!student){
    return res.status(400).json({message: "student not enrolled"})
  }

  // check if weekend
  const today = new Date()
  console.log("Todays Date: ", today)

  if(weekend(today)){
    return res.status(400).json({message: "Attendance can not be marke on weekend"})
  }


      // prevent marking attendance twice
      const startofDay = getStartOFDay(today)
      const endofDay = getEndOfDay(today)

      const allreadyMarked = student.attendance.some((record)=>{
            const recordDate = new Date(record.date)
            return recordDate >= startofDay && recordDate <= endofDay;

      });

      if(allreadyMarked){
        return res.status(400).json({message: "Attendance already marked"})
      }

      // marke the student present
      student.attendance.push({
          date: today,
          status: "present"
      })

      await student.save()

      return res.status(200).json({
        message: "Attendance Marked successfully!"
      })

 } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    })
 }
};












//autoMarkAbsence

export const autoMarkAbsence = async (req, res, next) => {
  
}


//getOverallAttendance
export const getOverallAttendance = async (req, res, next) => {
  
}

//get StudentWith Attendance
export const getStudentWithAttendance = async (req, res, next) => {
  
}


//getstudentattendance
export const getstudentattendance = async (req, res, next) => {

  
}





