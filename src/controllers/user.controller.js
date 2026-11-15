import asyncHandler from "../utils/asyncHandler.js";



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
 console.log ("email", email);

})
 

export {registerUser}