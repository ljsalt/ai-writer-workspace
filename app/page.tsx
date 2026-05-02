import { BookOpenIcon } from "lucide-react";
import Link from "next/link";
import { getNovels } from "./actions";
import { CreateNovelDialog } from "@/components/CreateNovelDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function HomePage() {
  const novels = await getNovels();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-semibold">我的小说库</h1>
        <CreateNovelDialog />
      </header>

      <main className="flex-1 p-6">
        {novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4">
            <BookOpenIcon className="size-12" />
            <div>
              <p className="text-lg font-medium">还没有小说</p>
              <p className="text-sm">点击右上角「创建新小说」开始你的创作之旅</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {novels.map((novel) => (
              <Link key={novel.id} href={`/novel/${novel.id}`}>
                <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{novel.title}</CardTitle>
                    {novel.description && (
                      <CardDescription className="line-clamp-2">
                        {novel.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {novel.author} ·{" "}
                      {new Date(novel.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
