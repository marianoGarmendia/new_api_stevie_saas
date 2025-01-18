import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { type MessageContent } from "@langchain/core/messages";
// Importar prompts
import { chatprompt_cine } from "./prompts";
import { z } from "zod";

export const promptPodcast = ChatPromptTemplate.fromTemplate(chatprompt_cine);

const podcastSchema = z.array(
  z.object({
    text: z
      .string()
      .describe("Texto del podcast que le corresponde a un locutor"),
    voice: z.string().describe("Nombre del locutor/a que lee el texto"),
  })
);

// export type podcastTypeSchema = z.infer<typeof podcastSchema>;

export const podcastParser =
  StructuredOutputParser.fromZodSchema(podcastSchema);

export const podcastTextFormater = async (
  texto: MessageContent,
  model: any
) => {
  const chain = promptPodcast.pipe(model).pipe(podcastParser);

  const response = await chain.invoke({
    texto: texto,
    format_instructions: podcastParser.getFormatInstructions(),
  });

  return response;
};
