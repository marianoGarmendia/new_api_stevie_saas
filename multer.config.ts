import multer from "multer";

// const upload = multer({ dest: "uploads/" });

/// Configuración de Multer
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Carpeta donde se guardará el archivo
    cb(null, "uploads/pdfs");
  },
  filename: (req, file, cb) => {
    // Mantener la extensión del archivo original
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// const pdfFilter = (req: any, file: any, cb: any) => {
//   if (file.mimetype === "application/pdf") {
//     cb(null, true);
//   } else {
//     cb(new Error("Solo se permiten archivos PDF"), false);
//   }
// };

export const pdfUpload = multer({
  storage: pdfStorage,
  //   fileFilter: pdfFilter,
  //   limits: { fileSize: 10 * 1024 * 1024 }, // Máximo 10 MB
});
