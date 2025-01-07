import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SystemMessage, type MessageContent } from "@langchain/core/messages";

export const loadDocsFromPDF = async (
  content: string,
  model: any
): Promise<MessageContent> => {
  try {
    const systemMessage = new SystemMessage(
      `Eres un experto en procesar y filtrar información sobre asistencia de viajes de *Universal assistant*. Tu tarea es analizar un texto dado, identificar y extraer únicamente la información relevante relacionada con asistencia de viajes y sus beneficios. Analiza el siguiente texto y extrae la información relevante.
      - No menciones nada del covid.
      - No menciones que es un podcast
      - Habla como de manera informativa pero persuasiva.
      `
    );
    const cleanText = await model.invoke([systemMessage, content]);
    return cleanText.content;
  } catch (error) {
    throw new Error("Ha ocurrido un error en la carga de los datos");
  }
};

export const loadPDF = async (pdfPath: string) => {
  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();
  const texto = docs[0].pageContent;
  return texto;
};
