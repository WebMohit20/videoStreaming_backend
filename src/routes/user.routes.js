import { Router } from "express";
import { login, logout, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middelwears/multer.middelwear.js";
import { verifyJWT } from "../middelwears/auth.middelwear.js";

const router = Router();

router.post("/register",upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser);

router.post("/login",login);

router.post("/logout",verifyJWT,logout);

export default router;