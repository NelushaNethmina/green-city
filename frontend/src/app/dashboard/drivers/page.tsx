"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Power, PowerOff, Download, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Driver } from "@/store/greenCityStore";
import { driverService } from "@/services/driver.service";
import { vehicleService, Truck } from "@/services/vehicle.service";
import { reportService } from "@/services/report.service";
import TruckManager from "@/components/drivers/TruckManager";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface DriverFormData {
  email: string;
  password: string;
  name: string;
  nic: string;
  phone: string;
  vehicleNo: string;
  currentWard: string;
  status: "Online" | "Offline";
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [truckRefresh, setTruckRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DriverFormData>({
    defaultValues: {
      email: "", 
      password: "",
      name: "",
      nic: "",
      phone: "",
      vehicleNo: "",
      currentWard: "Badulla Ward 03",
      status: "Online",
    },
  });

  const loadTrucks = async (currentTruck?: string) => {
    try {
      setAvailableTrucks(await vehicleService.getAvailable(currentTruck));
    } catch {
      setAvailableTrucks([]);
    }
  };

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data);
      setTruckRefresh((n) => n + 1);
    } catch {
      toast.error("Failed to load drivers database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
    loadTrucks();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    loadTrucks();
    reset({
      email: "",
      password: "",
      name: "",
      nic: "",
      phone: "",
      vehicleNo: "",
      currentWard: "Badulla Ward 03",
      status: "Online",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = async (driver: Driver) => {
    setEditingDriver(driver);
    await loadTrucks(driver.vehicleNo);
    setValue("name", driver.name);
    setValue("nic", driver.nic || "");
    setValue("phone", driver.phone);
    setValue("vehicleNo", driver.vehicleNo === "-" ? "" : driver.vehicleNo);
    setValue("currentWard", driver.currentWard);
    setValue("status", driver.status);
    setIsOpen(true);
  };

  const onSubmit = async (data: DriverFormData) => {
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, data);
        toast.success("Driver details updated successfully.");
      } else {
        await driverService.create(data);
        toast.success("New driver registered successfully.");
      }
      setIsOpen(false);
      reset();
      loadDrivers();
      loadTrucks();
    } catch (err: any) {
      toast.error(err.message || "Error processing driver details.");
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      await driverService.toggleStatus(driver.id);
      toast.success(`Driver status changed.`);
      loadDrivers();
    } catch (err: any) {
      toast.error(err.message || "Error toggling duty status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;
    try {
      await driverService.delete(selectedDriver.id);
      toast.success("Driver profile deleted.");
      loadDrivers();
      loadTrucks();
    } catch (err: any) {
      toast.error(err.message || "Error removing driver profile.");
    } finally {
      setIsDeleteOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Driver Name",
      "NIC",
      "Phone Number",
      "Truck Number",
      "Duty Status",
      "Active Ward",
    ];
    const rows = drivers.map((d) => [
      d.name,
      d.nic,
      d.phone,
      d.vehicleNo,
      d.status,
      d.currentWard,
    ]);
    reportService.exportToCSV(headers, rows, "GreenCity_Drivers_Report");
  };

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver Name",
      sortable: true,
    },
    {
      key: "vehicleNo",
      header: "Truck Number",
      sortable: true,
    },
    {
      key: "nic",
      header: "NIC",
      sortable: true,
      render: (item) => <span>{item.nic || "N/A"}</span>,
    },
    {
      key: "phone",
      header: "Phone Number",
      sortable: true,
    },
    
    {
      key: "status",
      header: "Duty Status",
      sortable: true,
      render: (item) => {
        return (
          <Badge variant={item.status === "Online" ? "success" : "error"}>
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(item)}
            className={`p-1 h-7 w-7 rounded-full transition-colors ${
              item.status === "Online" ? "text-amber-500 hover:bg-amber-500/5" : "text-green-500 hover:bg-green-500/5"
            }`}
            title={item.status === "Online" ? "Mark Offline" : "Mark Online"}
          >
            {item.status === "Online" ? (
              <PowerOff className="h-3.5 w-3.5" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1 h-7 w-7 rounded-full text-primary-green hover:bg-primary-green/5"
            title="Edit Details"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDriver(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600"
            title="Delete Profile"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Driver Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Driver
          </Button>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Driver Fleet...
          </div>
        ) : (
          <Table
            columns={columns}
            data={drivers}
            searchKeys={["name", "vehicleNo", "nic", "currentWard"]}
            searchPlaceholder="Search by name, vehicle, NIC, or ward..."
            emptyTitle="No drivers found"
            emptyDescription="Click Add Driver to register a crew member."
            itemsPerPage={6}
          />
        )}
      </div>

      <TruckManager onChange={() => loadTrucks()} refreshKey={truckRefresh} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingDriver ? "Edit Driver Details" : "Register New Driver"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Driver Name *"
            placeholder="Kasun Perera"
            error={errors.name?.message}
            {...register("name", { required: "Driver name is required." })}
          />
          <Input
            label="NIC Number *"
            placeholder="921389429V"
            error={errors.nic?.message}
            {...register("nic", { required: "NIC number is required." })}
          />
          <Input
            label="Mobile Number *"
            placeholder="077-123-4567"
            error={errors.phone?.message}
            {...register("phone", {
              required: "Phone number is required.",
            })}
          />
          {!editingDriver && (
            <>
              <Input
                label="Email Address (app login) *"
                type="email"
                placeholder="driver@greencity.com"
                error={errors.email?.message}
                {...register("email", { required: "Email is required." })}
              />
              <Input
                label="Password (app login) *"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Password must be at least 8 characters." },
                })}
              />
            </>
          )}
          <Select
            label="Truck Number *"
            options={[
              { value: "", label: availableTrucks.length === 0 ? "No available trucks" : "Select an available truck" },
              ...availableTrucks.map((t) => ({
                value: t.vechicleNumber,
                label: t.vechicleNumber + " (" + t.vechicleType + ")",
              })),
            ]}
            error={errors.vehicleNo?.message}
            {...register("vehicleNo", { required: "Please select a truck." })}
          />
  
          <Select
            label="Duty Status *"
            options={[
              { value: "Online", label: "Online" },
              { value: "Offline", label: "Offline" },
            ]}
            {...register("status")}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingDriver ? "Save Changes" : "Register Driver"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver Profile"
        description={`Are you sure you want to permanently delete the profile of "${selectedDriver?.name}"? `}
        confirmText="Permanently Delete"
      />
    </div>
  );
}