import { Router, type Request, type Response } from "express";
import { loadPDF, loadDocsFromPDF } from "@/controllers/loader-pdf";
import { model } from "@/llm/model";
import { podcastTextFormater } from "@/controllers/format-text-podcast";
import { writeFileInLocal } from "@/writeFiles/writeFile";
import { createAudioFileFromText } from "@/text-to-speech/text-to-speech-file";
import { combineAudios } from "@/controllers/combine-audios";
import { unlinkSync } from "fs";
import fs from "fs";
// const fs = Bun.file;

import { v4 as uuid } from "uuid";

import path from "node:path";
import multer from "multer";

export const fileRouter = Router();

const createAudioFile = async ({
  text,
  voice,
}: {
  text: string;
  voice: string;
}) => {
  const fileName = `audios_temporales/output-${uuid()}.mp3`;
  await createAudioFileFromText(text, voice, fileName);
  return fileName;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/podcast"); // Directorio donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    // Obtener la extensión original del archivo
    const fileExtension = path.extname(file.originalname);
    // Crear un nombre único para evitar conflictos
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Guardar con la extensión original
  },
});

// const upload = multer({ dest: "uploads/podcast" });
const upload = multer({ storage: storage });
const handleFileUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún archivo" });
    }
    // Extraigo el contenido del pdf
    const pdfContent = await loadPDF(req.file.path);
    // Enviarselo al modelo para que lo procese
    const messageContent = await loadDocsFromPDF(pdfContent, model);

    // Devuelve un array de objetos con la propiedad "text" y "voice"
    const podcastArray = await podcastTextFormater(messageContent, model);

    // Borramos el archivo PDF de la carpeta upload luego de procesarlo
    fs.unlink(req.file.path, (err) => {
      console.log("Archivo eliminado:", req.file?.path);

      if (err) {
        console.error(`Error al eliminar el archivo: ${req.file?.path}`, err);
        return res
          .status(500)
          .send(
            "Un error de limpieza ha ocurrido, por favor cargalo nuevamente"
          );
      }
    });

    //Voces agregadas a cada fragmento
    const voicesAdded = podcastArray.map((pod, i) => {
      if (i % 2 === 0) {
        return { ...pod, voice: "Ruben Suarez - Expressive" };
      } else {
        return { ...pod, voice: "Valeria" };
      }
    });

    await writeFileInLocal(voicesAdded);

    const addedAudioFilesToArray = async (arr: any[]) => {
      const audioFiles: string[] = [];

      for (const section of arr) {
        console.log(
          `Generando audio para: "${section.text}" con la voz: ${section.voice}`
        );
        const fileName = await createAudioFile({
          text: section.text,
          voice: section.voice,
        });
        audioFiles.push(fileName);
      }
      console.log("audioFiles");
      console.log(audioFiles);

      return audioFiles;
    };

    // Se trae todos los archivos de audio generados .mp3 , tengo las rutas para poder combinarlas
    const audioArrayFiles = await addedAudioFilesToArray(voicesAdded);

    console.log("audioArrayFiles");
    console.log(audioArrayFiles);

    const audioFilePathSave = path.normalize(
      path.join(
        process.cwd(),
        `audios_finales`,
        `uploads`,
        `podcast`,
        `${req.file.filename}_final_podcast.mp3`
      )
    );

    //Combinar los mp3 para un audio final
    await combineAudios(audioArrayFiles, audioFilePathSave);

    // const audioFilePath = path.normalize(
    //   path.join(__dirname, `audios_finales/${req.file.path}_final_podcast.mp3`)
    // );

    // const audioFilePath = path.normalize(
    //   path.join(
    //     process.cwd(),
    //     "audios_finales",
    //     "uploads",
    //     "podcast",
    //     `${req.file.filename}_final_podcast.mp3`
    //   )
    // );
    console.log("Ruta calculada del archivo:", audioFilePathSave);
    console.log("filename: " + req.file.filename);
    console.log("path: " + req.file.path);

    //Verifica si el archivo existe usando Bun
    // Leer el archivo como Buffer

    // Establecer encabezados para indicar tipo y descarga opcional
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="podcast.mp3"`);
    res.sendFile(audioFilePathSave, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al enviar el archivo");
      } else {
        fs.unlink(audioFilePathSave, (err) => {
          if (err) console.error("Error al eliminar el archivo:", err);
          else console.log("Archivo eliminado:", audioFilePathSave);
        });
      }
    });
  } catch (error) {
    console.error("Error al enviar el archivo:", error);
    res.status(500).send("Error interno al procesar el archivo");
  }

  // res.json({
  //   message: "PDF subido exitosamente",
  //   filePath: req.file.path,
  //   originalName: req.file.originalname,
  // });
};

fileRouter.get("/audio", (req, res) => {
  try {
    const audioFilePath = path.normalize(
      path.join(
        process.cwd(),
        "audios_finales",
        "uploads",
        "podcast",
        `1735606619335-cartelera_cinepolis.pdf_final_podcast.mp3`
      )
    );
    console.log("Ruta calculada del archivo:", audioFilePath);

    //Verifica si el archivo existe usando Bun
    // Leer el archivo como Buffer

    // Establecer encabezados para indicar tipo y descarga opcional
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="podcast.mp3"`);
    res.sendFile(audioFilePath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo:", err);
        res.status(500).send("Error al enviar el archivo");
      }
    });
  } catch (error) {
    console.error("Error al enviar el archivo:", error);
    res.status(500).send("Error interno al procesar el archivo");
  }
});

fileRouter.post(
  "/podcast-file",
  upload.single("podcast_file"),
  handleFileUpload

  //   try {
  //     // Aquí se realiza el proceso de creación del audio final (omito este paso)
  //     const audioPath = req.podcast_file.path; // Ruta al audio final generado

  //     // Enviar el archivo al frontend como respuesta
  //     res.setHeader("Content-Type", "audio/mpeg");
  //     res.setHeader(
  //       "Content-Disposition",
  //       'attachment; filename="audio-podcast.mp3"'
  //     );

  //     const audioStream = fs.createReadStream(audioPath);
  //     audioStream.pipe(res);

  //     audioStream.on("error", (err) => {
  //       console.error("Error al leer el archivo de audio:", err);
  //       res.status(500).send("Error al generar el audio.");
  //     });
  //   } catch (error) {
  //     console.error("Error en el endpoint:", error);
  //     res.status(500).send("Error al procesar los archivos.");
  //   }
);
