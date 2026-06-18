import { create } from "zustand";
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from "@/lib/schemas/editor-preferences";

interface EditorPreferencesState {
  preferences: EditorPreferences;
  hydrate: (preferences: EditorPreferences) => void;
  setPreferences: (preferences: Partial<EditorPreferences>) => void;
}

export const useEditorPreferencesStore = create<EditorPreferencesState>((set) => ({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  hydrate: (preferences) => set({ preferences }),
  setPreferences: (partial) =>
    set((state) => ({ preferences: { ...state.preferences, ...partial } })),
}));
