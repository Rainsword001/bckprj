import { Router } from "express";
import { autoMarkAbsence, markAttendance, getOverallAttendance} from "../controllers/attendance.controller.js";


const attendaceRouter = Router()


attendaceRouter.post('/mark', markAttendance)
attendaceRouter.get("/attendance/students", getOverallAttendance);








export default attendaceRouter;