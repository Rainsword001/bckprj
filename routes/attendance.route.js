import { Router } from "express";
import { autoMarkAbsence, markAttendance, getAttendacneByDateRange, getAttendanceByName} from "../controllers/attendance.controller.js";


const attendaceRouter = Router()


attendaceRouter.post('/mark', markAttendance)
attendaceRouter.get('/atd/filter', getAttendacneByDateRange);
// attendaceRouter.get('/atd/track', filterByTrack);
attendaceRouter.get('/atd/filterbyname', getAttendanceByName);









export default attendaceRouter;