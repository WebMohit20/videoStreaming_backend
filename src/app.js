import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

import userRoute from  "./routes/user.routes.js";


app.use("/api/v1/user",userRoute);

export default app;