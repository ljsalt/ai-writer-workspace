"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeftIcon, UserIcon, GlobeIcon, BookOpenIcon, SettingsIcon, LoaderIcon } from "lucide-react";
import { saveNovelAIConfig } from "@/app/actions";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";

const settingsSchema = z.object({
  aiProvider: z.string(),
  aiBaseUrl: z.string(),
  aiApiKey: z.string(),
  aiModelId: z.string(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface NovelAISettingsProps {
  novel: {
    id: string;
    title: string;
    author: string;
    aiProvider?: string | null;
    aiBaseUrl?: string | null;
    aiApiKey?: string | null;
    aiModelId?: string | null;
    chapters: { id: string; order: number; title: string; summary: string | null }[];
    characters: { id: string; name: string; aliases: string | null; personality: string | null }[];
    worldSettings: { id: string; name: string; category: string; content: string | null }[];
  };
  CreateChapterDialog: React.ComponentType<{ novelId: string }>;
  CreateCharacterDialog: React.ComponentType<{ novelId: string }>;
  CreateWorldSettingDialog: React.ComponentType<{ novelId: string }>;
}

export function NovelAISettings({
  novel,
  CreateChapterDialog,
  CreateCharacterDialog,
  CreateWorldSettingDialog,
}: NovelAISettingsProps) {
  const [activeTab, setActiveTab] = useState("chapters");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      aiProvider: novel.aiProvider ?? "openai-compatible",
      aiBaseUrl: novel.aiBaseUrl ?? "",
      aiApiKey: novel.aiApiKey ?? "",
      aiModelId: novel.aiModelId ?? "",
    },
  });

  const selectedProvider = watch("aiProvider");

  async function onSave(data: SettingsForm) {
    await saveNovelAIConfig(novel.id, {
      aiProvider: data.aiProvider,
      aiBaseUrl: data.aiBaseUrl,
      aiApiKey: data.aiApiKey,
      aiModelId: data.aiModelId,
    });
    toast.success("AI 配置已保存");
  }

  async function handleTest(formValues: SettingsForm) {
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
    }
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="size-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">{novel.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{novel.author}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab("settings")}
            >
              <SettingsIcon className="size-4" />
            </Button>
          </div>
        </header>

        <Tabs
          defaultValue="chapters"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="chapters">章节与大纲</TabsTrigger>
              <TabsTrigger value="characters">角色设定库</TabsTrigger>
              <TabsTrigger value="world">世界观设定</TabsTrigger>
              <TabsTrigger value="settings">AI 设置</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chapters" className="flex-1 px-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">章节列表 ({novel.chapters.length})</h2>
                <CreateChapterDialog novelId={novel.id} />
              </div>
              {novel.chapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                  <BookOpenIcon className="size-10" />
                  <div className="text-center">
                    <p className="font-medium">暂无章节</p>
                    <p className="text-sm">点击「添加新章节」创建第一个章节</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {novel.chapters.map((chapter) => (
                    <Link key={chapter.id} href={`/novel/${novel.id}/chapter/${chapter.id}`}>
                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              第{chapter.order}章
                            </span>
                            <CardTitle className="text-base">{chapter.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {chapter.summary ? (
                            <p className="text-sm text-muted-foreground">{chapter.summary}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">暂无剧情摘要</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="flex-1 px-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">角色列表 ({novel.characters.length})</h2>
                <CreateCharacterDialog novelId={novel.id} />
              </div>
              {novel.characters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                  <UserIcon className="size-10" />
                  <div className="text-center">
                    <p className="font-medium">暂无角色</p>
                    <p className="text-sm">点击「添加新角色」创建第一个角色</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {novel.characters.map((c) => (
                    <Card key={c.id}>
                      <CardHeader>
                        <CardTitle>{c.name}</CardTitle>
                        {c.aliases && <CardDescription>{c.aliases}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        {c.personality ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">{c.personality}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">暂无性格描述</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="world" className="flex-1 px-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">世界观设定 ({novel.worldSettings.length})</h2>
                <CreateWorldSettingDialog novelId={novel.id} />
              </div>
              {novel.worldSettings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                  <GlobeIcon className="size-10" />
                  <div className="text-center">
                    <p className="font-medium">暂无世界观设定</p>
                    <p className="text-sm">点击「添加世界观设定」创建第一个设定</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {novel.worldSettings.map((ws) => (
                    <Card key={ws.id}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{ws.category}</span>
                          <CardTitle className="text-base">{ws.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {ws.content ? (
                          <p className="text-sm text-muted-foreground line-clamp-3">{ws.content}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">暂无详细设定</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 px-6 pb-6">
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
                      <>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="aiBaseUrl">接口地址</Label>
                          <Input
                            id="aiBaseUrl"
                            placeholder="http://localhost:11434/v1"
                            {...register("aiBaseUrl")}
                          />
                          <p className="text-xs text-muted-foreground">Ollama 默认：http://localhost:11434/v1</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="aiApiKey">API Key（本地模型可留空）</Label>
                          <Input
                            id="aiApiKey"
                            type="password"
                            placeholder="可选"
                            {...register("aiApiKey")}
                          />
                        </div>
                      </>
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><LoaderIcon className="size-4 animate-spin" />测试中...</>
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
