import Video from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.model.js"
import { deletefromCloudinary, uploadonCloudinary } from "../utils/cloudinary.js"

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

    if (!videoLocalPath || !thumbNailLocalPath) {
        throw new ApiError(400, "Video and thumnail file is required");
    }

    const videoResult = await uploadonCloudinary(videoLocalPath);


    const thumbNailResult = await uploadonCloudinary(thumbNailLocalPath);

    console.log(videoResult);

    if (!videoResult?.url || !thumbNailResult?.url) {
        throw new ApiError(400, "Video and thumnail file is required");
    }


    const publishedVideo = await Video.create({
        videFile: videoResult.url,
        thumbNail: thumbNailResult.url,
        title,
        description,
        duration: videoResult.duration,
        isPublished: true,
        owner: req.user._id
    })


    return res.status(200).json(new ApiResponse(200, publishedVideo, "video published successfully"));

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

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Provide Video id");
    }

    if (!title && !description) {
        throw new ApiError(400, "Provide either title or description");
    }

    const foundVideo = await Video.findById(videoId);
    if (!foundVideo) {
        throw new ApiError(404, "Video not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || foundVideo.title,
                description: description || foundVideo.description
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"));


})

const updateVideoThumbNail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const thumbNailLocalPath = req.file.path;

    if (!videoId) {
        throw new ApiError(400, "Provide video id");
    }

    if (!thumbNailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const thumbNailResult = await uploadonCloudinary(thumbNailLocalPath);

    if (!thumbNailResult?.url) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const video = await Video.findById(videoId);

    const updatedVideoThumbNail = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbNail: thumbNailResult.url
            }
        },
        { new: true }
    )

    if (updatedVideoThumbNail) {
        const thumbNailId = video
            .thumbNail
            .split("/")
            .pop()
            .split(".")[0];
        await deletefromCloudinary(thumbNailId);
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedVideoThumbNail,
            "Thumbnail updated successfully"
        ));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Provide Video Id");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found")
    }
    const videoPublicId = deletedVideo.videFile.split("/").pop().split('.')[0];
    await deletefromCloudinary(videoPublicId);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        ));
})

export {
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    updateVideoThumbNail,
    deleteVideo
}