import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    required: true
  }
}, { timestamps: true });

export default mongoose.model("Attendance", AttendanceSchema);
