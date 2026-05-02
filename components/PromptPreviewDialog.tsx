"use client";

import { useState, useTransition } from "react";
import { SparklesIcon } from "lucide-react";
import { previewPrompt } from "@/app/actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptPreviewDialogProps {
  chapterId: string;
}

export function PromptPreviewDialog({ chapterId }: PromptPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handlePreview() {
    startTransition(async () => {
      const result = await previewPrompt(chapterId);
      setPrompt(result);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button onClick={handlePreview}>
            <SparklesIcon />
            预览 AI 记忆提示词
          </Button>
        }
      />
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI 记忆提示词预览</DialogTitle>
          <DialogDescription>
            以下是当前章节的完整提示词内容，确认无误后可发送给 AI 进行写作辅助。
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            生成中...
          </div>
        ) : (
          <ScrollArea className="flex-1 rounded-lg border p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {prompt}
            </pre>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
