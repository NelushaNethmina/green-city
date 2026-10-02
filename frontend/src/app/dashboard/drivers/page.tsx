"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Power, PowerOff, Download, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Driver } from "@/store/greenCityStore";
import { driverService } from "@/services/driver.service";
import { reportService } from "@/services/report.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";

interface DriverFormData {
  name: string;
  nic: string;
  phone: string;
  vehicleNo: string;
  currentWard: string;
  assignedRoute: string;
  collectionDay: string;
  status: "Online" | "Offline";
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Edit / Context details
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
      name: "",
      nic: "",
      phone: "",
      vehicleNo: "",
      currentWard: "Badulla Ward 03",
      assignedRoute: "Route 03-A",
      collectionDay: "Monday",
      status: "Online",
    },
  });

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch {
      toast.error("Failed to load drivers database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    reset({
      name: "",
      nic: "",
      phone: "",
      vehicleNo: "",
      currentWard: "Badulla Ward 03",
      assignedRoute: "Route 03-A",
      collectionDay: "Monday",
      status: "Online",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setValue("name", driver.name);
    setValue("nic", driver.nic || "");
    setValue("phone", driver.phone);
    setValue("vehicleNo", driver.vehicleNo);
    setValue("currentWard", driver.currentWard);
    setValue("assignedRoute", driver.assignedRoute || "");
    setValue("collectionDay", driver.collectionDay || "Monday");
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
    } catch {
      toast.error("Error processing driver details.");
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    try {
      await driverService.toggleStatus(driver.id);
      toast.success(`Driver status changed.`);
      loadDrivers();
    } catch {
      toast.error("Error toggling duty status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;
    try {
      await driverService.delete(selectedDriver.id);
      toast.success("Driver profile deleted.");
      setIsDeleteOpen(false);
      setSelectedDriver(null);
      loadDrivers();
    } catch {
      toast.error("Error removing driver profile.");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Driver Name",
      "NIC",
      "Phone Number",
      "Truck Number",
      "Assigned Route",
      "Assigned Day",
      "Duty Status",
      "Active Ward",
    ];
    const rows = drivers.map((d) => [
      d.name,
      d.nic,
      d.phone,
      d.vehicleNo,
      d.assignedRoute || "Unassigned",
      d.collectionDay || "Everyday",
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
      key: "vehicleNo",
      header: "Truck Number",
      sortable: true,
    },
    {
      key: "assignedRoute",
      header: "Assigned Route",
      sortable: true,
      render: (item) => <span>{item.assignedRoute || "Unassigned"}</span>,
    },
    {
      key: "collectionDay",
      header: "Collection Day",
      sortable: true,
      render: (item) => <span>{item.collectionDay || "Monday"}</span>,
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
          {/* Toggle status button */}
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

          {/* Edit button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1 h-7 w-7 rounded-full text-primary-green hover:bg-primary-green/5"
            title="Edit Details"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          {/* Delete button */}
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
    <div className="flex flex-col gap-6 w-full">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">Driver Management</h2>
          <p className="text-xs text-muted-text mt-0.5">
            Register new drivers, configure active wards, and assign collection routes.
          </p>
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

      {/* Main Table wrapper */}
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

      {/* Modal Dialog: Add/Edit Driver */}
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
          <Input
            label="Truck Number *"
            placeholder="BMC-4530"
            error={errors.vehicleNo?.message}
            {...register("vehicleNo", { required: "Truck registration number is required." })}
          />
          <Input
            label="Assigned Route *"
            placeholder="Route 03-A"
            error={errors.assignedRoute?.message}
            {...register("assignedRoute", { required: "Assigned Route is required." })}
          />
          <Select
            label="Assigned Collection Day *"
            options={[
              { value: "Monday", label: "Monday" },
              { value: "Tuesday", label: "Tuesday" },
              { value: "Wednesday", label: "Wednesday" },
              { value: "Thursday", label: "Thursday" },
              { value: "Friday", label: "Friday" },
              { value: "Saturday", label: "Saturday" },
              { value: "Sunday", label: "Sunday" },
            ]}
            {...register("collectionDay")}
          />
          <Select
            label="Designated Ward Limit *"
            options={[
              { value: "Badulla Ward 01", label: "Badulla Ward 01 (Central)" },
              { value: "Badulla Ward 02", label: "Badulla Ward 02 (Eastern)" },
              { value: "Badulla Ward 03", label: "Badulla Ward 03 (Southern)" },
              { value: "Badulla Ward 04", label: "Badulla Ward 04 (Northern)" },
            ]}
            {...register("currentWard")}
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

      {/* Confirm Dialog: Delete Driver */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver Profile"
        description={`Are you sure you want to permanently delete the profile of "${selectedDriver?.name}"? All assigned routes will be cleared.`}
        confirmText="Permanently Delete"
      />
    </div>
  );
}
