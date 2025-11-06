import { Router } from "express";
import { autoMarkAbsence, markAttendance } from "../controllers/attendance.controller.js";


const attendaceRouter = Router()


attendaceRouter.post('/mark', markAttendance)








export default attendaceRouter;