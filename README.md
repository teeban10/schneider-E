# Sensor Selection Application

A production-quality Next.js application for selecting sensors across data center locations.

## Features

- **Location-based sensor browsing** - Select a data center to view its sensors
- **Bulk selection** - Select individual sensors or all at once
- **Live count** - Real-time display of selected sensor count
- **Optimized for scale** - Handles 10,000+ sensors efficiently
- **Progressive disclosure** - Clean UX that doesn't overwhelm users

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **React state** (no external state management)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd schneider

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

---

## Adding New Sensor Locations

Sensor data is loaded from JSON files in the `data/` directory. Each file represents a data center location.

### Step 1: Create the JSON file

Create a new file in the `data/` directory. The filename becomes the location ID.

```
data/
├── SanDiego.json     # Location: "San Diego"
├── Phoenix.json      # Location: "Phoenix"  (new)
└── NewYork.json      # Location: "New York" (new)
```

### Step 2: Add sensor data

Each JSON file should be an array of sensor objects:

```json
[
  {
    "sensorId": "UNIQUE_SENSOR_ID",
    "deviceType": "Rack PDU",
    "deviceId": "DEVICE_001",
    "deviceLabel": "Pod 1 - Rack A",
    "ipAddress": "192.168.1.100",
    "sensorLabel": "Total Power Output",
    "sensorType": "power_watts",
    "sensorUnit": "W"
  },
  {
    "sensorId": "ANOTHER_SENSOR_ID",
    "deviceType": "CRAC",
    "deviceId": "DEVICE_002",
    "deviceLabel": "Cooling Unit 1",
    "ipAddress": "192.168.1.101",
    "sensorLabel": "Supply Air Temperature",
    "sensorType": "temperature",
    "sensorUnit": "°C"
  }
]
```

### Step 3: Register the location

Open `lib/sensors.ts` and add your location to the `LOCATION_FILES` array:

```typescript
const LOCATION_FILES = [
  "SanDiego",
  "Phoenix",    // Add new locations here
  "NewYork",
] as const;
```

### Sensor Schema Reference

| Field | Type | Description |
|-------|------|-------------|
| `sensorId` | string | Unique identifier for the sensor |
| `deviceType` | string | Device category (e.g., "Rack PDU", "UPS", "CRAC") |
| `deviceId` | string | Parent device identifier |
| `deviceLabel` | string | Human-readable device name |
| `ipAddress` | string | Network address of the device |
| `sensorLabel` | string | What the sensor measures |
| `sensorType` | string | Type classification (e.g., "power_watts", "temperature") |
| `sensorUnit` | string | Unit of measurement (e.g., "W", "°C", "%") |

### Supported Device Types (with icons)

- `Rack PDU` 🔌
- `UPS` 🔋
- `CRAC` ❄️
- `CRAH` 💨
- `Chiller` 🧊
- `Generator` ⚡
- `ATS` 🔀
- `Meter` 📊

---

## Project Structure

```
schneider/
├── app/
│   ├── globals.css       # Global styles & CSS variables
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page component
│
├── components/
│   ├── sensors/          # Sensor-specific components
│   │   ├── ActionBar.tsx
│   │   ├── LocationSelect.tsx
│   │   ├── SensorItem.tsx
│   │   └── SensorList.tsx
│   │
│   └── ui/               # shadcn/ui components
│
├── data/
│   └── SanDiego.json     # Sensor data files
│
├── lib/
│   └── sensors.ts        # Data access layer
│
├── types/
│   └── sensors.ts        # TypeScript interfaces
│
└── ARCHITECTURE.md       # Detailed architecture docs
```

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation on:

- UI flow decisions
- Scalability considerations
- Performance optimizations
- What would change with a real API

---

## Performance Notes

The application is optimized for large datasets:

- **Memoized components** - Prevents unnecessary re-renders
- **Set-based selection** - O(1) add/remove/check operations
- **Stable callbacks** - Uses refs to avoid callback recreation
- **Virtualization-ready** - Fixed-height items for future react-window integration

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
