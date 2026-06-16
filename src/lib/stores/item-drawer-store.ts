import { create } from "zustand";

interface ItemDrawerState {
  selectedId: string | null;
  open: boolean;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
}

export const useItemDrawerStore = create<ItemDrawerState>((set) => ({
  selectedId: null,
  open: false,
  openDrawer: (id) => set({ selectedId: id, open: true }),
  closeDrawer: () => set({ open: false }),
}));
