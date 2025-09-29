import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

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

    // console.log(req.files?.coverImage)
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
            $unset: { refreshToken: 1 }
        },
        { new: true }
    )

    return res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, {}, "Logout successfully"));

})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (token !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed")
        )

})

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new password required");
    }
    // console.log(req.user.comparePassword);
    // const user = await User.findById(req.user._id)
    const { user } = req;
    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }
    // console.log("old",user);
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })
    // console.log("new",user);


    return res.status(200).json(new ApiResponse(200, {}, "Password change successfully"));
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ));
})

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullname } = req.body;

    const { user } = req;

    if (!email && !fullname) {
        throw new ApiError(400, "Provide email or either fullname or both");
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set: {
                email: email || user.email,
                fullname: fullname || user.fullname
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser,
            "Updated successfully"
        ));
})

export const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarResult = await uploadonCloudinary(avatarLocalPath);


    if (!avatarResult?.url) {
        throw new ApiError(400, "Avatar file is required");
    }

    const updatedUser = User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatarResult.url
            }
        },
        {new :true}
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser,
            "Avatar updated successfully"
        ))
})

export const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is required");
    }

    const coverImageResult = await uploadonCloudinary(coverImageLocalPath);

    if (!coverImageResult?.url) {
        throw new ApiError(400, "Cover Image file is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImageResult.url
            }
        },
        {new :true}
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedUser,
            "Cover Image updated successfully"
        ));
})

export const getUserChannelProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;
    
    if(!username){
        throw new ApiError(400,"Username is missing");
    }

    const channelProfile = await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribers"
            }
        },
        // {$unwind:"$subscribers"},
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribeTo"
            }
        },
        // {$unwind:"$subscribeTo"},
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribeToCount:{
                    $size:"$subscriberTo"
                },
                // isSubs
            }
        },
        {
            $project:{
                username:1,
                fullname:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                channelSubscribeToCount:1,
                email:1
            }
        }
    ])
})