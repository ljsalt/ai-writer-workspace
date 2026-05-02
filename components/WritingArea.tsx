"use client";

import { useState, useRef } from "react";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AIGlobalConfig {
  aiProvider?: string | null;
  aiBaseUrl?: string | null;
  aiApiKey?: string | null;
  aiModelId?: string | null;
}

interface WritingAreaProps {
  chapterId: string;
  initialContent?: string | null;
  aiConfig: AIGlobalConfig;
}

export function WritingArea({ chapterId, initialContent, aiConfig }: WritingAreaProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function handleGenerate(userInput: string) {
    if (!userInput.trim() || isLoading) return;

    if (!aiConfig.aiModelId) {
      toast.error("AI 模型未配置", {
        description: "请先在「AI 设置」中配置并保存模型",
      });
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userInput,
          chapterId,
          aiConfig: {
            provider: aiConfig.aiProvider ?? "openai-compatible",
            baseURL: aiConfig.aiBaseUrl ?? "",
            apiKey: aiConfig.aiApiKey ?? "",
            modelId: aiConfig.aiModelId ?? "",
          },
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "");
        throw new Error(`请求失败 (${response.status}): ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = content + (content ? "\n\n" : "");

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          accumulated += chunk;
          setContent(accumulated);
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "未知错误";
      toast.error("AI 生成失败", {
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Input
          placeholder="输入写作指导，例如：主角推开门，看到了反派，写一段冲突..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const input = e.currentTarget;
              if (input.value.trim()) {
                handleGenerate(input.value);
                input.value = "";
              }
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>(
              '[placeholder*="写作指导"]'
            );
            if (input?.value.trim()) {
              handleGenerate(input.value);
              input.value = "";
            }
          }}
          disabled={isLoading}
        >
          <SparklesIcon className="size-4" />
          AI 续写
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <Textarea
          className="h-full resize-none text-base leading-relaxed"
          placeholder="正文内容将显示在这里..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {isLoading && (
          <div className="absolute bottom-3 right-3">
            <span className="text-xs text-muted-foreground animate-pulse">
              AI 正在生成...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
