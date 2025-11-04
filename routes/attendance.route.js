import { Router } from "express";

import { markAttendance } from "../controllers/attendance.controller.js";


const markRoute = Router();

markRoute.post('/attendance', markAttendance)





export default markRoute;