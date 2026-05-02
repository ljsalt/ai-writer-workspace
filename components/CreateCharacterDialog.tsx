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
import { createCharacter } from "@/app/actions";

const characterSchema = z.object({
  name: z.string().min(1, "角色姓名不能为空"),
  aliases: z.string().optional(),
  personality: z.string().optional(),
  appearance: z.string().optional(),
  background: z.string().optional(),
  secrets: z.string().optional(),
});

type CharacterForm = z.infer<typeof characterSchema>;

interface CreateCharacterDialogProps {
  novelId: string;
}

export function CreateCharacterDialog({ novelId }: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CharacterForm>({
    resolver: zodResolver(characterSchema),
  });

  async function onSubmit(data: CharacterForm) {
    await createCharacter(novelId, data);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            添加新角色
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新角色</DialogTitle>
          <DialogDescription>
            为小说创建一个新的角色设定。姓名必填，其他信息可后续补充。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              placeholder="例如：叶修"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="aliases">别名/称号</Label>
            <Input
              id="aliases"
              placeholder="例如：叶神、斗神"
              {...register("aliases")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="personality">性格特点</Label>
            <Textarea
              id="personality"
              placeholder="角色的性格特征：冷静、果断、腹黑..."
              rows={2}
              {...register("personality")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="appearance">外貌特征</Label>
            <Textarea
              id="appearance"
              placeholder="身高、发色、瞳色、衣着等..."
              rows={2}
              {...register("appearance")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="background">核心背景</Label>
            <Textarea
              id="background"
              placeholder="角色的身世、经历、与其他角色的关系..."
              rows={3}
              {...register("background")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="secrets">隐藏设定/秘密</Label>
            <Textarea
              id="secrets"
              placeholder="不轻易透露的秘密、真实身份等..."
              rows={2}
              {...register("secrets")}
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
              {isSubmitting ? "创建中..." : "创建角色"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
