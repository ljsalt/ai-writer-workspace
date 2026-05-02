import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ChapterMemorySidebar } from "@/components/ChapterMemorySidebar";
import { PromptPreviewDialog } from "@/components/PromptPreviewDialog";
import { WritingArea } from "@/components/WritingArea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

interface WritingPageProps {
  params: Promise<{ novelId: string; chapterId: string }>;
}

export default async function WritingPage({ params }: WritingPageProps) {
  const { novelId, chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      characters: true,
      worldSettings: true,
      novel: true,
    },
  });

  if (!chapter) {
    notFound();
  }

  const allCharacters = await prisma.character.findMany({
    where: { novelId },
    select: { id: true, name: true, aliases: true, personality: true },
  });

  const allWorldSettings = await prisma.worldSetting.findMany({
    where: { novelId },
    select: { id: true, name: true, category: true, content: true },
  });

  return (
    <>
      <Toaster />
      <div className="flex flex-1 flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-3 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/novel/${novelId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-sm font-medium">{chapter.title}</h1>
              <p className="text-xs text-muted-foreground">{chapter.novel.title}</p>
            </div>
          </div>
          <PromptPreviewDialog chapterId={chapterId} />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r shrink-0 overflow-y-auto p-4">
            <ChapterMemorySidebar
              chapterId={chapterId}
              novelId={novelId}
              initialCharacters={chapter.characters}
              initialWorldSettings={chapter.worldSettings}
              currentCharacterIds={chapter.characters.map((c) => c.id)}
              currentWorldSettingIds={chapter.worldSettings.map((ws) => ws.id)}
              allCharacters={allCharacters}
              allWorldSettings={allWorldSettings}
            />
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  第{chapter.order}章
                </span>
                <h2 className="text-base font-medium">{chapter.title}</h2>
              </div>
              {chapter.summary && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">本章目标：</span>
                  {chapter.summary}
                </p>
              )}
            </div>

            <div className="flex-1 px-6 pb-6 overflow-hidden">
              <WritingArea
                chapterId={chapterId}
                initialContent={chapter.content}
                aiConfig={{
                  aiProvider: chapter.novel.aiProvider,
                  aiBaseUrl: chapter.novel.aiBaseUrl,
                  aiApiKey: chapter.novel.aiApiKey,
                  aiModelId: chapter.novel.aiModelId,
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
