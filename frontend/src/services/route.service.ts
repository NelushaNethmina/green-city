import { useGreenCityStore, RouteAssignment } from "@/store/greenCityStore";

export const routeService = {
  getAll: async (): Promise<RouteAssignment[]> => {
    return useGreenCityStore.getState().routeAssignments;
  },

  create: async (assignment: Omit<RouteAssignment, "id">): Promise<void> => {
    useGreenCityStore.getState().addRouteAssignment(assignment);
  },

  update: async (id: string, updates: Partial<RouteAssignment>): Promise<void> => {
    useGreenCityStore.getState().updateRouteAssignment(id, updates);
  },

  delete: async (id: string): Promise<void> => {
    useGreenCityStore.getState().deleteRouteAssignment(id);
  },

  getEstimatedDistance: async (): Promise<number> => {
    const activeRoutes = useGreenCityStore.getState().routeAssignments.filter(r => r.status === "Active");
    const totalDistance = activeRoutes.reduce((sum, r) => sum + r.estimatedDistanceKm, 0);
    return parseFloat(totalDistance.toFixed(1));
  }
};
