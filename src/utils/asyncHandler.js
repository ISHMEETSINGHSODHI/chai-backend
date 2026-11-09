const asyncHandler =  (requestHandler)=>{
    return(req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}
//just an method bana kar  export the 



export  default asyncHandler


// const asyncHandeler = (fn) => { () => {}}
// const asyncHandeler = (fn) => () => {}
// const asyncHandeler = (fn) => async() => {}

// const asyncHandeler = (fn) => async (req ,res ,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message: err.message

//         })
//     }
// }