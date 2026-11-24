import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/users.model.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiREsponse} from "../utils/ApiREsponse.js";


const  generateAccessandRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = generateRefreshTokens()
    const accessToken = generateAccessTokens() // there are the mehods that we are makin an call to thanks 
   

    user.refreshToken = refreshToken
     await  user.save ( { validateBeforeSave : false  }) 
     
     return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError (500, "Something went wrong while generating the access and refresh token ")
    
  }
} 
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
});

const loginUser = asyncHandler(async (req,res) => { 
// Now writhing the to do's what we wnated to do while 
// making the user login and doing the due deligence for facilatating the login to the user  
// collect the use the info if the user is not. registered or collect the session token 
// from  the user in the heade of the API request 
//  ift the session token is expired the ask the user for the refresh token and make the session token store it and
//  send the  new session token including the sucessful message and rever the user the services and initia ted the other 
// functions to the user and and  that's it thanks that's it. 

//  sir thinking skills 
// req body 
// email / username 
//password check 
// access and refresh tokens 
//  now send the secure cookies to the user 

const {email,username,password} = req.body 

if (!username && !email) {
  throw new ApiError(400, "For Login Username or Email is required")  
}

const user =await User.findOne({
  $or: [{username},{email}]
})

if (!user){
  throw new ApiError (404, "User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if (!isPasswordValid){
  throw new ApiError (401, "Invalid user Credentials")

 
}
 const {accessToken,refreshToken}= await generateAccessandRefreshTokens (user._id);

const loggedInUser =  await User.findById(user._id).select("-password-refreshToken")

const options = {
 httpOnly: true,
 secure:true
}
return res.status(200)
.cookie("accessTokens",accessToken,options)
.cookie("refreshTokens",refreshToken,options)
.json (
    new ApiREsponse(
     200,
     { 

      user :loggedInUser,refreshToken,accessToken
     },
      "User Logged in Sucessfully "
    )
  )

} )
const logoutUser = asyncHandler(async(req,res)=> {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken : undefined
      }
    },  
      {
        new : true 
      }
    
  )
  const options = {
 httpOnly: true,
 secure:true
}
return res 
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiREsponse(200,{},"User Logged Out "))
})



export {
  registerUser,
  loginUser,
  logoutUser
}
