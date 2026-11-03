import mongoose, {schema, SchemaType} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { use } from "react";

const userschema = new schema (
    
    { username: {

        type: String,
        require: true,
        unique: true,
        lowecase: true,
        trim: true,
        index: true

    },
    email: {

        type: String,
        require: true,
        unique: true,
        lowecase: true,
        trim: true

    },
    fullname: {

        type: String,
        require: true,
        trim: true,
        index: true

    },
    avatar: {
        type: String,//coludnary URL
        required:true,
    },
    coverImage: {
        type: String, // cloudnary URL 

    },
    whatchHistory:[ {
        type : Schema.Type.ObjectID,
        ref:"Video"
    }],
    password: {
        type:String,
        require:[true,"Password is required"]
    },
    refreshTokens : {
        types:String
    }

    },
    {
        timestamps:true
    }

)

userschema.pre("save" , async function (next){
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password ,10 )
    next()
} )

userschema.method.isPasswordCorrect = async function (password){
   return await  bcrypt.compare(password,this.password)
}

userschema.methods.generateAccessTokens = function(){
    return jwt.sign(
        {
         _id:this._id,
         email:this.email,
         username:this.username,
         fullname:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIREY
        }
    )
}
userschema.methods.generateRefreshTokens = function (){
    return jwt.sign( 
        {
         _id:this._id,
        },
        process.env.REFRESH_TOKENS_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIREY
        }
    
    )
}

userschema.methods.generateRefreshTokens = function(){}

export const  User =mongoose.model("User",userschema)