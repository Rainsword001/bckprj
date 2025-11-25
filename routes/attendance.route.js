import { Router } from "express";
import {authMiddleware }from '../middlewares/admin.auth.js'
import { autoMarkAbsence, markAttendance, filterByTrack, getAttendacneByDateRange, getOverallAttendance, getAttendanceByName, AdminSummary, getTop10Students, getTop10StudentsPerTrack} from "../controllers/attendance.controller.js";


const attendaceRouter = Router()


attendaceRouter.post('/mark', markAttendance)
attendaceRouter.get('/atd/filter', authMiddleware, getAttendacneByDateRange);
attendaceRouter.get('/atd/track',authMiddleware , filterByTrack);
attendaceRouter.get('/atd/filterbyname',authMiddleware , getAttendanceByName);
attendaceRouter.get('/atd/summry',authMiddleware , AdminSummary);
attendaceRouter.get('/atd/all', authMiddleware ,getOverallAttendance);
attendaceRouter.get('/atd/best',authMiddleware , getTop10Students);
attendaceRouter.get('/atd/top10', authMiddleware ,getTop10StudentsPerTrack)









export default attendaceRouter;