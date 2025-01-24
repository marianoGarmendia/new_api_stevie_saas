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

// Carga el sitio web Para obtener la información solicitada
export const load_from_url = async (url: string) => {
  const loader = new FireCrawlLoader({
    url: url, // The URL to scrape
    // Optional, defaults to `FIRECRAWL_API_KEY` in your env.
    mode: "scrape", // The mode to run the crawler in. Can be "scrape" for single urls or "crawl" for all accessible subpages
    params: {
      // optional parameters based on Firecrawl API docs
      // For API documentation, visit https://docs.firecrawl.dev
    },
  });

  const docs = await loader.load();
  return docs;
};
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

const systemMessage =
  new SystemMessage(`Eres un experto en procesar y filtrar información de un PDF. Tu objetivo es convertir la información de un PDF en un mensaje persuasivo para un podcast, extrayendo la información.
- Destaca los puntos más importantes de la información.
- Haz un resumen de cada página.
- El resumen debe ser con el titulo del texto y destaca lo mas importante de ese texto.
- La información que extraigas debe ser clara y concisa.
- Toda información que sea publicidad externa, numeros de página ignóralas.
- El texto procesado debe ser completo y sin dejar información fuera.

`);

const texto = `
  ¡Descubre el poder de la creatina para maximizar tus entrenamientos!
¿Sabías que la creatina es uno de los suplementos más estudiados y efectivos para mejorar el rendimiento físico? Hoy te contamos cómo funciona y por qué es el aliado perfecto para tus metas deportivas. 
CREATINA
Image of White Bull Creatina
White Bull Creatina
$22,990.00 $25,990.00
VER CREATINA
¿Qué es la creatina?

La creatina es una sustancia natural que tu cuerpo produce y almacena principalmente en los músculos. Es clave para la producción de energía durante actividades de alta intensidad, como el levantamiento de pesas o los sprints.

Beneficio principal: aumenta la disponibilidad de energía, permitiéndote rendir más en entrenamientos cortos e intensos.

¿Cómo funciona?

Cuando entrenas, tus músculos usan ATP (adenosina trifosfato) como fuente de energía. La creatina acelera la regeneración de ATP, lo que significa que tendrás más energía disponible para ejercicios explosivos y repetitivos.

Principales beneficios de la creatina:

- Aumenta tu fuerza y potencia: Ideal para entrenamientos de resistencia y fuerza.


- Mejora tu rendimiento: Más repeticiones, más peso, mejores resultados.


- Acelera la recuperación muscular: Reduce la fatiga entre series y entrenamientos.


- Promueve el crecimiento muscular: Al mejorar tu rendimiento, apoyas el desarrollo de masa muscular magra.


- Hidratación celular: Favorece la retención de agua en las células musculares, optimizando su volumen y función.

¿Cómo tomar creatina?
 Para resultados óptimos:

 
- Toma 1 porción (aprox. 5g) de creatina monohidratada al día, disuelta en agua.
 
- Consúmela después de entrenar o en cualquier momento del día, preferiblemente acompañada de una comida rica en carbohidratos para mejorar su absorción.

Recuerda: Pequeños cambios,
grandes resultados.
`;

const summarize = async (doc: any) => {
  const response = await model.invoke([systemMessage, `${doc.pageContent}`]);
  console.log("summarize response");
  console.log(response.content);

  return response.content;
};

export const summarizeDocs = async (docs: any) => {
  const response = await model.invoke([
    systemMessage,
    `${docs[0].pageContent}`,
  ]);

  console.log("After summarize docs");
  return response;

  // const response = await summarize(docs[0]);
  // const text = docs.map(async (doc: any) => {
  //   const response = await summarize(doc);
  //   console.log("After summarize docs");

  //   console.log(response.toString());
  //   return response.toString();

  //   // textToPDF(response.toString(), `document${index.toString()}.pdf`);
  // });
  // console.log("After iteration docs");
  // const res = await text;

  // return res;
};

// docs.forEach((doc, index) => {
//   textToPDF(doc.pageContent, `document${index}.pdf`);
// });

// Ejemplo de uso:
// textToPDF(
//   "Este es un texto de prueba para convertir a PDF.",
//   "miDocumento.pdf"
// );
