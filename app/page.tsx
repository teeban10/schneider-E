"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LocationSelect,
  SensorList,
  ActionBar,
} from "@/components/sensors";
import { getLocations, getSensorsByLocation } from "@/lib/sensors";
import type { Location, Sensor } from "@/types/sensors";

/**
 * SensorSelectionPage
 *
 * Main page component for the sensor selection application.
 * Updated to work with the new sensor schema where:
 * - Each location is a separate JSON file
 * - Sensors use sensorId as the unique identifier
 */
export default function SensorSelectionPage() {
  // ============================================
  // State
  // ============================================

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);

  // Selection state - using Set for O(1) operations
  // Now tracks sensorId instead of generic id
  const [selectedSensorIds, setSelectedSensorIds] = useState<Set<string>>(
    new Set()
  );

  // ============================================
  // Refs for Stable Callbacks
  // ============================================

  const selectedSensorIdsRef = useRef(selectedSensorIds);
  const selectedLocationIdRef = useRef(selectedLocationId);
  const sensorsRef = useRef(sensors);

  useEffect(() => {
    selectedSensorIdsRef.current = selectedSensorIds;
  }, [selectedSensorIds]);

  useEffect(() => {
    selectedLocationIdRef.current = selectedLocationId;
  }, [selectedLocationId]);

  useEffect(() => {
    sensorsRef.current = sensors;
  }, [sensors]);

  // ============================================
  // Derived State
  // ============================================

  const selectedLocation = locations.find((loc) => loc.id === selectedLocationId);

  // ============================================
  // Data Fetching Effects
  // ============================================

  useEffect(() => {
    let isMounted = true;

    async function fetchLocations() {
      try {
        const data = await getLocations();
        if (isMounted) {
          setLocations(data);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    }

    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedLocationId) {
      setSensors([]);
      setSelectedSensorIds(new Set());
      return;
    }

    let isMounted = true;
    setIsLoadingSensors(true);

    async function fetchSensors() {
      try {
        const data = await getSensorsByLocation(selectedLocationId!);
        if (isMounted) {
          setSensors(data);
          setSelectedSensorIds(new Set());
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      } finally {
        if (isMounted) {
          setIsLoadingSensors(false);
        }
      }
    }

    fetchSensors();

    return () => {
      isMounted = false;
    };
  }, [selectedLocationId]);

  // ============================================
  // Event Handlers (Stable Callbacks)
  // ============================================

  const handleLocationChange = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
  }, []);

  const handleToggleSensor = useCallback((sensorId: string) => {
    setSelectedSensorIds((prev) => {
      const next = new Set(prev);
      if (next.has(sensorId)) {
        next.delete(sensorId);
      } else {
        next.add(sensorId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentSensors = sensorsRef.current;
    // Use sensorId for the new schema
    setSelectedSensorIds(new Set(currentSensors.map((s) => s.sensorId)));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedSensorIds(new Set());
  }, []);

  const handleConfirm = useCallback(() => {
    const currentSelectedIds = selectedSensorIdsRef.current;
    const currentLocationId = selectedLocationIdRef.current;
    const selectedIds = Array.from(currentSelectedIds);

    console.log("=".repeat(50));
    console.log("CONFIRMED SENSOR SELECTION");
    console.log("=".repeat(50));
    console.log(`Location: ${currentLocationId}`);
    console.log(`Count: ${selectedIds.length} sensors`);
    console.log("Sensor IDs:", selectedIds);
    console.log("=".repeat(50));

    alert(
      `Selection confirmed!\n\n${selectedIds.length} sensor(s) selected.\n\nCheck the browser console for detailed output.`
    );
  }, []);

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto px-4 py-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sensor Selection
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a data center location to view and manage available sensors.
          </p>
        </header>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Choose Location</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSelect
              locations={locations}
              selectedLocation={selectedLocationId}
              onLocationChange={handleLocationChange}
              isLoading={isLoadingLocations}
            />
          </CardContent>
        </Card>

        {selectedLocationId && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedLocation?.name} Sensors
                </CardTitle>
                {!isLoadingSensors && sensors.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {sensors.length.toLocaleString()} sensor{sensors.length !== 1 ? "s" : ""} available
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <SensorList
                sensors={sensors}
                selectedSensorIds={selectedSensorIds}
                onToggleSensor={handleToggleSensor}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                isLoading={isLoadingSensors}
              />
            </CardContent>
          </Card>
        )}

        {!selectedLocationId && !isLoadingLocations && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No location selected
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a data center location from the dropdown above to view
                available sensors and make your selection.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {selectedLocationId && (
        <ActionBar
          selectedCount={selectedSensorIds.size}
          totalCount={sensors.length}
          onConfirm={handleConfirm}
          confirmLabel="Confirm Selection"
        />
      )}
    </div>
  );
}
