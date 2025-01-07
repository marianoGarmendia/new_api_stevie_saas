import "@mendable/firecrawl-js";
import { FireCrawlLoader } from "@langchain/community/document_loaders/web/firecrawl";
import { jsPDF } from "jspdf";
import { SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
// import { loadDocs } from "./astradb";

export const model = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

// const urlsForScrapping = [];

// Carga el sitio web de Cinepolis Chile para obtener la cartelera de películas.
export const loader = new FireCrawlLoader({
  url: "https://www.universal-assistance.com/ar-es/viaje-seguro?utm_source=google&utm_medium=cpc&utm_campaign=_Genericos%20Arg&utm_term=universal%20assistance&gad_source=1&gclid=CjwKCAiAm-67BhBlEiwAEVftNlmKauKiVVi1q_thNroOyjSDGxikyOdbEH3DrY0WdHanSfPk0mWcUhoC4UIQAvD_BwE", // The URL to scrape
  // Optional, defaults to `FIRECRAWL_API_KEY` in your env.
  mode: "scrape", // The mode to run the crawler in. Can be "scrape" for single urls or "crawl" for all accessible subpages
  params: {
    // optional parameters based on Firecrawl API docs
    // For API documentation, visit https://docs.firecrawl.dev
  },
});

const docs = await loader.load();

// const vectorStore = await loadDocs(docs);

/**
 * Transforma un texto en un archivo PDF y lo guarda localmente.
 * @param text El texto que se quiere convertir en PDF.
 * @param fileName El nombre del archivo PDF que se generará.
 */
function textToPDF(text: string, fileName: string = "document.pdf") {
  // Crear una instancia de jsPDF
  const doc = new jsPDF();

  // Dividir el texto si es necesario para múltiples líneas
  const lineHeight = 10; // Altura de cada línea
  const margin = 10; // Margen desde los bordes
  const pageWidth = doc.internal.pageSize.width - margin * 2; // Ancho de página usable
  const pageHeight = doc.internal.pageSize.height - margin * 2; // Altura de página usable

  const lines = doc.splitTextToSize(text, pageWidth); // Ajustar texto al ancho

  let cursorY = margin; // Coordenada Y inicial para escribir

  // Escribir las líneas en el PDF, una página a la vez
  lines.forEach((line: any, index: any) => {
    if (cursorY + lineHeight > pageHeight) {
      doc.addPage(); // Agregar una nueva página si el espacio no es suficiente
      cursorY = margin; // Reiniciar el cursor en la nueva página
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight; // Mover el cursor hacia abajo
  });

  // Guardar el archivo PDF
  doc.save(fileName);
}

const systemMessage = new SystemMessage(`
        Eres un asistente experto en procesar y filtrar información sobre asistencia de viajes. Tu tarea es analizar un texto dado, identificar y extraer únicamente la información relevante relacionada con la asistencia de viajes y que es lo mejor para los clientes. I  

        Elimina todo contenido irrelevante o fuera del ámbito solicitado, como anuncios, promociones, reseñas personales, información técnica no relacionada directamente con los servicios prestados o datos que no se ajusten a la temática. El resultado debe estar limpio, organizado y listo para ser transcrito en un PDF de fácil lectura para su posterior uso en la creación de un podcast.  

    `);

const summarize = async (doc: any) => {
  const response = await model.invoke([systemMessage, doc.pageContent]);

  return response.content;
};

docs.forEach(async (doc, index) => {
  const response = await summarize(doc);
  console.log(response.toString());

  textToPDF(response.toString(), `document${index.toString()}.pdf`);
});
// docs.forEach((doc, index) => {
//   textToPDF(doc.pageContent, `document${index}.pdf`);
// });

// Ejemplo de uso:
// textToPDF(
//   "Este es un texto de prueba para convertir a PDF.",
//   "miDocumento.pdf"
// );
