import { create } from "zustand";

interface FavoriteOverridesState {
  overrides: Record<string, boolean>;
  setOverride: (key: string, value: boolean) => void;
}

export const useFavoriteOverridesStore = create<FavoriteOverridesState>((set) => ({
  overrides: {},
  setOverride: (key, value) =>
    set((state) => ({ overrides: { ...state.overrides, [key]: value } })),
}));
