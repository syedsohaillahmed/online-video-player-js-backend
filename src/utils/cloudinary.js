import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on cloudinary
    const cloudUploadResp = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
    //after sucessfull upload
    // console.log("file uploaded sucessfully", cloudUploadResp)
    return cloudUploadResp

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temprorary file as upload operation got failed
    return null
  }
};

export {uploadOnCloudinary}
