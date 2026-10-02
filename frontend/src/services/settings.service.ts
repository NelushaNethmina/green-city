import { useGreenCityStore, SystemSettings } from "@/store/greenCityStore";
import { useAuthStore } from "@/store/authStore";

export const settingsService = {
  getSettings: async (): Promise<SystemSettings> => {
    return useGreenCityStore.getState().settings;
  },

  updateSettings: async (updates: Partial<SystemSettings>): Promise<void> => {
    useGreenCityStore.getState().updateSettings(updates);
  },

  // Administrators
  getAdmins: async (): Promise<{ id: string; name: string; email: string; role: string; password?: string }[]> => {
    return useGreenCityStore.getState().admins;
  },

  addAdmin: async (admin: { name: string; email: string; role: string; password?: string }): Promise<void> => {
    useGreenCityStore.getState().addAdmin(admin);
  },

  removeAdmin: async (id: string): Promise<void> => {
    useGreenCityStore.getState().removeAdmin(id);
  },

  // Profile updates
  updateProfile: async (profile: { name: string; email: string; password?: string; profilePic?: string }): Promise<void> => {
    useAuthStore.getState().updateProfile(profile);
  }
};
