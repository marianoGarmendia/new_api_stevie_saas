import { unlinkSync } from "fs";

import { readFile, writeFile } from "fs/promises";

export const combineAudios = async (files: any[], filename: string) => {
  try {
    // Leer todos los archivos como buffers
    const buffers = await Promise.all(
      files.map(async (file) => {
        try {
          return new Uint8Array(await readFile(file));
        } catch (err) {
          console.error(`Error al leer ${file}:`, err);
          throw err;
        }
      })
    );

    // Combinar los buffers
    const combinedBuffer = Buffer.concat(buffers);

    // Escribir el archivo combinado
    await writeFile(filename, combinedBuffer as any);
    console.log("Archivos combinados exitosamente en: " + filename);

    // Eliminar los archivos originales
    files.forEach((file) => {
      try {
        unlinkSync(file);
        console.log(`${file} eliminado con éxito.`);
      } catch (err) {
        console.error(`Error al eliminar ${file}:`, err);
      }
    });
  } catch (err) {
    console.error("Error durante el proceso de combinación:", err);
    throw err; // Lanza el error para que el código principal pueda manejarlo
  }
};

// ESTA VERSION FUNCIONA PERO PARECE QUE ESCRIBE EN LOCAL MAS TARDE DE LO QUE DEBERIA Y EL CODIGO SIGUE CORRIENDO PROVOCANDO ERRORES DE LECTURA
// const fs = Bun.file;
// import { unlinkSync } from "node:fs";

// export const combineAudios = async (files: any, filename: string) => {
//   const buffers = files
//     .map((file: any) => {
//       try {
//         return fs(file).arrayBuffer();
//       } catch (err) {
//         console.error(`Error al leer ${file}:`, err);
//         return null;
//       }
//     })
//     .filter(Boolean);

//   // Esperar a que se lean todos los archivos
//   Promise.all(buffers)
//     .then((buffersArray) => {
//       const combinedBuffer = Buffer.concat(
//         buffersArray.map((ab) => new Uint8Array(ab))
//       );
//       return Bun.write(filename, combinedBuffer as any);
//     })
//     .then(() => {
//       console.log("Archivos combinados exitosamente en: " + filename);
//       // Eliminar los archivos
//       return files.forEach((file: any) => {
//         try {
//           unlinkSync(file); // Eliminar archivo
//           console.log(`${file} eliminado con éxito.`);
//         } catch (err) {
//           console.error(`Error al eliminar ${file}:`, err);
//         }
//       });
//     })
//     .catch((err) => {
//       console.error("Error durante el proceso:", err);
//     });
// };
