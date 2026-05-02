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
import { createNovel } from "@/app/actions";

const novelSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
});

type NovelForm = z.infer<typeof novelSchema>;

export function CreateNovelDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NovelForm>({
    resolver: zodResolver(novelSchema),
  });

  async function onSubmit(data: NovelForm) {
    await createNovel(data);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            创建新小说
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新小说</DialogTitle>
          <DialogDescription>
            输入小说标题和简介，快速创建一个新的小说项目。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="例如：星际穿越者的归途"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">简介</Label>
            <Textarea
              id="description"
              placeholder="简要描述小说的背景、主题或剧情概要..."
              rows={4}
              {...register("description")}
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
              {isSubmitting ? "创建中..." : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
