"use client";

import { useState, useTransition } from "react";
import { updateChapterContext } from "@/app/actions";

interface Character {
  id: string;
  name: string;
  aliases: string | null;
  personality: string | null;
}

interface WorldSetting {
  id: string;
  name: string;
  category: string;
  content: string | null;
}

interface ChapterMemorySidebarProps {
  chapterId: string;
  novelId: string;
  initialCharacters: Character[];
  initialWorldSettings: WorldSetting[];
  currentCharacterIds: string[];
  currentWorldSettingIds: string[];
  allCharacters: Character[];
  allWorldSettings: WorldSetting[];
}

export function ChapterMemorySidebar({
  chapterId,
  initialCharacters,
  initialWorldSettings,
  currentCharacterIds,
  currentWorldSettingIds,
  allCharacters,
  allWorldSettings,
}: ChapterMemorySidebarProps) {
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(currentCharacterIds);
  const [selectedWorldSettingIds, setSelectedWorldSettingIds] = useState<string[]>(currentWorldSettingIds);
  const [isPending, startTransition] = useTransition();

  function handleCharacterToggle(id: string) {
    setSelectedCharacterIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleWorldSettingToggle(id: string) {
    setSelectedWorldSettingIds((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  function handleSave() {
    startTransition(() => {
      updateChapterContext(chapterId, selectedCharacterIds, selectedWorldSettingIds);
    });
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">出场角色</h3>
        <div className="flex flex-col gap-1">
          {allCharacters.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">暂无角色</p>
          ) : (
            allCharacters.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCharacterIds.includes(c.id)}
                  onChange={() => handleCharacterToggle(c.id)}
                  className="accent-primary"
                />
                <span>{c.name}</span>
                {c.aliases && (
                  <span className="text-xs text-muted-foreground">({c.aliases})</span>
                )}
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">世界观设定</h3>
        <div className="flex flex-col gap-1">
          {allWorldSettings.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">暂无世界观设定</p>
          ) : (
            allWorldSettings.map((ws) => (
              <label
                key={ws.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedWorldSettingIds.includes(ws.id)}
                  onChange={() => handleWorldSettingToggle(ws.id)}
                  className="accent-primary"
                />
                <span>{ws.name}</span>
                <span className="text-xs text-muted-foreground">[{ws.category}]</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full h-8 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存记忆锚点"}
        </button>
      </div>
    </div>
  );
}
