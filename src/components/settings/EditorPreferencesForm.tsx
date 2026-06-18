"use client";

import { useEditorPreferencesStore } from "@/lib/stores/editor-preferences-store";
import { useUpdateEditorPreferences } from "@/lib/mutations/editor-preferences";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorPreferences,
} from "@/lib/schemas/editor-preferences";

export function EditorPreferencesForm() {
  const preferences = useEditorPreferencesStore((state) => state.preferences);
  const setPreferences = useEditorPreferencesStore((state) => state.setPreferences);
  const { mutate } = useUpdateEditorPreferences();

  const apply = (partial: Partial<EditorPreferences>) => {
    const next = { ...preferences, ...partial };
    setPreferences(partial);
    mutate(next);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Font size</label>
          <select
            value={preferences.fontSize}
            onChange={(e) => apply({ fontSize: Number(e.target.value) as EditorPreferences["fontSize"] })}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {EDITOR_FONT_SIZES.map((size) => (
              <option key={size} value={size} className="bg-popover">
                {size}px
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Tab size</label>
          <select
            value={preferences.tabSize}
            onChange={(e) => apply({ tabSize: Number(e.target.value) as EditorPreferences["tabSize"] })}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {EDITOR_TAB_SIZES.map((size) => (
              <option key={size} value={size} className="bg-popover">
                {size} spaces
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Theme</label>
        <select
          value={preferences.theme}
          onChange={(e) => apply({ theme: e.target.value as EditorPreferences["theme"] })}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          {EDITOR_THEMES.map((theme) => (
            <option key={theme} value={theme} className="bg-popover">
              {theme}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Word wrap</label>
        <Switch
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => apply({ wordWrap: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Minimap</label>
        <Switch
          checked={preferences.minimap}
          onCheckedChange={(checked) => apply({ minimap: checked })}
        />
      </div>
    </div>
  );
}
