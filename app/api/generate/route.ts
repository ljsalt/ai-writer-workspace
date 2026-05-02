import { buildGenerationPrompt } from "@/lib/prompt-builder";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt, chapterId, aiConfig } = await req.json();

    if (!chapterId || !prompt) {
      return new Response("chapterId and prompt are required", { status: 400 });
    }

    const systemPrompt = await buildGenerationPrompt(chapterId);

    const { provider, baseURL, apiKey, modelId } = aiConfig;

    let result;
    if (provider === "anthropic") {
      const anthropicProvider = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
      });
      result = await streamText({
        model: anthropicProvider(modelId || "claude-3-5-sonnet-20241022"),
        system: systemPrompt,
        prompt,
      });
    } else {
      const openaiProvider = createOpenAI({
        baseURL: baseURL || "http://localhost:11434/v1",
        apiKey: apiKey || "no-key",
      });
      result = await streamText({
        model: openaiProvider.chat(modelId || "qwen2.5"),
        system: systemPrompt,
        prompt,
      });
    }

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generate error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
