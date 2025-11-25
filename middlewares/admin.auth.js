import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const authMiddleware = async (req, res, next) =>{
    try {
        const token = req.headers["authorization"]?.split(' ')[1];
        if(!token){
            return res.status(400).json({message: "Access denied, Token required"})
        };
        const verified = jwt.verify(token, JWT_SECRET)
        req.auth = verified
        next();
    } catch (error) {
        res.status(400).json({message: "Invalid token"})
    }
}


