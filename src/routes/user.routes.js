import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    login,
    logout,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middelwears/multer.middelwear.js";
import { verifyJWT } from "../middelwears/auth.middelwear.js";

const router = Router();

router.post(
    "/register",
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.post(
    "/login",
    login
);

router.post(
    "/logout",
    verifyJWT,
    logout
);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/change-password",
    verifyJWT,
    changeCurrentPassword
);

router.get(
    "/current-user",
    verifyJWT,
    getCurrentUser
);

router.patch(
    "/update-account-details",
    verifyJWT,
    updateAccountDetails
);

router.patch(
    "/update-avatar",
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.patch(
    "/update-coverImage",
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

export default router;