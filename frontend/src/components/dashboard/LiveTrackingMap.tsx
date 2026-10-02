"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BinLocation, Driver } from "@/store/greenCityStore";

interface LiveTrackingMapProps {
  bins?: BinLocation[];
  drivers?: Driver[];
  selectedBin?: BinLocation | null;
  drawRouteForDriverId?: string; // Optional: draw polyline for this driver
}

// Custom Marker styling matching the Legend instructions
const getMarkerIcon = (type: "Pending" | "Completed" | "Truck" | "SelectedRoute") => {
  let color = "#F59E0B"; // Orange for Pending
  let iconHtml = '<div style="width: 14px; height: 14px; background: currentColor; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>';

  if (type === "Completed") {
    color = "#10B981"; // Green
  } else if (type === "Truck") {
    color = "#3B82F6"; // Blue
    iconHtml = `
      <div style="width: 24px; height: 24px; background: #3B82F6; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
      </div>
    `;
  } else if (type === "SelectedRoute") {
    color = "#EF4444"; // Red
    iconHtml = '<div style="width: 16px; height: 16px; background: #EF4444; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>';
  }

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: ${color};">
      ${
        type === "Pending"
          ? `<div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.25; transform: scale(1.3); animation: pulse-soft 2.5s infinite;"></div>`
          : ""
      }
      ${iconHtml}
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to dynamically re-center map if a bin is selected
function RecenterMap({ bin }: { bin?: BinLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (bin) {
      map.setView([bin.latitude, bin.longitude], 15, { animate: true });
    }
  }, [bin, map]);
  return null;
}

// Driver mock locations mapping
const DRIVER_LOCATIONS: Record<string, [number, number]> = {
  drv_1: [6.9920, 81.0535],
  drv_2: [6.9870, 81.0505],
  drv_3: [6.9955, 81.0605],
};

export default function LiveTrackingMap({
  bins = [],
  drivers = [],
  selectedBin = null,
  drawRouteForDriverId,
}: LiveTrackingMapProps) {
  const defaultCenter: [number, number] = [6.9934, 81.0550];

  // Calculate polyline path if needed
  const routePoints = React.useMemo(() => {
    if (!drawRouteForDriverId) return [];
    const startPoint = DRIVER_LOCATIONS[drawRouteForDriverId] || defaultCenter;
    const assignedBins = bins.filter(
      (b) => b.assignedDriverId === drawRouteForDriverId && b.status !== "Collected"
    );
    const points: [number, number][] = [startPoint];
    assignedBins.forEach((b) => points.push([b.latitude, b.longitude]));
    return points.length > 1 ? points : [];
  }, [bins, drawRouteForDriverId]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-card-border shadow-md min-h-[380px]">
      
      {/* 1. Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Recenter triggers */}
        <RecenterMap bin={selectedBin} />

        {/* Render Bins */}
        {bins.map((bin) => {
          const isSelected = selectedBin && selectedBin.id === bin.id;
          const markerType = isSelected
            ? "SelectedRoute"
            : bin.status === "Collected"
            ? "Completed"
            : "Pending";

          return (
            <Marker
              key={bin.id}
              position={[bin.latitude, bin.longitude]}
              icon={getMarkerIcon(markerType)}
            >
              <Popup>
                <div className="p-1 flex flex-col gap-0.5 text-[11px] font-sans">
                  <div className="flex items-center justify-between gap-3 border-b border-card-border/60 pb-1 mb-1">
                    <span className="font-extrabold text-foreground uppercase">
                      {bin.wasteType}
                    </span>
                    <span
                      style={{
                        color:
                          bin.status === "Pending"
                            ? "#F59E0B"
                            : bin.status === "Assigned"
                            ? "#3B82F6"
                            : "#10B981",
                      }}
                      className="font-bold text-[10px]"
                    >
                      {bin.status}
                    </span>
                  </div>
                  <p className="text-muted-text">
                    <span className="font-bold text-foreground">Address:</span> {bin.address}
                  </p>
                  <p className="text-muted-text">
                    <span className="font-bold text-foreground">Reporter:</span> {bin.reporterName}
                  </p>
                  {bin.weightKg && (
                    <p className="text-emerald-600 font-bold">
                      Weight: {bin.weightKg} Kg
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Trucks (Active/Online Drivers) */}
        {drivers
          .filter((d) => d.status === "Online")
          .map((driver) => {
            const pos = DRIVER_LOCATIONS[driver.id];
            if (!pos) return null;
            return (
              <Marker key={driver.id} position={pos} icon={getMarkerIcon("Truck")}>
                <Popup>
                  <div className="p-1 flex flex-col gap-0.5 text-[11px] font-sans">
                    <h5 className="font-bold text-foreground">{driver.name}</h5>
                    <p className="text-muted-text">Truck: {driver.vehicleNo}</p>
                    <p className="text-muted-text">Route: {driver.assignedRoute || "Unassigned"}</p>
                    <span className="text-[9px] text-blue-500 font-bold">Status: Online</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Draw Route Line */}
        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color="#EF4444" weight={4} dashArray="5, 10" />
        )}
      </MapContainer>

      {/* 2. Floating Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-card-bg/95 backdrop-blur-md border border-card-border p-3.5 rounded-2xl shadow-lg flex flex-col gap-2 text-[10px] font-bold text-foreground max-w-[200px]">
        <div className="text-[9px] uppercase tracking-wider text-muted-text border-b border-card-border pb-1 mb-0.5">
          Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block border border-white" />
          <span>Green = Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block border border-white" />
          <span>Orange = Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block border border-white" />
          <span>Blue = Truck</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block border border-white" />
          <span>Red = Selected Route</span>
        </div>
      </div>
    </div>
  );
}
