"use client";

import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Location } from "@/types/sensors";

interface LocationSelectProps {
  locations: Location[];
  selectedLocation: string | null;
  onLocationChange: (locationId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * LocationSelect Component
 *
 * OPTIMIZATION: Wrapped in React.memo.
 * Only re-renders when:
 * - locations array reference changes
 * - selectedLocation string changes
 * - onLocationChange reference changes (stable from parent)
 * - isLoading/disabled booleans change
 *
 * This component is relatively cheap to render, but memoizing it
 * prevents unnecessary re-renders when sensor selection changes.
 */
function LocationSelectComponent({
  locations,
  selectedLocation,
  onLocationChange,
  isLoading = false,
  disabled = false,
}: LocationSelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="location-select"
        className="text-sm font-medium text-foreground"
      >
        Data Center Location
      </label>
      <Select
        value={selectedLocation ?? undefined}
        onValueChange={onLocationChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          id="location-select"
          className="w-full sm:w-[320px]"
          aria-label="Select a data center location"
        >
          <SelectValue
            placeholder={
              isLoading ? "Loading locations..." : "Select a location"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{location.name}</span>
                <span className="text-xs text-muted-foreground">
                  {location.region && `${location.region} · `}
                  {location.sensorCount} sensors
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const LocationSelect = memo(LocationSelectComponent);
