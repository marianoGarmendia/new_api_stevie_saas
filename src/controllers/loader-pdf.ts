import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SystemMessage, type MessageContent } from "@langchain/core/messages";
import { system_prompt } from "./prompts";

export const loadDocsFromPDF = async (
  content: string,
  model: any
): Promise<MessageContent> => {
  try {
    const systemMessage = new SystemMessage(system_prompt);
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
