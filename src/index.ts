import path from "path";
import * as express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import dotenv from "dotenv";
import { userRouter } from "./Routes/users.route";
import { fileRouter } from "./Routes/files.route";
// import { create_directory } from "../dir-create";
// create_directory();

dotenv.config();

// Base path para la raíz del proyecto
const rootDir = path.resolve(__dirname, "..");

// Directorios a crear
const directories = [
  path.join(rootDir, "audios_finales/uploads/podcast"),
  path.join(rootDir, "audios_temporales"),
  path.join(rootDir, "uploads/podcast"),
];

// Crear directorios si no existen
directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});
// origin: process.env.FRONTEND_URL || "http://localhost:5173" || "*"
// const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
const app = express();
// const allowedOrigins = [
//   process.env.FRONTEND_URL, // URL de producción
//   "http://localhost:5173", // URL local para desarrollo
// ];

// Para produccion descomentar esta linea
const FRONTEND_URL = process.env.FRONTEND_URL as string;

// Para desarrollo usar esta linea
// const FRONTEND_URL = "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    // Origen permitido
    // "http://localhost:5173"// Permitir localhost para desarrollo
    credentials: true,
    // Permitir credenciales (cookies, autenticación, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // Métodos HTTP permitidos
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
});
