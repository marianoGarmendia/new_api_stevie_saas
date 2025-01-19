import fs from "fs";
import path from "node:path";


const uploadDir = path.join(__dirname, "uploads/podcast");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Directorio creado: ${uploadDir}`);
}
