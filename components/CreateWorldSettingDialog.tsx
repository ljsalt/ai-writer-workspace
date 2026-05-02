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
import { createWorldSetting } from "@/app/actions";

const WORLD_CATEGORIES = [
  "地点",
  "物品",
  "势力",
  "法力等级",
  "种族",
  "历史",
  "其他",
];

const worldSettingSchema = z.object({
  name: z.string().min(1, "设定名称不能为空"),
  category: z.string().min(1, "请选择分类"),
  content: z.string().optional(),
});

type WorldSettingForm = z.infer<typeof worldSettingSchema>;

interface CreateWorldSettingDialogProps {
  novelId: string;
}

export function CreateWorldSettingDialog({ novelId }: CreateWorldSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorldSettingForm>({
    resolver: zodResolver(worldSettingSchema),
  });

  async function onSubmit(data: WorldSettingForm) {
    await createWorldSetting(novelId, data);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            添加世界观设定
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建世界观设定</DialogTitle>
          <DialogDescription>
            记录小说中的地点、物品、势力、法力等级等规则设定。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">设定名称 *</Label>
            <Input
              id="name"
              placeholder="例如：九州大陆、光明教廷"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">分类 *</Label>
            <select
              id="category"
              {...register("category")}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-invalid={!!errors.category}
            >
              <option value="">选择分类...</option>
              {WORLD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">详细设定</Label>
            <Textarea
              id="content"
              placeholder="详细描述该设定的背景、规则、历史..."
              rows={4}
              {...register("content")}
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
