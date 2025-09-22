import mongoose from "mongoose";
import { DB_Name } from "../constants.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
        console.log(conn.connection.host);
        
    } catch (error) {
        console.log("DB connection error",error);
        process.exit(1);
    }
}

export default connectDB;