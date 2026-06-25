import { create } from "zustand";
import type { ProfileSectionId } from "@/types/profile";

interface UiState {
  optionsOpen: boolean;
  profileSection: ProfileSectionId;
  openOptions: () => void;
  closeOptions: () => void;
  toggleOptions: () => void;
  setProfileSection: (section: ProfileSectionId) => void;
}

export const useUiStore = create<UiState>((set) => ({
  optionsOpen: false,
  profileSection: "account",
  openOptions: () => set({ optionsOpen: true }),
  closeOptions: () => set({ optionsOpen: false }),
  toggleOptions: () => set((state) => ({ optionsOpen: !state.optionsOpen })),
  setProfileSection: (section) => set({ profileSection: section }),
}));

/** @deprecated Use openOptions */
export const openDrawer = () => useUiStore.getState().openOptions();
/** @deprecated Use closeOptions */
export const closeDrawer = () => useUiStore.getState().closeOptions();
