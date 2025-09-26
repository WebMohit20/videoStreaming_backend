import { Router } from "express";
import { 
    changeCurrentPassword,
    login,
    logout,
    refreshAccessToken,
    registerUser
} from "../controllers/user.controller.js";
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

router.post("/refresh-token",refreshAccessToken);

router.post("/change-password",verifyJWT,changeCurrentPassword);

export default router;