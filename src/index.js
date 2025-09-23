import { config } from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";
config()

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port`, process.env.PORT);
        })
    })
    .catch(err => {
        console.log("connection error", err);
    })