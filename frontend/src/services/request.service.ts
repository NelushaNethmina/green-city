import axios from "axios";

const url = "http://localhost:5000";

export interface WasteRequest {
  id: string;
  residentName: string;
  address: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  status: "Pending" | "Collected";
  createdAt: string;
  completedAt: string | null;
}

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

export const requestService = {
  getAll: async (): Promise<WasteRequest[]> => {
    const res = await axios.get(url + "/request", config());
    return res.data.map((r: any): WasteRequest => ({
      id: r._id,
      residentName: r.residentName,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      wasteType: r.wasteType,
      status: r.status === "completed" ? "Collected" : "Pending",
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    }));
  },
};