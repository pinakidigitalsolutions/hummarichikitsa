import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { Login, Register } from "../controller/admin.controller.js";
const route=Router();

route.post('/login',Login)
route.post('/register',Register)


export default route