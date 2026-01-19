"use client";

import { memo, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Sensor } from "@/types/sensors";
import { cn } from "@/lib/utils";

interface SensorItemProps {
  sensor: Sensor;
  isSelected: boolean;
  onToggle: (sensorId: string) => void;
}

/**
 * Device type icon mapping for visual categorization.
 */
const DEVICE_TYPE_ICONS: Record<string, string> = {
  "Rack PDU": "🔌",
  "UPS": "🔋",
  "CRAC": "❄️",
  "CRAH": "💨",
  "Chiller": "🧊",
  "Generator": "⚡",
  "ATS": "🔀",
  "Meter": "📊",
  default: "📡",
};

/**
 * Get icon for device type, with fallback for unknown types.
 */
function getDeviceIcon(deviceType: string): string {
  return DEVICE_TYPE_ICONS[deviceType] || DEVICE_TYPE_ICONS.default;
}

/**
 * SensorItem Component - Updated for new sensor schema
 *
 * Displays:
 * - Device icon based on deviceType
 * - sensorLabel (what it measures)
 * - deviceLabel and sensorId for identification
 * - sensorType and unit info
 */
function SensorItemComponent({
  sensor,
  isSelected,
  onToggle,
}: SensorItemProps) {
  const {
    sensorId,
    deviceType,
    deviceLabel,
    sensorLabel,
    sensorType,
    sensorUnit,
  } = sensor;

  const handleToggle = useCallback(() => {
    onToggle(sensorId);
  }, [onToggle, sensorId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        "h-20 flex items-center gap-4 px-4 py-3",
        "border-b border-border/50 last:border-b-0",
        "cursor-pointer transition-colors duration-150",
        "hover:bg-accent/50 focus:outline-none focus:bg-accent/50",
        isSelected && "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleToggle}
        onClick={stopPropagation}
        aria-label={`Select ${sensorLabel}`}
        className="shrink-0"
      />

      {/* Device type icon */}
      <span className="text-xl shrink-0" aria-hidden="true">
        {getDeviceIcon(deviceType)}
      </span>

      {/* Sensor info - primary */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{sensorLabel}</p>
        <p className="text-xs text-muted-foreground truncate">
          {deviceLabel}
        </p>
        <p className="text-xs text-muted-foreground/70 truncate font-mono">
          {sensorId}
        </p>
      </div>

      {/* Device type badge */}
      <div className="shrink-0 hidden sm:block">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
          {deviceType}
        </span>
      </div>

      {/* Sensor type and unit */}
      <div className="text-right shrink-0 min-w-[80px]">
        <p className="text-xs text-muted-foreground truncate">
          {sensorType.replace(/_/g, " ")}
        </p>
        <p className="text-sm font-mono font-medium">
          {sensorUnit}
        </p>
      </div>
    </div>
  );
}

/**
 * Custom comparison for memo optimization.
 */
function areSensorItemPropsEqual(
  prevProps: SensorItemProps,
  nextProps: SensorItemProps
): boolean {
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.sensor !== nextProps.sensor) return false;
  if (prevProps.onToggle !== nextProps.onToggle) return false;
  return true;
}

export const SensorItem = memo(SensorItemComponent, areSensorItemPropsEqual);
