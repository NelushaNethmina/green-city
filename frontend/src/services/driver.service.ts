import axios from "axios";
import { Driver } from "@/store/greenCityStore";

const url = "http://localhost:5000";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const users = await axios.get(url + "/users", config());
    const vechicles = await axios.get(url + "/vechicle", config());
    let schedules: any[] = [];
    try {
      const sres = await axios.get(url + "/schedule", config());
      schedules = sres.data;
    } catch {}

    return users.data
      .filter((u: any) => u.role === "driver")
      .map((u: any): Driver => {
        const v = vechicles.data.find(
          (x: any) => String(x.assignedDriver?._id || x.assignedDriver) === u._id
        );
        const s = schedules.find(
          (x: any) => String(x.driver?._id || x.driver) === u._id
        );
        return {
          id: u._id,
          name: u.firstName + " " + u.lastName,
          nic: u.nic,
          phone: u.phone,
          vehicleNo: v ? v.vechicleNumber : "-",
          status: u.status === "active" ? "Online" : "Offline",
          currentWard: "-",
          assignedRoute: s ? s.assignRoute : "-",
          collectionDay: s
            ? new Date(s.collectionDate).toLocaleDateString("en-US", { weekday: "long" })
            : "-",
        };
      });
  },

  getById: async (id: string): Promise<Driver | undefined> => {
    const drivers = await driverService.getAll();
    return drivers.find((d) => d.id === id);
  },

  create: async (driver: Omit<Driver, "id">): Promise<void> => {
    const names = driver.name.split(" ");
    const email = driver.nic + "@greencity.lk";
    await axios.post(
      url + "/users",
      {
        nic: driver.nic,
        email: email,
        firstName: names[0],
        lastName: names.slice(1).join(" ") || "-",
        password: "Driver@123",
        phone: driver.phone,
        role: "driver",
        status: driver.status === "Online" ? "active" : "inactive",
      },
      config()
    );
    if (driver.vehicleNo && driver.vehicleNo !== "-") {
      try {
        await axios.put(
          url + "/vechicle/" + driver.vehicleNo + "/assign-driver",
          { email: email },
          config()
        );
      } catch {}
    }
  },

  update: async (id: string, updates: Partial<Driver>): Promise<void> => {
    const body: any = {};
    if (updates.name) {
      const names = updates.name.split(" ");
      body.firstName = names[0];
      body.lastName = names.slice(1).join(" ") || "-";
    }
    if (updates.nic) body.nic = updates.nic;
    if (updates.phone) body.phone = updates.phone;
    if (updates.status) body.status = updates.status === "Online" ? "active" : "inactive";
    await axios.put(url + "/users/" + id, body, config());

    if (updates.vehicleNo && updates.vehicleNo !== "-") {
      try {
        const all = await axios.get(url + "/users", config());
        const u = all.data.find((x: any) => x._id === id);
        await axios.put(
          url + "/vechicle/" + updates.vehicleNo + "/assign-driver",
          { email: u.email },
          config()
        );
      } catch {}
    }
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(url + "/users/" + id, config());
  },

  toggleStatus: async (id: string): Promise<void> => {
    const driver = await driverService.getById(id);
    if (!driver) return;
    await axios.put(
      url + "/users/" + id,
      { status: driver.status === "Online" ? "inactive" : "active" },
      config()
    );
  },
};