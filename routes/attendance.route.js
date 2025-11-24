import { Router } from "express";
import { autoMarkAbsence, markAttendance, filterByTrack, getAttendacneByDateRange, getOverallAttendance, getAttendanceByName, AdminSummary, getTop10Students, getTop10StudentsPerTrack} from "../controllers/attendance.controller.js";


const attendaceRouter = Router()


attendaceRouter.post('/mark', markAttendance)
attendaceRouter.get('/atd/filter', getAttendacneByDateRange);
attendaceRouter.get('/atd/track', filterByTrack);
attendaceRouter.get('/atd/filterbyname', getAttendanceByName);
attendaceRouter.get('/atd/summry', AdminSummary);
attendaceRouter.get('/atd/all', getOverallAttendance);
attendaceRouter.get('/atd/best', getTop10Students);
attendaceRouter.get('/atd/top10', getTop10StudentsPerTrack)









export default attendaceRouter;