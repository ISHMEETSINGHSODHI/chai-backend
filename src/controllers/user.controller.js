import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiREsponse } from "../utils/ApiREsponse.js";
import { verify } from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
//   console.log("ENV CHECK:", !!process.env.ACCESS_TOKEN_SECRET, !!process.env.REFRESH_TOKEN_SECRET, process.env.ACCESS_TOKEN_EXPIRY, process.env.REFRESH_TOKEN_EXPIRY);
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("TOKEN ERROR:", error);
    throw new ApiError(500, "Something went wrong while generating the refresh and access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if ([fullname, email, password, username].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiREsponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiREsponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiREsponse(200, {}, "User logged out"));
});

const refreshAcessToken = asyncHandler(async(res,req)=> {
  const incomingRefrehToken = req.cookie.refreshToken || req.body.refreshToken
if (!incomingRefrehToken) {
  throw new ApiError(401,"unauthorized request ")
}


try {
  const decodedToken = jwt.verify(
    incomingRefrehToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  const user = await User.findById(decodedToken?._id)
  
  
  if (!user) {
    throw new ApiError(401,"Invalid Refresh Token ")
  } 
  
  if (incomingRefrehToken    !== user?.refreshAcessToken ) {
    throw new ApiError (401,"Refresh Token is Expired or Used ")
  }
  
  const options ={
    httpOnly: true,
    secure: true 
  }
  
    const {accessToken,newRefreshToken}=await generateAccessandRefreshTokens(user._id)
  
  return res 
     .status(200)
     .cookie(accessToken,accessToken,options )
     .cookie(refreshToken,newRefreshToken,options )
     .json (
      new ApiREsponse(
        200,
        {accessToken,refreshToken:newRefreshToken},
        "Access Token Refreshed "
      )
     )
  
} catch (error) {
  throw new ApiError(401,error?.message || " Invalid Refresh Token ")
}
})

const changeCurrentPassword = asyncHandler(async(req,res)=> {


  const {oldPassword,newPassword,confirmPassword } = req.body
  
  if (!(newPassword === confirmPassword)){
    throw new ApiError (400,"The Confirm Password and the New Password is not Same  ")
  }
  const user = await User.findById(req.user?.id)
  const isPasswordCorrect  =await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError (400,{},"The Old Password is incorrect or Invalid Old Password ")
    
  }
   user.password =newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(
      new ApiREsponse (200,{},"Password Changed Sucessfully ")
    )


  })
    const getCurrentuser = asyncHandler(async (req,res)=> {
          return res 
          .status(200)
          .json (200, req.user ,"Current User feched Sucessfully ")
        })



export { registerUser, loginUser, logoutUser,refreshAcessToken,changeCurrentPassword};