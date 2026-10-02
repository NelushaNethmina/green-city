"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit3, Trash2, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RouteAssignment, Driver, WasteCategory } from "@/store/greenCityStore";
import { routeService } from "@/services/route.service";
import { driverService } from "@/services/driver.service";
import { collectionService } from "@/services/collection.service";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Column } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface RouteFormData {
  driverId: string;
  date: string;
  category: string;
  estimatedDistanceKm: string;
  status: "Pending" | "Active" | "Completed";
}

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState<RouteAssignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Focus Context states
  const [editingRoute, setEditingRoute] = useState<RouteAssignment | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteAssignment | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RouteFormData>({
    defaultValues: {
      driverId: "",
      date: new Date().toISOString().split("T")[0],
      category: "Food Waste",
      estimatedDistanceKm: "12.5",
      status: "Pending",
    },
  });

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const rData = await routeService.getAll();
      const dData = await driverService.getAll();
      const cData = await collectionService.getCategories();
      setRoutes(rData);
      setDrivers(dData);
      setCategories(cData);
    } catch {
      toast.error("Failed to load route assignments database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    reset({
      driverId: drivers[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      category: categories[0]?.name || "Food Waste",
      estimatedDistanceKm: "12.5",
      status: "Pending",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (route: RouteAssignment) => {
    setEditingRoute(route);
    setValue("driverId", route.driverId);
    setValue("date", route.date);
    setValue("category", route.category);
    setValue("estimatedDistanceKm", String(route.estimatedDistanceKm));
    setValue("status", route.status);
    setIsOpen(true);
  };

  const onSubmit = async (data: RouteFormData) => {
    try {
      const payload = {
        ...data,
        estimatedDistanceKm: parseFloat(data.estimatedDistanceKm) || 10,
      };
      if (editingRoute) {
        await routeService.update(editingRoute.id, payload);
        toast.success("Route assignment details modified.");
      } else {
        await routeService.create(payload);
        toast.success("New route dispatch successfully scheduled.");
      }
      setIsOpen(false);
      reset();
      loadAll();
    } catch {
      toast.error("Failed to update route assignments.");
    }
  };

  const handleCompleteRoute = async (route: RouteAssignment) => {
    try {
      await routeService.update(route.id, { status: "Completed" });
      toast.success("Route marked as Completed.");
      loadAll();
    } catch {
      toast.error("Failed to update route status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRoute) return;
    try {
      await routeService.delete(selectedRoute.id);
      toast.success("Route assignment deleted.");
      setIsDeleteOpen(false);
      setSelectedRoute(null);
      loadAll();
    } catch {
      toast.error("Failed to delete route.");
    }
  };

  const activeDriverOptions = useMemo(() => {
    return drivers
      .filter((d) => d.status === "Online")
      .map((d) => ({
        value: d.id,
        label: `${d.name} (${d.vehicleNo})`,
      }));
  }, [drivers]);

  // Aggregate active routes distance
  const totalActiveDistance = useMemo(() => {
    const active = routes.filter((r) => r.status === "Active" || r.status === "Pending");
    return active.reduce((sum, r) => sum + r.estimatedDistanceKm, 0).toFixed(1);
  }, [routes]);

  const columns: Column<RouteAssignment>[] = [
    {
      key: "driverId",
      header: "Driver & Truck",
      sortable: true,
      render: (item) => {
        const driver = drivers.find((d) => d.id === item.driverId);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{driver ? driver.name : "Unknown Driver"}</span>
            <span className="text-[9px] text-muted-text uppercase font-semibold">{driver?.vehicleNo || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Collection Date",
      sortable: true,
    },
    {
      key: "category",
      header: "Waste Class",
      sortable: true,
      render: (item) => <Badge variant="default">{item.category}</Badge>,
    },
    {
      key: "estimatedDistanceKm",
      header: "Distance (Km)",
      sortable: true,
      render: (item) => <span>{item.estimatedDistanceKm} Km</span>,
    },
    {
      key: "status",
      header: "Dispatch Status",
      sortable: true,
      render: (item) => {
        const variant =
          item.status === "Completed"
            ? "success"
            : item.status === "Active"
            ? "info"
            : "warning";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status !== "Completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCompleteRoute(item)}
              className="p-1 h-7 w-7 rounded-full text-green-500 hover:bg-green-500/5"
              title="Complete Dispatch"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(item)}
            className="p-1 h-7 w-7 rounded-full text-primary-green hover:bg-primary-green/5"
            title="Edit Route"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRoute(item);
              setIsDeleteOpen(true);
            }}
            className="p-1 h-7 w-7 rounded-full text-red-500 hover:bg-red-500/5 hover:text-red-600"
            title="Delete Assignment"
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
          <h2 className="text-xl font-extrabold text-foreground">Route Management</h2>
          <p className="text-xs text-muted-text mt-0.5">
            Optimize collection coverage, assign active trucks, and monitor route distances.
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary" size="sm" className="text-xs shrink-0 cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Assign Route
        </Button>
      </div>

      {/* Aggregate Metric Widget */}
      <div className="p-4 bg-primary-green/5 border border-primary-green/10 rounded-2xl flex items-center gap-3">
        <div className="p-3 bg-primary-green/10 text-primary-green rounded-xl">
          <Navigation className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">Total active route distance</span>
          <span className="text-lg font-black text-foreground mt-0.5 block">{totalActiveDistance} Km</span>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="bg-card-bg border border-card-border rounded-3xl p-5 shadow-sm">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-xs font-bold text-muted-text">
            <Loader2 className="h-5 w-5 animate-spin text-primary-green" />
            Loading Route Dispatches...
          </div>
        ) : (
          <Table
            columns={columns}
            data={routes}
            searchKeys={["category", "driverId"]}
            searchPlaceholder="Search by waste class..."
            emptyTitle="No route dispatches scheduled"
            emptyDescription="Click Assign Route to schedule a truck collection."
            itemsPerPage={6}
          />
        )}
      </div>

      {/* Modal Dialog: Add/Edit Route */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingRoute ? "Edit Route Details" : "Assign Collection Route"}
        className="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Select Active Driver *"
            options={activeDriverOptions}
            error={errors.driverId?.message}
            {...register("driverId", { required: "Driver selection is required." })}
          />
          <Input
            type="date"
            label="Assignment Date *"
            error={errors.date?.message}
            {...register("date", { required: "Assignment date is required." })}
          />
          <Select
            label="Waste Category *"
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            {...register("category")}
          />
          <Input
            label="Estimated Distance (Km) *"
            placeholder="12.5"
            error={errors.estimatedDistanceKm?.message}
            {...register("estimatedDistanceKm", { required: "Estimated distance is required." })}
          />
          <Select
            label="Status *"
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Active", label: "Active Dispatch" },
              { value: "Completed", label: "Completed Dispatch" },
            ]}
            {...register("status")}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingRoute ? "Save Changes" : "Assign Route"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog: Delete Route */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Route Assignment"
        description="Are you sure you want to permanently delete this route assignment log? This action cannot be undone."
        confirmText="Permanently Delete"
      />
    </div>
  );
}
