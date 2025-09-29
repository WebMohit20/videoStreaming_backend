import { Schema,model } from "mongoose";

const playlistSchema = new Schema({
    name:{
        type:String,
        trim:true
    },
    description:{
        type:String,
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",

    }

},
{timestamps:true});

const Playlist = model("Playlist",playlistSchema);

export default Playlist;