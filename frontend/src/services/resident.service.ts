import { useGreenCityStore, ResidentUser } from "@/store/greenCityStore";

export const residentService = {
  getAll: async (): Promise<ResidentUser[]> => {
    return useGreenCityStore.getState().residents;
  },

  getById: async (id: string): Promise<ResidentUser | undefined> => {
    return useGreenCityStore.getState().residents.find((r) => r.id === id);
  },

  create: async (resident: Omit<ResidentUser, "id" | "createdAt">): Promise<void> => {
    useGreenCityStore.getState().addResident(resident);
  },

  update: async (id: string, updates: Partial<ResidentUser>): Promise<void> => {
    useGreenCityStore.getState().updateResident(id, updates);
  },

  delete: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteResident(id);
  },
};
