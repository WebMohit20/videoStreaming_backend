import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { config } from "dotenv";
config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadonCloudinary = async (localFilepath) => {
    try {
        if (!localFilepath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilepath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilepath)
        // console.log("uploadoncloud",uploadResult);
        // console.log("File uploaded successfully", uploadResult.secure_url);

        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilepath) // it will remove localy saved files
        return null;
    }
}

export { uploadonCloudinary,cloudinary };