import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    avatar: {
        type: String, // cloudinary url
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWFaFKG08hKUN7BKpPlEq3dzSRjxAie-jJlQ&s"
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: true,
        min: 8
    },
    refreshToken: {
        type: String
    }
},
    { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

userSchema.methods.comparePassword = async function (password) {
    const checkPassword = await bcrypt.compare(password, this.password)

    return checkPassword;
}

userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });

    return token;
}

userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id: this._id,
    }

    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

    return token;
}

const User = model("User", userSchema);

export default User;
