import mongoose from "mongoose";




const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enroll",
    required: true
  },
  
  email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }
}, { timestamps: true });



const Attendance = mongoose.model("Attendance", AttendanceSchema);


export default Attendance;



