import { Router } from "express";
import {
    getVideoById,
    publishAVideo,
    updateVideoDetails,
    updateVideoThumbNail

} from "../controllers/video.controller.js";
import { upload } from "../middelwears/multer.middelwear.js";
import { verifyJWT } from "../middelwears/auth.middelwear.js";

const router = Router();

router.use(verifyJWT);

router.post("/publish-video",
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbNail",
            maxCount: 1,
        },

    ]),
    publishAVideo
)

router.get(
    "/:videoId",
    getVideoById
);

router.patch(
    "/update-video-details/:videoId",
    updateVideoDetails
);

router.patch(
    "/update-video-thumbnail/:videoId",
    upload.single("thumbNail"),
    updateVideoThumbNail
);



export default router;