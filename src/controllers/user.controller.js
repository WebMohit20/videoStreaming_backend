import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, avatar, coverImage, password } = req.body;

    if([username,email,fullname,password].some(field=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }

    const existUser = await User.findOne({
        $or:[email,username]
    })

    if(existUser){
        throw new ApiError(409 ,"User with email or username is already exist");
    }

    console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar field is required");
    }

    const avatarResult = await uploadonCloudinary(avatarLocalPath);

    if(!avatarResult.url){
        throw new ApiError(400,"Avatar file is required");
    }
    let coverImageResult;
    if(coverImageLocalPath){
        coverImageResult = await uploadonCloudinary(coverImageLocalPath);
    }

    const newUser = await User.create({
        username,
        email,
        fullname,
        avatar:avatarResult.url,
        coverImage:coverImageResult.url || "",
        password
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user");
    }

    return res.status(200).json(new ApiResponse(200,createdUser,"User registered successfully"));

})