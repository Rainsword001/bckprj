import mongoose from "mongoose";


const AdminSchema = new mongoose.Schema({
    name:{type:  String, 
        require: true, 
        trim: true, 
        minLength: [5, "name must be at least 5 characters"]
    },

    email:{type: String, 
        require:[true, "please enter your email"], 
        trim: true, 
        lowercase: true, 
        match: [/\S+@\S+.\S+/], 
        minLength:[10, "email must be at least  10 characters"]
    },
    password: {type: String, 
        require:[true, "Please enter your password"], 
        trim: true, 
        minLength:[8, "password must be at least 8 characters"]
    },
    track:{type: String, 
        require: true, 
        enum:[
        "Data Analytics",
        "Cyber Security",
        "Cloud Computing",
        "Fullstack Development",
        "Backend Development"
    ]}
}, {timestamps: true})




const admin = mongoose.model("admin", AdminSchema);

export default admin;