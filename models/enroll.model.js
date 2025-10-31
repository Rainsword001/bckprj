import mongoose from "mongoose";


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
        unique: true,
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
        date: {type: Number, default: 0, require: true},
        status: {
            type: String,
            enum: ["present", "absent"],
            required: true
        }
    }]


},{ timestamps: true});


const Enroll = mongoose.model("Enroll", enrollSchema)

export default Enroll;