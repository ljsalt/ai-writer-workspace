import { notFound } from "next/navigation";
import { getNovelById } from "@/app/actions";
import { CreateChapterDialog } from "@/components/CreateChapterDialog";
import { CreateCharacterDialog } from "@/components/CreateCharacterDialog";
import { CreateWorldSettingDialog } from "@/components/CreateWorldSettingDialog";
import { NovelAISettings } from "@/components/NovelAISettings";

interface NovelPageProps {
  params: Promise<{ novelId: string }>;
}

export default async function NovelPage({ params }: NovelPageProps) {
  const { novelId } = await params;
  const novel = await getNovelById(novelId);

  if (!novel) {
    notFound();
  }

  return (
    <NovelAISettings
      novel={novel}
      CreateChapterDialog={CreateChapterDialog}
      CreateCharacterDialog={CreateCharacterDialog}
      CreateWorldSettingDialog={CreateWorldSettingDialog}
    />
  );
}
