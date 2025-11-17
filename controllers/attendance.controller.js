import Enroll from "../models/enroll.model.js";

// helper function to prevent attendace marking on saturday and sunday
//check if weekend
const weekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// start of the day
const getStartOFDay = (date) => {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);

  return start;
};

//end of the day
const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(13, 59, 59, 999);

  return end;
};

// get working days
const getWOrkingDays = (startDate, EndDate) => {
  const workingDays = [];
  const current = new Date(startDate);
  while (current <= EndDate) {
    if (!weekend(current)) {
      workingDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1); // move to the next day
  }
  return workingDays;
};

// mark attendance

export const markAttendance = async (req, res) => {
  try {
    const { email } = req.body;
    //validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    //validate student enrollment
    const student = await Enroll.findOne({ email });

    if (!student) {
      return res.status(400).json({ message: "student not enrolled" });
    }

    // check if weekend
    const today = new Date();
    console.log("Todays Date: ", today);

    if (weekend(today)) {
      return res
        .status(400)
        .json({ message: "Attendance can not be marke on weekend" });
    }

    // prevent marking attendance twice
    const startofDay = getStartOFDay(today);
    const endofDay = getEndOfDay(today);

    const allreadyMarked = student.attendance.some((record) => {
      const recordDate = new Date(record.date);
       const isSameDay = recordDate.toDateString() === today.toDateString();
     
      return isSameDay;
    });
    

    if (allreadyMarked) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // marke the student present
    student.attendance.push({
      date: today,
      status: "present",
    });

    await student.save();

    return res.status(200).json({
      message: "Attendance Marked successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//autoMarkAbsence

export const autoMarkAbsence = async (req, res, next) => {
  try {
    // to get todays date and time
    const today = new Date();

    //dont run if it is weekend
    if (weekend(today)) {
      const message = "Weekend - No auto-marking needed";
      console.log(message);

      if (res) {
        return res.status(200).json({ message });
      }

      return;
    }

    //check if the current time is between 9am and 1:59pm
    const dayBegins = getStartOFDay(today);
    const dayEnds = getEndOfDay(today);

    //return all student list in the data base
    const students = await Enroll.find({});

    // to count how many of student is present and absent
    let MarkedCount = 0;

    //check if student have attendance for the day
    for (const student of students) {
      const markToday = student.attendance.some((record) => {
        //get the date from the record
        const recordDate = new Date(record.date);

        return (
          record.status === "present" &&
          recordDate >= dayBegins &&
          recordDate <= dayEnds
        );
      });
      //
      if (!markToday) {
        student.attendance.push({
          date: today,
          status: "absent",
        });

        await student.save();
        MarkedCount++;
        console.log(
          `Auto marked ${student.email} as absent today ${today.toDateString()}`
        );
      }

      const message = `The total students marked absent today is ${MarkedCount}`;
      console.log(message);
    }
  } catch (error) {}
};

// //getOverallAttendance
export const getOverallAttendance = async (req, res, next) => {
  try {
    const students = await Enroll.find();

    const data = students.map(student => {
      const records = student.attendance || [];

      const total = records.length;
      const present = records.filter(r => r.status === "present").length;
      const absent = records.filter(r => r.status === "absent").length;

      const percentage = total > 0
        ? ((present / total) * 100).toFixed(2)
        : "0";

      return {
        id: student._id,
        fullname: `${student.firstname} ${student.lastname}`,
        email: student.email,
        track: student.learningtrack,
        present,
        absent,
        total,
        attendancePercentage: percentage,
      };
    });

    res.status(200).json({
      message: "All students with attendance summary",
      students: data
    });

  } catch (error) {
    next(error);
  }
};

// //get StudentWith Attendance
// export const getStudentWithAttendance = async (req, res, next) => {

// }

// //getstudentattendance
// export const getstudentattendance = async (req, res, next) => {

// }
