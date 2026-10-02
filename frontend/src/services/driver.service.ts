import { useGreenCityStore, Driver } from "@/store/greenCityStore";

export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    return useGreenCityStore.getState().drivers;
  },

  getById: async (id: string): Promise<Driver | undefined> => {
    return useGreenCityStore.getState().drivers.find((d) => d.id === id);
  },

  create: async (driver: Omit<Driver, "id">): Promise<void> => {
    useGreenCityStore.getState().addDriver(driver);
  },

  update: async (id: string, updates: Partial<Driver>): Promise<void> => {
    useGreenCityStore.getState().updateDriver(id, updates);
  },

  delete: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteDriver(id);
  },

  toggleStatus: async (id: string): Promise<void> => {
    useGreenCityStore.getState().toggleDriverStatus(id);
  },
};
