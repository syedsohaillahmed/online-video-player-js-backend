import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // return res.jsonuserName
  
console.log("coming here")
  const { userName, email, fullName, password } = req.body;


  if([userName, email, password, fullName].some((fields)=> fields?.trim()==="")){
    throw new ApiError(400, "Fields are required")
  }

  const existingUser = await User.findOne({$or: [{userName}, {email}]})
  if(existingUser){
    throw new ApiError(400, "Username or email alredy exist")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  // const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
    coverImageLocalPath = req.files?.coverImage[0]?.path
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "Failed To UPload Avatar")
  }


  const createdUser = await User.create({
    email:email,
    fullName:fullName,
    userName:userName,
    password:password,
    coverImage: coverImage?.url || "",
    avatar:avatar.url
  })

  const userDetails = await User.findOne(createdUser._id).select("-password, -refreshToken")
  if(!userDetails){
    throw new ApiError(400, "Something went wronng While creating User")
  }





  res.status(200).json( new ApiResponse(200, userDetails, "User Created Successfully" ));

});

export { registerUser };
