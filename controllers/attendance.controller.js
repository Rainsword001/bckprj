import Attendance from "../models/attendance.model.js";
import Enroll from "../models/enroll.model.js";

/**
 *  count weekdays (Mon–Fri) between two dates
 */
const countWeekdays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (day >= 1 && day <= 5) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

export const markAttendance = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Verify student email in Enroll collection
    const student = await Enroll.findOne({ email: email.toLowerCase().trim() });

    if (!student) {
      return res.status(404).json({ message: "No registered student found with this email." });
    }

    // Prevent duplicate marking for the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyMarked = await Attendance.findOne({
      email,
      date: { $gte: today },
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: "Attendance already marked for today." });
    }

    // Define semester start date (can be dynamic)
    const semesterStart = new Date("2025-09-02");
    const totalClassDays = countWeekdays(semesterStart, new Date());

    // Count total attendance days for this student
    const attendedDays = await Attendance.countDocuments({ email });
    const updatedAttendance = attendedDays + 1;

    const attendancePercentage = ((updatedAttendance / totalClassDays) * 100).toFixed(2);

    // Save new attendance record with student reference
    const newAttendance = new Attendance({
      student: student._id,
      email,
      attendancePercentage,
    });

    await newAttendance.save();

    res.status(201).json({
      message: "Attendance marked successfully!",
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        phonenumber: student.phonenumber,
        gender: student.gender,
        learningtrack: student.learningtrack,
        attendancePercentage: student.attendancePercentage
      },
      attendance: {
        totalClassDays,
        attendedDays: updatedAttendance,
        attendancePercentage,
        date: new Date(),
      },
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      message: "Error marking attendance.",
      error: error.message,
    });
  }
};
