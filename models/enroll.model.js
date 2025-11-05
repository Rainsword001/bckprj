import mongoose from "mongoose";

// ATTENDANCE SHEMA

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    require: true
  },
  status: {
    type: String,
    enum:["presenr", "absent"],
    require: true,
    default: true
  },
  _id: false
})





//  ENROLL SCHEMA

const enrollSchema = new mongoose.Schema({
    firstname:{
        type: String,
        require: [true, "Please enter "],
        trim: true,
        minLength:[5, "Name must be at least 5 characters"]
    },

    lastname:{
         type: String,
        require: [true, "Please enter your lastname"],
        trim: true,
        minLength:[5, "Name must be at least 5 characters"]
    },
    email:{
         type: String,
        require: [true, "Please enter your email"],
        trim: true,
        lowercase: true,
        minLength:[10, "email must be at least 5 characters"],
        match:[/\S+@\S+.\S+/]
    },
    phonenumber:{
         type: Number,
        require:[ true, "Please enter your number"],
        trim: true,
        unique: true,
        minLength:[10, "Name must be at least 10 digits"],
        match:[/^\+?[1-9]\d{1,14}$/, "Invalid phone number"]
    },

    gender:{
        type: String,
        require: true,
        enum:["male", "female"]
    },
    learningtrack:{
        type: String, 
        require:[ true, " Please select your gender"],
        enum:[
        "Data Analytics",
        "Cyber Security",
        "Cloud Computing",
        "Fullstack Development",
        "Backend Development"
    ]},

    attendance: [{
        type: [attendanceSchema],
        default: []
    }]


},{ timestamps: true});

// helps us search using index
enrollSchema.index({email: 1});
enrollSchema.index({"attendance.date": 1})

//combine firstname and lastName together to search faster using fullname

enrollSchema.virtual("fullname").get(function (){
    return `${this.firstname} ${this.lastname}`
})

//get attendance percentage

enrollSchema.methods.getAttendancePercentage = function (){
    //step 1: Check if student has attendance record
    if(this.attendance.lenght === 0) return 0;

    //step 2: count how many times they were present

    const presentCount = this.atttendance.filter((record) => record.status === "present").lenght;

    // step 3: calculate the percentage
    // formula: (present days/ total days) * 100

    return ((presentCount / this.attendance.lenght)* 100).toFixed(2)
}

// method to get attendance by date range
enrollSchema.methods.getAttendanceByDataRange = function (startDate, endDate) {
    return this.attendance.filter((record)=> {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    })

}

// find student with lower percentage streak
enrollSchema.statics.findLowAttendanceStudents = async (threshold = 75)=> {
    //step 1: Get all students from database
    const students = await this.find({});

    //step 2: filter students with attendance below threshold
    return students.filter((student) => {
        const percentage = student.getAttendancePercentage();
      return parseFloat(percentage) < threshold;
    })
}


const Enroll = mongoose.model("Enroll", enrollSchema)

export default Enroll;