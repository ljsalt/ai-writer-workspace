import { prisma } from "@/lib/prisma";

export async function buildGenerationPrompt(chapterId: string): Promise<string> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      characters: true,
      worldSettings: true,
      novel: true,
    },
  });

  if (!chapter) {
    return "章节不存在";
  }

  const priorChapters = await prisma.chapter.findMany({
    where: {
      novelId: chapter.novelId,
      order: { lt: chapter.order },
    },
    orderBy: { order: "asc" },
    select: { order: true, title: true, summary: true },
  });

  const parts: string[] = [];

  parts.push("你是一个顶级的网络小说作家。请严格遵循以下设定的约束，根据本章目标进行撰写，避免出现设定冲突和逻辑漏洞。");

  parts.push("【世界观与规则约束】");
  if (chapter.worldSettings.length === 0) {
    parts.push("(本章未关联任何世界观设定)");
  } else {
    for (const ws of chapter.worldSettings) {
      parts.push(`- 【${ws.category}】${ws.name}`);
      if (ws.content) {
        parts.push(`  ${ws.content}`);
      }
    }
  }

  parts.push("");
  parts.push("【本章出场角色设定】");
  if (chapter.characters.length === 0) {
    parts.push("(本章未关联任何角色)");
  } else {
    for (const c of chapter.characters) {
      parts.push(`- ${c.name}`);
      if (c.aliases) parts.push(`  别名：${c.aliases}`);
      if (c.personality) parts.push(`  性格：${c.personality}`);
      if (c.background) parts.push(`  背景：${c.background}`);
      if (c.secrets) parts.push(`  秘密：${c.secrets}`);
    }
  }

  parts.push("");
  parts.push("【前文剧情提要】");
  if (priorChapters.length === 0) {
    parts.push("(这是第一章，无前文剧情)");
  } else {
    for (const pc of priorChapters) {
      parts.push(`第${pc.order}章 ${pc.title}：${pc.summary ?? "（无摘要）"}`);
    }
  }

  parts.push("");
  parts.push("【本章写作目标】");
  parts.push(chapter.summary ?? "（本章暂无写作目标摘要）");

  return parts.join("\n");
}
