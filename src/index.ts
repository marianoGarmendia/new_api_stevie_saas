import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userRouter } from "./Routes/users.route";
import { fileRouter } from "./Routes/files.route";
// origin: process.env.FRONTEND_URL || "http://localhost:5173" || "*"
const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL, // URL de producción
  "http://localhost:5173",  // URL local para desarrollo
];  

app.use(
  cors({
    origin: (origin, callback)=>{
      if (allowedOrigins.includes(origin) || !origin) {
        // Permitir solicitudes desde orígenes válidos o solicitudes sin origen (como herramientas de prueba)
        callback(null, true);
      } else {
        // Rechazar otros orígenes
        callback(new Error("No permitido por CORS"));
      }
    },
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
