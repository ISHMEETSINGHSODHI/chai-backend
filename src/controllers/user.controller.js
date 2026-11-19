import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/users.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiREsponse} from "../utils/ApiREsponse.js"; 



// const registerUser = asyncHandler( async (req , res ) => {
//     res.status(200).json({
//         message:"OK"
//     })
// })
const registerUser = asyncHandler( async (req , res ) => {
//  writing the steps for the registration of the user 
//  Collect the form(that is the information from the user that is registrating )
// get hat form validated that is  the email , username 
// pass the values in the DB and give the user an registration complete message 

//get the user detail from the frontend. // from the postman 
// Vaildation - Not empty  
// check if user already exists : username, email 
// check for images , check for avatar 
// upload them to cloudinary , avatar (if the middelware called multer did the upload )
// create user object - create entery in db
// remove password and the refresh token  field fron the response like we dont want the user to get the password that is encrypted to the user again and again 
// check for the user creation  
// return the response to the user 
  const {username,email,fullname,password}= req.body 
//  console.log ("email", email);
//  if (fullname === "") {
//   throw new ApiError(400,"full name is required")
//  }

 if (
  [fullname,email,password,username].some((field) => field?.trim() === "") ) 
  {
    throw new ApiError(400 , "all fields are must MF ") // my friend 
  }
const existedUser = await User.findOne({
  $or: [{ username }, { email }],
});

if (existedUser) {
  throw new ApiError(409, "User with email or username already exists");
}
//console.log(req.files);
const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(400, "Avatar file is required");
}
 const avater  =  await uploadOnCloudinary (avatarLocalPath);
 const coverImage = await uploadOnCloudinary(coverImageLocalPath);

 if(!avater){
  throw new ApiError (400,"Avatar image is not present ")
 }

  const user = await User.create({
     fullname,
     avatar:avater.url,
     coverImage : coverImage?.url || "",
     email,
     password ,
     username : username.toLowerCase()
 })
   
 const createdUser = await User.findById(user._id).select(
  "-passowrd -refreshTokens"
 )
 if (!createdUser) {
  throw new ApiError(500,"Some tthing went wrong wile registring the user ")
 }
     
return res
  .status(201)
  .json(new ApiREsponse(200, createdUser, "User registered successfully"));
}) 
export {registerUser}
