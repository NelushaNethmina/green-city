import { useGreenCityStore, BinLocation, WasteCategory, DailyCollection } from "@/store/greenCityStore";

export const collectionService = {
  getAllBins: async (): Promise<BinLocation[]> => {
    return useGreenCityStore.getState().bins;
  },
  
  createBin: async (bin: Omit<BinLocation, "id" | "createdAt">): Promise<void> => {
    useGreenCityStore.getState().addBin(bin);
  },

  updateBin: async (id: string, updates: Partial<BinLocation>): Promise<void> => {
    useGreenCityStore.getState().updateBin(id, updates);
  },

  deleteBin: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteBin(id);
  },

  assignDriver: async (binId: string, driverId: string): Promise<void> => {
    useGreenCityStore.getState().assignDriverToBin(binId, driverId);
  },

  collectBin: async (binId: string, weightKg: number): Promise<void> => {
    useGreenCityStore.getState().collectBin(binId, weightKg);
  },

  // Categories Actions
  getCategories: async (): Promise<WasteCategory[]> => {
    return useGreenCityStore.getState().categories;
  },

  createCategory: async (name: string): Promise<void> => {
    useGreenCityStore.getState().addCategory(name);
  },

  renameCategory: async (id: string, newName: string): Promise<void> => {
    // Rename in the categories list. Uses store's update if available or patch locally.
    const store = useGreenCityStore.getState();
    const updated = store.categories.map((c) =>
      c.id === id ? { ...c, name: newName } : c
    );
    // Persist via localStorage directly since the store doesn't expose renameCategory yet
    if (typeof window !== "undefined") {
      localStorage.setItem("green_city_categories", JSON.stringify(updated));
    }
    // Force a re-render by triggering an addCategory no-op via zustand internal
    useGreenCityStore.setState({ categories: updated });
  },

  deleteCategory: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteCategory(id);
  },

  // Daily Collections records
  getDailyCollections: async (): Promise<DailyCollection[]> => {
    return useGreenCityStore.getState().dailyCollections;
  },

  createDailyCollection: async (collection: Omit<DailyCollection, "id">): Promise<void> => {
    useGreenCityStore.getState().addDailyCollection(collection);
  },

  updateDailyCollection: async (id: string, updates: Partial<DailyCollection>): Promise<void> => {
    useGreenCityStore.getState().updateDailyCollection(id, updates);
  },

  deleteDailyCollection: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteDailyCollection(id);
  }
};

