import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from  "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js"

app.use("/api/v1/user",userRoutes);

app.use("/api/v1/video",videoRoutes);

export default app;