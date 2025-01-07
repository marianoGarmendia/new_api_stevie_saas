import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { type MessageContent } from "@langchain/core/messages";

import { z } from "zod";

export const promptPodcast = ChatPromptTemplate.fromTemplate(`
Debes formatear el siguiente texto para un podcast.
aseguráte de crear una conversación fluida y atractiva.
Genera una buena interacción entre los locutores.
El publico objetivo son personas que se van de viaje y quieres ofrecerla asistencia.
Este podcast es sobre los beneficios de Universal assistance.
Se debe remarcar la importancia de tener un seguro para tus viajes.
Los creadores del podcast son representantes de *Universal Assistant*.
Debes incluir en la conversacion del podcast que para más información pueden visitar la página web de Universal assistant **universal-assistance.com**

#### Notas adicionales:
- El audio no debe durar mas de 120 segundos.
- No menciones que es un capitulo de podcast.
- La conversación debe resaltar los beneficios de contratar Univeersal Assistant
- Mantengan la fluidez de la charla.
- Asegurate que el texto no debe ser muy largo.
- Siempre la respuesta en español latinoamericano.
- El primer locutor se llama Carlos. 
- La segunda Locutora se llama Maria.

### Texto para formatear:

{texto}

### Ejemplo de formato:

#### Instrucciones de salida estructurada de la respuesta:

{format_instructions}
    
`);

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
