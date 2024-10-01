import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req?.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");
      console.log("token", token)
    if (!token) {
      throw new ApiError(400, "Unauthorized Access");
    }
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decodedToken", decodedToken)

    const userDetails = await User.findById(decodedToken.id).select(
      "-password -refreshToken"
    );
    console.log("userDetails", userDetails)

    if (!userDetails) {
      throw new ApiError(400, "User Does not Exist");
    }
  
    req.user = userDetails;
    next();
  } catch (error) {
    throw new ApiError(400, "Something went wrong while Verifying JWT")
  }
});
