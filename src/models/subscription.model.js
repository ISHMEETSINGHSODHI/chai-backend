import mongoose,{Schema, schema} from "mongoose";
import { User } from "./users.model";

const subscriptionSchema = new schema ({
    subscription :{
        type: Schema.Types.ObjectId, // one who is subscribing to the paid model 
        ref: "User"
    },
    channel: {
        type:Schema.Types.ObjectId,  // one to whome subscriber is subscribing  
    }
}, {timestamps: true })














export const Subscription = mongoose.model("Subscription",subscriptionSchema)