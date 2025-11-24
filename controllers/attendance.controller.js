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
export const getAttendacneByDateRange = async (req, res, next) => {
  try {
    const { range, start, end } = req.query;

    let startDate, endDate;

    // 1. HANDLE PREDEFINED RANGE
    if (range && range !== "custom") {
      const number = parseInt(range); // extract and convert number of the string to javaScript number
      const unit = range.slice(-1); // extract the alphabet in the range string

      if (isNaN(number) || !["d", "w"].includes(unit)) {
        return res.status(400).json({ message: "Invalid range format (use 7d, 2w)" });
      }

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      startDate = new Date();

      if (unit === "d") {
        startDate.setDate(startDate.getDate() - number);
      } else if (unit === "w") {
        startDate.setDate(startDate.getDate() - number * 7);
      }
    }

    // 2. CUSTOM RANGE
    if (range === "custom") {
      if (!start || !end) {
        return res.status(400).json({
          message: "start and end date are required for custom range",
        });
      }

      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Invalid date range. Provide range or custom start/end dates.",
      });
    }


    // 3. GET STUDENTS
    const students = await Enroll.find(
      {},
      {
        firstname: 1,
        lastname: 1,
        email: 1,
        gender: 1,
        learningtrack: 1,
        attendance: 1,
      }
    );

    // 4. FILTER ATTENDANCE
  
    const filtered = students
      .map((student) => {
        const records = student.attendance.filter((r) => {
          const d = new Date(r.date);
          return d >= startDate && d <= endDate;
        });

        if (records.length === 0) return null;

        return {
          name: `${student.firstname} ${student.lastname}`,
          email: student.email,
          gender: student.gender,
          learningtrack: student.learningtrack,
          attendanceCount: records.length,
          present: records.filter((r) => r.status === "present").length,
          absent: records.filter((r) => r.status === "absent").length,
          records,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      message: "successful",
      totalStudents: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};


// filter by track
export const filterByTrack = async (req, res, next) => {
  try {
    let { track } = req.query;

    if (!track) {
      return res.status(400).json({ message: "Track is required" });
    }

    // Trim spaces
    track = track.trim();

    // Case-insensitive exact match
    const students = await Enroll.find({
      learningtrack: { $regex: new RegExp(`^${track}$`, "i") }
    });

    if (students.length === 0) {
      // Optional: return 200 with empty array
      return res.status(200).json({
        success: true,
        count: 0,
        students: [],
        message: `No students found for track: ${track}`
      });
    }

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};




// get attendance by Name
export const getAttendanceByName = async (req, res, next) => {
  try {
    const {search} = req.query;

    if(!search){
      return res.status(400).json({
        message: "searck key is required"
      })
    }

    const regex = new RegExp(search, "i")  // set to be case incensitives


    const students = await Enroll.find({
      $or: [
        {firstname: regex},
        {lastname:regex}
      ]

    },  { firstname: 1,
      lastname:1,
      email:1,
      learningtrack:1,
      attendance:1 

    })

    if(students.length === 0){
      return res.status(404).json({message: "name is not found"})
    }

    const result = students.map(student =>({
        name: `${student.firstname} ${student.lastname}`,
        email: student.email,
        learningtrack: student.learningtrack,
        totalAttendance: student.attendance.length,
        present: student.attendance.filter(r => r.status === "present").length,
        absent: student.attendance.filter(r => r.status === "absent").length,
        records: student.attendance
    }));

    res.status(200).json({
      message: "Attendance filtered by name successfully",
      count: result.length,
      data: result
      
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message:"something went wrong",
      error: error.message
    })
  }
};




// ADMIN DASHBOARD SUMMARY
export const AdminSummary = async (req, res) => {
  try {
    const totalStudents = await Enroll.countDocuments();

    // FIXED: correct field name
    const tracks = await Enroll.distinct("learningtrack");
    const totalTracks = tracks.length;

    // Helper: get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count PRESENT students uniquely
    const presentToday = await Enroll.aggregate([
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": { $gte: today, $lt: tomorrow },
          "attendance.status": "present"
        }
      },
      { $group: { _id: "$_id" } }, // prevent double-count
      { $count: "present" }
    ]);

    const presentCount = presentToday[0]?.present || 0;

    // Count ABSENT students uniquely
    const absentToday = await Enroll.aggregate([
      { $unwind: "$attendance" },
      {
        $match: {
          "attendance.date": { $gte: today, $lt: tomorrow },
          "attendance.status": "absent"
        }
      },
      { $group: { _id: "$_id" } },
      { $count: "absent" }
    ]);
    
    const absentCount = absentToday[0]?.absent || 0;

    // Attendance percentage
    const attendancePercentage = totalStudents > 0
      ? Math.round((presentCount / totalStudents) * 100)
      : 0;

    res.json({
      totalStudents,
      totalTracks,
      presentToday: presentCount,
      absentToday: absentCount,
      todayAttendancePercentage: attendancePercentage,
      todayAbsentPercentage: 100 - attendancePercentage
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get summary" });
  }
};


// // GET ALL STUDENTS WITH ATTENDANCE %
export const getOverallAttendance = async (req, res) => {
  try {
    // FIXED: correct field name
    const students = await Enroll.find()
      .select("firstname lastname email learningtrack attendance");

    const data = students.map(student => {
      const records = student.attendance || [];
      const total = records.length;

      const present = records.filter(r => r.status === "present").length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: student._id,
        fullname: `${student.firstname} ${student.lastname}`.trim(),
        email: student.email,
        track: student.learningtrack,
        attendancePercentage: percentage   // number only
      };
    });

    // Sort descending by percentage
    data.sort((a, b) => b.attendancePercentage - a.attendancePercentage);

    res.json({
      message: "Attendance summary fetched",
      students: data
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
