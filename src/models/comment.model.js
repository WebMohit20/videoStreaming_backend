import { Schema,model } from "mongoose";

const commentSchema = new Schema({
    content:{
        type:String,
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

const Comment = model("Comment",commentSchema);

export default Comment;