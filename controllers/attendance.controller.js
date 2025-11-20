import Enroll from "../models/enroll.model.js";

// Helper: Check if weekend (Sat=6, Sun=0)
const isWeekend = (date = new Date()) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Get start of day (00:00:00.000)
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day (23:59:59.999)
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// MARK ATTENDANCE (Manual - Student clicks "Present")
export const markAttendance = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const student = await Enroll.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const today = new Date();
    if (isWeekend(today)) {
      return res.status(400).json({ message: "No classes on weekends" });
    }

    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // Check if already marked today
    const alreadyMarked = student.attendance.some(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: "Attendance already marked today" });
    }

    // Mark present
    student.attendance.push({
      date: today,
      status: "present"
    });

    await student.save();

    return res.json({ message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Mark attendance error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// AUTO MARK ABSENT (Run daily at 2:00 PM via cron)
export const autoMarkAbsence = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    if (isWeekend(today)) {
      const msg = "Weekend - Skipping auto absence marking";
      console.log(msg);
      if (res) return res.json({ message: msg });
      return;
    }

    const students = await Enroll.find({});
    let absentCount = 0;

    for (const student of students) {
      const markedToday = student.attendance.some(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startOfDay && recordDate <= endOfDay;
      });

      if (!markedToday) {
        student.attendance.push({
          date: today,
          status: "absent"
        });
        await student.save();
        absentCount++;
        console.log(`Auto-marked ${student.email} as absent`);
      }
    }

    const message = `Auto-marked ${absentCount} students as absent today`;
    console.log(message);

    if (res) {
      return res.json({ message, absentCount });
    }
  } catch (error) {
    console.error("Auto mark absence error:", error);
    if (res) return res.status(500).json({ message: "Auto mark failed" });
  }
};



// Get attendance by Date Range
export const getAttendacneByDateRange = async (req, res, next) =>{
  // to get the query string
  const {start, end} = req.query

  // check if start and end exist
  if(!start || !end){
    return res.status(400).json({message: "start and end date are require"})
  }
      //create new date and actual date
  const startDate = new Date(start)

  const endDate = new Date(end)
  endDate.setHours(23, 59, 59, 999)


  if(isNaN(startDate) || isNaN(endDate)){
    return res.status(400).json({
      message: "invalid Date , try YYYY-MM-DD"
    })
  }


  //go through the data, filter it and get the exact date
  const students = await Enroll.find({}, {
      firstname: 1,
      lastname:1,
      email:1,
      learningtrack:1,
      attendance:1 // inclusion projection
  })

  //Filtering
  const findStudents = students.map(student =>{
    const filteredStudents = student.attendance.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= startDate && recordDate <= endDate
    })

    // restict an empty array
    if(filteredStudents.length > 0){
      return{
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        learningtrack: student.learningtrack,
        gender: student.gender
      }
    }

    return null
  }).filter(Boolean)

  res.status(200).json({
    data: findStudents
  })
}

// filter by track
export const filterByTrack = async (req, res, next) => {
    try {
        const { track } = req.query;

    if (!track) {
      return res.status(400).json({ message: "Track is required" });
    }

    const students = await Enroll.find({ learningtrack: track });

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this track" });
    }

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
    } catch (error) {
        res.status(500).json({message:"something went wrong",
            error: error.message
        })
    }
}



// get attendance by Name
export const getAttendanceByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // case-insensitive + partial match
    const student = await Enroll.findOne({
      name: { $regex: name, $options: "i" }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        email: student.email,
        learningtrack: student.learningtrack,
        attendanceCount: student.attendance.length,
        attendance: student.attendance
      }
    });

  } catch (error) {
    next(error);
  }
};




// // ADMIN DASHBOARD SUMMARY
// export const AdminSummary = async (req, res) => {
//   try {
//     const totalStudents = await Enroll.countDocuments();
//     const tracks = await Enroll.distinct("learningtracks");
//     const totalTracks = tracks.length;

//     const today = getStartOfDay();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Count students who have ANY attendance record today (present or absent)
//     const studentsWithAttendanceToday = await Enroll.aggregate([
//       { $unwind: "$attendance" },
//       {
//         $match: {
//           "attendance.date": { $gte: today, $lt: tomorrow }
//         }
//       },
//       { $count: "total" }
//     ]);

//     const presentToday = await Enroll.aggregate([
//       { $unwind: "$attendance" },
//       {
//         $match: {
//           "attendance.date": { $gte: today, $lt: tomorrow },
//           "attendance.status": "present"
//         }
//       },
//       { $count: "present" }
//     ]);

//     const presentCount = presentToday[0]?.present || 0;
//     const attendancePercentage = totalStudents > 0
//       ? Math.round((presentCount / totalStudents) * 100)
//       : 0;

//     res.json({
//       totalStudents,
//       totalTracks,
//       todayAttendancePercentage: attendancePercentage,
//       todayAbsentPercentage: 100 - attendancePercentage,
//       presentToday: presentCount,
//       absentToday: totalStudents - presentCount
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to get summary" });
//   }
// };

// // GET ALL STUDENTS WITH ATTENDANCE %
// export const getOverallAttendance = async (req, res) => {
//   try {
//     const students = await Enroll.find().select("firstname lastname email learningtracks attendance");

//     const data = students.map(student => {
//       const records = student.attendance || [];
//       const total = records.length;
//       const present = records.filter(r => r.status === "present").length;
//       const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

//       return {
//         id: student._id,
//         fullname: `${student.firstname} ${student.lastname}`.trim(),
//         email: student.email,
//         track: student.learningtracks || student.learningtrack,
//         attendancePercentage: percentage + "%"
//       };
//     });

//     // Sort by percentage descending
//     data.sort((a, b) => parseInt(b.attendancePercentage) - parseInt(a.attendancePercentage));

//     res.json({
//       message: "Attendance summary fetched",
//       students: data
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };