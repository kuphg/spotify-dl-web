import express from "express";
import dotenv from "dotenv";
dotenv.config();

import idRoute from "./routes/id";
var app = express();

app.use('/id', idRoute);
app.listen(3000, () => console.log("Listening"));

