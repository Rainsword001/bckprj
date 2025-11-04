import { Router } from "express";

import {studentEnroll, getAllEnrolled  } from "../controllers/enroll.controller.js";

const enrollRouter = Router();

enrollRouter.post('/enroll', studentEnroll );

enrollRouter.get('/allstudents', getAllEnrolled);




export default enrollRouter;