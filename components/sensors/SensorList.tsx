"use client";

import { memo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SensorItem } from "./SensorItem";
import type { Sensor } from "@/types/sensors";
import { cn } from "@/lib/utils";

interface SensorListProps {
  sensors: Sensor[];
  selectedSensorIds: Set<string>;
  onToggleSensor: (sensorId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isLoading?: boolean;
}

/**
 * Loading skeleton - updated height to match new SensorItem (h-20)
 */
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="space-y-0" aria-busy="true" aria-label="Loading sensors">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-20 flex items-center gap-4 px-4 py-3 border-b border-border/50 animate-pulse"
        >
          <div className="size-4 rounded bg-muted" />
          <div className="size-8 rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
          <div className="h-6 w-20 rounded bg-muted hidden sm:block" />
          <div className="h-8 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">📡</div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        No sensors found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        This location doesn&apos;t have any sensors configured yet.
        Contact your administrator to add sensors.
      </p>
    </div>
  );
});

interface SensorListHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const SensorListHeader = memo(function SensorListHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
}: SensorListHeaderProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const handleSelectAllChange = useCallback(() => {
    if (allSelected || someSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  }, [allSelected, someSelected, onSelectAll, onDeselectAll]);

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border sticky top-0 z-10">
      <Checkbox
        checked={allSelected}
        data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
        onCheckedChange={handleSelectAllChange}
        aria-label={allSelected ? "Deselect all sensors" : "Select all sensors"}
        className={cn(
          someSelected && "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
        )}
      />
      <span className="text-sm font-medium">
        {allSelected
          ? "All sensors selected"
          : someSelected
          ? `${selectedCount.toLocaleString()} of ${totalCount.toLocaleString()} selected`
          : "Select all sensors"}
      </span>
      {someSelected && (
        <button
          type="button"
          onClick={onDeselectAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          Clear selection
        </button>
      )}
    </div>
  );
});

interface SensorListBodyProps {
  sensors: Sensor[];
  selectedSensorIds: Set<string>;
  onToggleSensor: (sensorId: string) => void;
}

const SensorListBody = memo(function SensorListBody({
  sensors,
  selectedSensorIds,
  onToggleSensor,
}: SensorListBodyProps) {
  return (
    <div
      className="flex-1 overflow-y-auto max-h-[480px] contain-paint"
      role="listbox"
      aria-multiselectable="true"
      aria-label="Sensor list"
    >
      {sensors.map((sensor) => (
        <SensorItem
          key={sensor.sensorId}
          sensor={sensor}
          isSelected={selectedSensorIds.has(sensor.sensorId)}
          onToggle={onToggleSensor}
        />
      ))}
    </div>
  );
});

function SensorListComponent({
  sensors,
  selectedSensorIds,
  onToggleSensor,
  onSelectAll,
  onDeselectAll,
  isLoading = false,
}: SensorListProps) {
  const selectedCount = selectedSensorIds.size;
  const totalCount = sensors.length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (sensors.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full">
      <SensorListHeader
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
      <SensorListBody
        sensors={sensors}
        selectedSensorIds={selectedSensorIds}
        onToggleSensor={onToggleSensor}
      />
    </div>
  );
}

export const SensorList = memo(SensorListComponent);
