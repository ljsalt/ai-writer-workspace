"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderIcon } from "lucide-react";
import { saveNovelAIConfig } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const settingsSchema = z.object({
  aiProvider: z.string(),
  aiBaseUrl: z.string(),
  aiApiKey: z.string(),
  aiModelId: z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface NovelSettingsFormProps {
  novelId: string;
  initial: {
    aiProvider?: string | null;
    aiBaseUrl?: string | null;
    aiApiKey?: string | null;
    aiModelId?: string | null;
  };
}

export function NovelSettingsForm({ novelId, initial }: NovelSettingsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      aiProvider: initial.aiProvider ?? "openai-compatible",
      aiBaseUrl: initial.aiBaseUrl ?? "",
      aiApiKey: initial.aiApiKey ?? "",
      aiModelId: initial.aiModelId ?? "",
    },
  });

  const selectedProvider = watch("aiProvider");
  const [isTesting, setIsTesting] = useState(false);

  async function onSave(data: SettingsForm) {
    await saveNovelAIConfig(novelId, {
      aiProvider: data.aiProvider,
      aiBaseUrl: data.aiBaseUrl,
      aiApiKey: data.aiApiKey,
      aiModelId: data.aiModelId,
    });
    toast.success("AI 配置已保存");
  }

  async function handleTest(formValues: SettingsForm) {
    setIsTesting(true);
    try {
      const res = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: formValues.aiProvider,
          baseURL: formValues.aiBaseUrl,
          apiKey: formValues.aiApiKey,
          modelId: formValues.aiModelId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("连接成功！模型已正确配置。");
      } else {
        toast.error(`连接失败：${json.error}`);
      }
    } catch {
      toast.error("连接失败：网络错误，请检查服务是否启动");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-medium mb-4">AI 模型配置</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>AI 提供商</Label>
              <select
                {...register("aiProvider")}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="openai-compatible">OpenAI 兼容（Ollama / LM Studio）</option>
                <option value="anthropic">Anthropic Claude</option>
              </select>
            </div>

            {selectedProvider === "openai-compatible" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="aiBaseUrl">接口地址</Label>
                <Input
                  id="aiBaseUrl"
                  placeholder="http://localhost:11434/v1"
                  {...register("aiBaseUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  Ollama 默认：http://localhost:11434/v1
                </p>
              </div>
            )}

            {selectedProvider === "anthropic" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="aiApiKey">API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  placeholder="sk-ant-..."
                  {...register("aiApiKey")}
                />
              </div>
            )}

            {selectedProvider === "openai-compatible" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="aiApiKey">API Key（本地模型可留空）</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  placeholder="可选"
                  {...register("aiApiKey")}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="aiModelId">模型名称</Label>
              <Input
                id="aiModelId"
                placeholder={selectedProvider === "anthropic" ? "claude-3-5-sonnet-20241022" : "qwen2.5"}
                {...register("aiModelId")}
                aria-invalid={!!errors.aiModelId}
              />
              {errors.aiModelId && (
                <p className="text-xs text-destructive">{errors.aiModelId.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(handleTest)}
            disabled={isTesting || isSubmitting}
          >
            {isTesting ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                测试中...
              </>
            ) : (
              "🧪 测试连接"
            )}
          </Button>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </form>
    </div>
  );
}
