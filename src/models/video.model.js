import { Schema,model } from "mongoose";

const videoSchema = new Schema({
    videFile:{
        type:String,
        required:true
    },
    thumbNail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    
})

const Video = model("Video",videoSchema);

export default Video;