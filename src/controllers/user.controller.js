import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccesTokenAndRefreshToken = async (userId) => {
  try {
    const userData = await User.findById(userId);
    const accessToken = userData.genrateAccessToken();
    const refreshToken = userData.genrateRefreshToken();

    userData.refreshToken = refreshToken;
    userData.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Something went wrong while creating AccessToken");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // return res.jsonuserName

  // console.log("coming here");
  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, password, fullName].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "Fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new ApiError(400, "Username or email alredy exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed To UPload Avatar");
  }

  const createdUser = await User.create({
    email: email,
    fullName: fullName,
    userName: userName,
    password: password,
    coverImage: coverImage?.url || "",
    avatar: avatar.url,
  });

  const userDetails = await User.findOne(createdUser._id).select(
    "-password, -refreshToken"
  );
  if (!userDetails) {
    throw new ApiError(400, "Something went wronng While creating User");
  }

  res
    .status(200)
    .json(new ApiResponse(200, userDetails, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  // console.log("emailcxccccccccccccccc111", req);

  // console.log("emailcxccccccccccccccc", email, password);

  if (!(userName || email)) {
    throw new ApiError(400, "UserName/email is Required");
  }

  const userData = await User.findOne({ $or: [{ email }, { userName }] });
  // console.log("userDataaaaaaaaaaaaa", userData);
  if (!userData) {
    throw new ApiError(400, "Send Valid UserName/ password");
  }

  const validPassword = await userData.isPasswordCorrect(password);
  // console.log("validPassword",validPassword)
  if (!validPassword) {
    throw new ApiError(400, "Send Valid UserName/ password");
  }

  const { accessToken, refreshToken } = await generateAccesTokenAndRefreshToken(
    userData._id
  );

  const LoggedInUserData = await User.findById(userData._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { userDetails: LoggedInUserData, refreshToken: refreshToken },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("requefwefwefwefewfewfewfewfewfwefwesttt", req.user.email)
  const result = await User.findOneAndUpdate(
    { email: req.user.email }, // Filter object
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  
  
  console.log("result", result)

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Loggedout SuccessFully"));
});

const refreshToken = asyncHandler(async (req, res)=>{
const token  = req.cookies.refreshToken || req.body.refreshToken
if(!token){
  throw new ApiError(400, "UNAuthorized Request")
}

const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
// console.log("decoded token", decodedToken)

const userData = await User.findById(decodedToken.id)
if(!userData){
throw new ApiError(400, "userdata not found")
}

if(token !== userData.refreshToken){
  throw new ApiError(400, "UnAuthorized Request")

}

const { accessToken, refreshToken } = await generateAccesTokenAndRefreshToken(decodedToken.id)

// console.log("newTokens", accessToken, refreshToken)
const options = {
  httpOnly: true,
  secure: true,
};

return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {  refreshToken: refreshToken },
        "Refreshed Token Successfully"
      )
    );
});



export { registerUser, loginUser, logoutUser, refreshToken };
