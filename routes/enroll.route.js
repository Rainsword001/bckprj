import { Router } from "express";

import {studentEnroll,  markAttendance  } from "../controllers/enroll.controller.js";

const enrollRouter = Router();

enrollRouter.post('/enroll', studentEnroll );



enrollRouter.post('/attendances', markAttendance)




export default enrollRouter;