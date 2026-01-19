/**
 * Core TypeScript interfaces for the sensor selection application.
 * Updated to match actual JSON data structure from location files.
 */

/**
 * Represents a single sensor device at a data center.
 * Structure matches the actual JSON format from location files.
 */
export interface Sensor {
  sensorId: string;
  deviceType: string;
  deviceId: string;
  deviceLabel: string;
  ipAddress: string;
  sensorLabel: string;
  sensorType: string;
  sensorUnit: string;
}

/**
 * Represents a data center location.
 * Derived from JSON filenames in the data directory.
 */
export interface Location {
  id: string;        // Filename without extension (e.g., "SanDiego")
  name: string;      // Display name with spaces (e.g., "San Diego")
  sensorCount: number;
}

/**
 * API response wrapper for consistent async data handling.
 */
export interface ApiResponse<T> {
  data: T;
  timestamp: number;
}
