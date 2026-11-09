import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null 
    // Upload the file in the cloudnary 
      const respose = await cloudinary.uploader.upload(localFilePath,{
      resource_type:'auto'
    })

    // file has been uploaded successfully 
    console.log("file is uploaded on the cloudinary ",respose.url); 
     return respose;

  } catch (error) {
    fs.unlinkSync(localFilePath)  // removes the locally saved  temporary file if the  upload operation get fail // make all the comments related to the operation an function is performing 
    return null;
  }
}


cloudinary.v2.uploader
.upload("dog.mp4", {
  resource_type: "video", 
  public_id: "my_dog",
  overwrite: true, 
  notification_url: "https://mysite.example.com/notify_endpoint"})
.then(result=>console.log(result));

export  {uploadOnCloudinary}