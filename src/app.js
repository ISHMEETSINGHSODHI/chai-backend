import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
// app is made in express all the properties are transfered into in the form of the property 
const app = express()


app.use(cors({
    origin:process.env.CORD_ORIGIN,
    credentials:true 
}))


app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended:true ,limit : "16kb "}));
app.use(express.static("public"));
app.use(cookieParser())


//routes import 
 import userRouter from './routes/user.routes.js'


 // routes decleration 
app.use ('/api/v1/users',userRouter)
//https://localhost:8000/api/v1/users/register 
export   { app };
