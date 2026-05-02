import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let provider = "";
  let baseURL = "";
  let apiKey = "";
  let modelId = "";

  try {
    const body = await req.json();
    provider = body.provider ?? "";
    baseURL = body.baseURL ?? "";
    apiKey = body.apiKey ?? "";
    modelId = body.modelId ?? "";

    if (!provider || !modelId) {
      return Response.json(
        { error: "provider 和 modelId 不能为空" },
        { status: 400 }
      );
    }

    if (provider === "anthropic") {
      const anthropicProvider = createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
      });
      const result = await generateText({
        model: anthropicProvider(modelId),
        system: "请只回复「连接成功」四个字，不要任何其他内容。",
        prompt: "你好",
      });
      return Response.json({ success: true, message: result });
    } else {
      const openaiProvider = createOpenAI({
        baseURL: baseURL || "http://localhost:11434/v1",
        apiKey: apiKey || "no-key",
      });
      const result = await generateText({
        model: openaiProvider.chat(modelId),
        system: "请只回复「连接成功」四个字，不要任何其他内容。",
        prompt: "你好",
      });
      return Response.json({ success: true, message: result });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    let detail = message;
    if (message.includes("401") || message.includes("Unauthorized")) {
      detail = "认证失败 (401)：API Key 无效或已过期";
    } else if (message.includes("403") || message.includes("Forbidden")) {
      detail = "访问被拒绝 (403)：请检查 API Key 权限或账户状态";
    } else if (message.includes("404") || message.includes("Not Found")) {
      detail = "接口未找到 (404)：请检查 baseURL 是否正确";
    } else if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      detail =
        provider === "openai-compatible"
          ? "连接失败：无法连接到本地模型服务，请确认 Ollama 等服务已启动"
          : "连接失败：无法连接到 Anthropic API，请检查网络和 API Key";
    } else if (message.includes("timeout") || message.includes("Timeout")) {
      detail = "请求超时：模型响应时间过长，请稍后重试";
    } else if (message.includes("context_length") || message.includes("maximum context")) {
      detail = "上下文超限：模型最大 token 限制已超出";
    }
    return Response.json({ success: false, error: detail }, { status: 500 });
  }
}
