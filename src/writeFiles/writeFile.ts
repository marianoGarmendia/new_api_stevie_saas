import fs from "fs";

// Convertir a JSON

export const writeFileInLocal = async (data: any) => {
  const jsonData = JSON.stringify(data, null, 2); // null, 2 para formatear el JSON con indentación

  // Escribir en un archivo
  fs.writeFile("podcast.json", jsonData, (err) => {
    if (err) {
      console.error("Error al guardar el archivo:", err);
    } else {
      console.log('Archivo guardado con éxito en "data.json".');
    }
  });
};
