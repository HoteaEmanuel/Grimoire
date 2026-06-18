"use client";

import { useEffect } from "react";
import { useEditorPreferencesStore } from "@/lib/stores/editor-preferences-store";
import type { EditorPreferences } from "@/lib/schemas/editor-preferences";

export function EditorPreferencesHydrator({
  preferences,
}: {
  preferences: EditorPreferences;
}) {
  const hydrate = useEditorPreferencesStore((state) => state.hydrate);

  useEffect(() => {
    hydrate(preferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
