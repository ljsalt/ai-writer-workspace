"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildGenerationPrompt } from "@/lib/prompt-builder";

export async function getNovels() {
  return prisma.novel.findMany({
    orderBy: { updatedAt: "desc" },
  });
}

export async function createNovel(data: { title: string; description?: string }) {
  await prisma.novel.create({
    data: {
      title: data.title,
      author: "未知作者",
      description: data.description ?? null,
    },
  });
  revalidatePath("/");
}

export async function getNovelById(id: string) {
  return prisma.novel.findUnique({
    where: { id },
    include: {
      characters: true,
      worldSettings: true,
      chapters: { orderBy: { order: "asc" } },
    },
  });
}

export async function createCharacter(
  novelId: string,
  data: {
    name: string;
    aliases?: string;
    personality?: string;
    appearance?: string;
    background?: string;
    secrets?: string;
  }
) {
  await prisma.character.create({
    data: {
      novelId,
      name: data.name,
      aliases: data.aliases ?? null,
      personality: data.personality ?? null,
      appearance: data.appearance ?? null,
      background: data.background ?? null,
      secrets: data.secrets ?? null,
    },
  });
  revalidatePath(`/novel/${novelId}`);
}

export async function createWorldSetting(
  novelId: string,
  data: {
    name: string;
    category: string;
    content?: string;
  }
) {
  await prisma.worldSetting.create({
    data: {
      novelId,
      name: data.name,
      category: data.category,
      content: data.content ?? null,
    },
  });
  revalidatePath(`/novel/${novelId}`);
}

export async function createChapter(
  novelId: string,
  data: {
    title: string;
    summary?: string;
  }
) {
  const count = await prisma.chapter.count({
    where: { novelId },
  });
  await prisma.chapter.create({
    data: {
      novelId,
      title: data.title,
      summary: data.summary ?? null,
      order: count + 1,
    },
  });
  revalidatePath(`/novel/${novelId}`);
}

export async function updateChapterContext(
  chapterId: string,
  characterIds: string[],
  worldSettingIds: string[]
) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { novelId: true },
  });
  await prisma.chapter.update({
    where: { id: chapterId },
    data: {
      characters: {
        set: characterIds.map((id) => ({ id })),
      },
      worldSettings: {
        set: worldSettingIds.map((id) => ({ id })),
      },
    },
  });
  if (chapter) {
    revalidatePath(`/novel/${chapter.novelId}`);
  }
}

export async function previewPrompt(chapterId: string): Promise<string> {
  return buildGenerationPrompt(chapterId);
}

export async function saveNovelAIConfig(
  novelId: string,
  data: {
    aiProvider?: string;
    aiBaseUrl?: string;
    aiApiKey?: string;
    aiModelId?: string;
  }
) {
  await prisma.novel.update({
    where: { id: novelId },
    data: {
      aiProvider: data.aiProvider ?? null,
      aiBaseUrl: data.aiBaseUrl ?? null,
      aiApiKey: data.aiApiKey ?? null,
      aiModelId: data.aiModelId ?? null,
    },
  });
  revalidatePath(`/novel/${novelId}`);
}
