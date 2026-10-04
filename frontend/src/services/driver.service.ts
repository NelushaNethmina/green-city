import axios from "axios";
import { Driver } from "@/store/greenCityStore";

const url = "http://localhost:5000";

function config() {
  return { headers: { Authorization: "Bearer " + localStorage.getItem("token") } };
}

function errorMessage(err: any, fallback: string) {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
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

    create: async (driver: Omit<Driver, "id"> & { email: string; password: string }): Promise<void> => {
    if (!driver.vehicleNo || driver.vehicleNo === "-") {
      throw new Error("Please select a truck for the driver.");
    }

    const names = driver.name.trim().split(" ");

    try {
      await axios.post(
        url + "/users/driver",
        {
          nic: driver.nic,
          email: driver.email,
          password: driver.password,
          firstName: names[0],
          lastName: names.slice(1).join(" ") || "-",
          phone: driver.phone,
          status: driver.status === "Online" ? "active" : "inactive",
          vechicleNumber: driver.vehicleNo,
        },
        config()
      );
    } catch (err) {
      throw new Error(errorMessage(err, "Failed to create driver."));
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