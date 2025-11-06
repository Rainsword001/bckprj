import { Router } from "express";

import {studentEnroll } from "../controllers/enroll.controller.js";

const enrollRouter = Router();

enrollRouter.post('/enroll', studentEnroll );



export default enrollRouter;