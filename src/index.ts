import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userRouter } from "./Routes/users.route";
import { fileRouter } from "./Routes/files.route";
// origin: process.env.FRONTEND_URL || "http://localhost:5173" || "*"
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173" ,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.text());
app.use(cookieParser());
app.use(express.static("audios_finales/uploads/podcast"));
app.use("/users", userRouter);
app.use("/uploads", fileRouter);

app.get("/", (req, res) => {
  console.log(req.body);

  res.send();
});

// Refactorizar el endopint de subida de imagenes **********************
// app.post("/upload", upload.single("imagenPost"), (req, res) => {
//   console.log(req.file);
//   res.send("terminó");
// });

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
