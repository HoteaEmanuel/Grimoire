import { create } from "zustand";

interface ToggleOverridesState {
  overrides: Record<string, boolean>;
  setOverride: (key: string, value: boolean) => void;
}

export const useToggleOverridesStore = create<ToggleOverridesState>((set) => ({
  overrides: {},
  setOverride: (key, value) =>
    set((state) => ({ overrides: { ...state.overrides, [key]: value } })),
}));
