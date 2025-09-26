import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";


const generateRefreshAndAccessToken = async (userID) => {
    try {
        const user = await User.findById(userID);
       
        const refreshToken = user.generateRefreshToken();

        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };
    } catch (error) {
        throw new ApiError(500, `Something went wrong ${error.message}`);
    }
}

export const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, avatar, coverImage, password } = req.body;
    if ([username, email, fullname, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existUser) {
        throw new ApiError(409, "User with email or username is already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    console.log(req.files?.coverImage)
    let coverImageLocalPath;
    if (req.files?.coverImage && req.files?.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar field is required");
    }

    const avatarResult = await uploadonCloudinary(avatarLocalPath);
    // console.log(avatarResult)

    if (!avatarResult?.url) {
        throw new ApiError(400, "Avatar file is required");
    }
    let coverImageResult;
    if (coverImageLocalPath) {
        coverImageResult = await uploadonCloudinary(coverImageLocalPath);
    }

    const newUser = await User.create({
        username,
        email,
        fullname,
        avatar: avatarResult.url,
        coverImage: coverImageResult?.url || "",
        password
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(200).json(new ApiResponse(200, createdUser, "User registered successfully"));

})

export const login = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(req.body);
    if ((!username && !email) || !password) {
        throw new ApiError(400, "Username or either email and password is required");
    }

    const findUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!findUser) {
        throw new ApiError(404, "Invalid username or either email");
    }
    
    const isPasswordCorrect = await findUser.comparePassword(password);
    
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(findUser._id);
    // console.log("accessToken",accessToken);

    const loggedInUser = await User.findById(findUser._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(new ApiResponse(200, {
            user: loggedInUser
        }, "User loggedin successfully"))

})

export const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $unset: { refreshToken: "" }
        },
        { new: true }
    )

    return res
    .status(200)
    .clearCookie("accessToken",{httpOnly:true,secure:true})
    .clearCookie("refreshToken",{httpOnly:true,secure:true})
    .json(new ApiResponse(200,{},"Logout successfully"));

})