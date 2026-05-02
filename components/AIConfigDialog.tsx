"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SettingsIcon } from "lucide-react";
import { useAIConfig, type AIConfig } from "@/lib/use-ai-config";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const aiConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai-compatible"]),
  baseURL: z.string(),
  apiKey: z.string(),
  modelId: z.string().min(1, "模型名称不能为空"),
});

type AIConfigForm = z.infer<typeof aiConfigSchema>;

export function AIConfigDialog() {
  const { config, setConfig } = useAIConfig();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AIConfigForm>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: config,
  });

  const selectedProvider = watch("provider");

  function onSubmit(data: AIConfigForm) {
    setConfig(data as AIConfig);
    setOpen(false);
  }

  function handleOpenChange(next: boolean) {
    if (next) reset(config);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon">
            <SettingsIcon className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AI 模型配置</DialogTitle>
          <DialogDescription>
            选择 AI 提供商并配置模型参数。本地模型（如 Ollama）请选择「兼容模式」。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>提供商</Label>
            <select
              {...register("provider")}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai-compatible">OpenAI 兼容（Ollama/LM Studio）</option>
            </select>
          </div>

          {selectedProvider === "openai-compatible" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="baseURL">接口地址</Label>
              <Input
                id="baseURL"
                placeholder="http://localhost:11434/v1"
                {...register("baseURL")}
              />
              <p className="text-xs text-muted-foreground">
                Ollama 默认：http://localhost:11434/v1
              </p>
            </div>
          )}

          {selectedProvider === "anthropic" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-ant-..."
                {...register("apiKey")}
              />
            </div>
          )}

          {selectedProvider === "openai-compatible" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey">API Key（可选，本地模型可留空）</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="可选"
                {...register("apiKey")}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="modelId">模型名称</Label>
            <Input
              id="modelId"
              placeholder={
                selectedProvider === "anthropic"
                  ? "claude-3-5-sonnet-20241022"
                  : "qwen2.5"
              }
              {...register("modelId")}
              aria-invalid={!!errors.modelId}
            />
            {errors.modelId && (
              <p className="text-xs text-destructive">{errors.modelId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存配置"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
