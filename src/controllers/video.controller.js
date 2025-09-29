import Video from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import { uploadonCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userID } = req.query;

    const videos = await Video.aggregate([

    ])
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Give Title and Description of video");
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;

    const thumbNailLocalPath = req.files?.thumbNail[0]?.path

    if(!videoLocalPath || !thumbNailLocalPath){
        throw new ApiError(400,"Video and thumnail file is required");
    }

    const videoResult = await uploadonCloudinary(videoLocalPath);


    const thumbNailResult = await uploadonCloudinary(thumbNailLocalPath);

    console.log(videoResult);

    if(!videoResult?.url || !thumbNailResult?.url){
        throw new ApiError(400,"Video and thumnail file is required");
    }


    const publishedVideo = await Video.create({
        videFile:videoResult.url,
        thumbNail:thumbNailResult.url,
        title,
        description,
        duration:videoResult.duration,
        isPublished:true,
        owner:req.user._id
    })


    return res.status(200).json(new ApiResponse(200,publishedVideo,"video published successfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Provide video Id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(401, "Video id is not valid");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video by Id"));
})



export {
    publishAVideo,
    getVideoById
}