import OpenAI from "openai";

import type { AiChatInput, AiChatResult, AiProvider } from "@/providers/contracts";

let cachedClient: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return cachedClient;
}

export class OpenAiProvider implements AiProvider {
  async chat(input: AiChatInput): Promise<AiChatResult> {
    const client = getClient();

    const response = await client.responses.create({
      model: input.model,
      temperature: input.temperature,
      input: [
        {
          role: "system",
          content: input.systemPrompt
        },
        {
          role: "user",
          content: input.userMessage
        }
      ]
    });

    return {
      outputText: response.output_text,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens
    };
  }
}
