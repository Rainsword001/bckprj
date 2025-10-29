import { Router } from "express";

import { SignUp, SignIn } from "../controllers/auth.controllers.js";


const authRouter = Router();

authRouter.post('/signup', SignUp)

authRouter.post('/signin', SignIn)



export default authRouter;