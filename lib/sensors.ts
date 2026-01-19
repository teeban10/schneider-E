/**
 * Data Access Layer for Sensor Management
 *
 * This module loads sensor data from JSON files in the data directory.
 * Each JSON file represents a location, with the filename being the location ID.
 *
 * Architecture:
 * - Uses dynamic imports to load JSON files on demand
 * - Simulates network latency for realistic UX testing
 * - Location list is derived from available JSON files
 */

import type { Location, Sensor } from "@/types/sensors";

// Simulated network delay range (ms)
const MIN_DELAY = 200;
const MAX_DELAY = 600;

/**
 * Simulates network latency with randomized delay.
 */
function simulateNetworkDelay(): Promise<void> {
  const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Converts a filename/ID to a display name.
 * Handles camelCase, PascalCase, and underscore separation.
 * Examples:
 * - "SanDiego" -> "San Diego"
 * - "NewYork" -> "New York"
 * - "san_diego" -> "San Diego"
 */
function formatLocationName(id: string): string {
  return id
    // Insert space before capital letters (for PascalCase)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Replace underscores with spaces
    .replace(/_/g, " ")
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Available location files configuration.
 * 
 * In a real application, this would be:
 * - An API endpoint that returns available locations
 * - A server-side directory scan
 * - A manifest file listing available data files
 * 
 * For this demo, we statically list the known data files.
 * To add more locations, add the JSON file and update this array.
 */
const LOCATION_FILES = ["SanDiego"] as const;

/**
 * Cache for loaded sensor data to avoid re-importing.
 * In production, consider TTL-based cache invalidation.
 */
const sensorCache = new Map<string, Sensor[]>();

/**
 * Fetches all available data center locations.
 * Derives location metadata from the available JSON files.
 *
 * @returns Promise<Location[]> - Array of available locations
 */
export async function getLocations(): Promise<Location[]> {
  await simulateNetworkDelay();

  const locations: Location[] = [];

  for (const fileId of LOCATION_FILES) {
    try {
      // Dynamically import the JSON file to get sensor count
      const data = await import(`@/data/${fileId}.json`);
      const sensors = data.default as Sensor[];

      locations.push({
        id: fileId,
        name: formatLocationName(fileId),
        sensorCount: sensors.length,
      });

      // Cache the data since we already loaded it
      sensorCache.set(fileId, sensors);
    } catch (error) {
      console.error(`Failed to load location file: ${fileId}.json`, error);
      // Continue loading other locations even if one fails
    }
  }

  return locations;
}

/**
 * Fetches sensors for a specific data center location.
 * Loads from the corresponding JSON file (e.g., "SanDiego" -> "SanDiego.json").
 *
 * @param locationId - The location ID (filename without extension)
 * @returns Promise<Sensor[]> - Array of sensors at the specified location
 */
export async function getSensorsByLocation(
  locationId: string
): Promise<Sensor[]> {
  await simulateNetworkDelay();

  // Check cache first
  if (sensorCache.has(locationId)) {
    return sensorCache.get(locationId)!;
  }

  try {
    // Dynamically import the JSON file
    const data = await import(`@/data/${locationId}.json`);
    const sensors = data.default as Sensor[];

    // Cache for future requests
    sensorCache.set(locationId, sensors);

    return sensors;
  } catch (error) {
    console.error(`Failed to load sensors for location: ${locationId}`, error);
    return [];
  }
}

/**
 * Utility function to get location name by ID.
 */
export function getLocationName(locationId: string): string {
  return formatLocationName(locationId);
}
