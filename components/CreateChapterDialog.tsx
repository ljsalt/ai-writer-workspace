"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { createChapter } from "@/app/actions";

const chapterSchema = z.object({
  title: z.string().min(1, "章节标题不能为空"),
  summary: z.string().optional(),
});

type ChapterForm = z.infer<typeof chapterSchema>;

interface CreateChapterDialogProps {
  novelId: string;
}

export function CreateChapterDialog({ novelId }: CreateChapterDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterForm>({
    resolver: zodResolver(chapterSchema),
  });

  async function onSubmit(data: ChapterForm) {
    await createChapter(novelId, data);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            添加新章节
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新章节</DialogTitle>
          <DialogDescription>
            为小说添加一个新章节。章节序号将自动分配。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">章节标题 *</Label>
            <Input
              id="title"
              placeholder="例如：第一章 觉醒"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="summary">本章剧情摘要</Label>
            <Textarea
              id="summary"
              placeholder="简要描述本章剧情要点..."
              rows={4}
              {...register("summary")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建章节"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
