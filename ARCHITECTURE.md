# Sensor Selection Application - Architecture Documentation

## Overview

This document explains the architectural decisions, UI flow rationale, and scalability considerations for the sensor selection application.

---

## Why This UI Flow Was Chosen

### Progressive Disclosure Pattern

The application uses **progressive disclosure** - a UX pattern that presents information and options incrementally:

1. **Initial State**: Only the location dropdown is visible
2. **After Location Selection**: Sensor list appears with selection controls
3. **With Selection**: Action bar shows live count and enabled confirm button

**Benefits:**
- Reduces cognitive load by not overwhelming users with all options at once
- Guides users through a clear, linear workflow
- Prevents errors (can't select sensors before choosing a location)

### Enterprise-Appropriate Design

The interface follows enterprise UX principles:
- **Clean, neutral color palette** - Professional appearance suitable for operational tools
- **Clear visual hierarchy** - Headers, cards, and sections create scannable layouts
- **Consistent spacing** - 8px grid system for visual rhythm
- **Status indicators** - Sensors show clear active/inactive/error states

### Accessibility Considerations

- ARIA roles and labels on interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Live regions announce selection changes to screen readers
- Sufficient color contrast ratios
- Focus states clearly visible

---

## How the Architecture Scales

### Data Access Layer (`lib/sensors.ts`)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Component     │────▶│  Data Access     │────▶│   JSON/API      │
│   (page.tsx)    │     │  (sensors.ts)    │     │   (data source) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Current**: Functions read from local JSON with simulated delay
**Scalable**: Same interface can switch to real API calls without changing components

### State Management

```typescript
// O(1) selection operations with Set
const [selectedSensorIds, setSelectedSensorIds] = useState<Set<string>>(new Set());

// Efficient add/remove
selectedSensorIds.has(id)     // O(1) check
selectedSensorIds.add(id)     // O(1) add
selectedSensorIds.delete(id)  // O(1) remove
```

**Why Set over Array:**
- Constant-time operations vs linear scan
- Automatic deduplication
- Scales to thousands of selections

### Component Architecture

```
app/
├── page.tsx              # Page-level state orchestration
│
components/sensors/
├── LocationSelect.tsx    # Pure UI, receives data via props
├── SensorList.tsx        # List container with bulk actions
├── SensorItem.tsx        # Memoized individual sensor row
└── ActionBar.tsx         # Sticky footer with confirm action
```

**Separation of concerns:**
- **Page**: Data fetching, state management, business logic
- **Components**: Presentation, user interaction, local UI state

### Virtualization-Ready Structure

`SensorItem` is designed for future virtualization:
- Fixed height (`h-16` = 64px) enables viewport calculations
- Self-contained rendering (no external layout dependencies)
- Memoized to prevent unnecessary re-renders

To add virtualization:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={480}
  itemCount={sensors.length}
  itemSize={64} // matches h-16
>
  {({ index, style }) => (
    <div style={style}>
      <SensorItem sensor={sensors[index]} ... />
    </div>
  )}
</FixedSizeList>
```

---

## What Would Change with a Real API

### 1. Data Access Layer

```typescript
// Current (local JSON)
export async function getSensorsByLocation(locationId: string): Promise<Sensor[]> {
  await simulateNetworkDelay();
  const data = sensorData as SensorData;
  return data.sensorsByLocation[locationId] ?? [];
}

// Production (real API)
export async function getSensorsByLocation(locationId: string): Promise<Sensor[]> {
  const response = await fetch(`/api/locations/${locationId}/sensors`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  return response.json();
}
```

### 2. Error Handling

```typescript
// Add error state to page
const [error, setError] = useState<Error | null>(null);

// Handle API errors
try {
  const data = await getSensorsByLocation(locationId);
  setSensors(data);
} catch (err) {
  setError(err as Error);
  // Show error toast/banner
}
```

### 3. Caching Strategy

For production, add caching via:
- **React Query / SWR**: Automatic caching, background refresh, deduplication
- **Server-side caching**: Redis/Memcached for frequently accessed locations

```typescript
// Example with React Query
const { data: sensors, isLoading } = useQuery({
  queryKey: ['sensors', locationId],
  queryFn: () => getSensorsByLocation(locationId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 4. Pagination/Infinite Scroll

For locations with 1000+ sensors:

```typescript
interface PaginatedResponse {
  sensors: Sensor[];
  nextCursor: string | null;
  total: number;
}

export async function getSensorsByLocation(
  locationId: string,
  cursor?: string
): Promise<PaginatedResponse> {
  const params = new URLSearchParams({ limit: '50' });
  if (cursor) params.set('cursor', cursor);
  
  const response = await fetch(
    `/api/locations/${locationId}/sensors?${params}`
  );
  return response.json();
}
```

### 5. Optimistic Updates

For confirm action:

```typescript
const handleConfirm = async () => {
  // Optimistic UI update
  setIsSubmitting(true);
  
  try {
    await submitSensorSelection({
      locationId: selectedLocationId,
      sensorIds: Array.from(selectedSensorIds),
    });
    
    // Success - navigate or show confirmation
    router.push('/dashboard');
  } catch (error) {
    // Rollback or show error
    setError(error);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Folder Structure

```
schneider/
├── app/
│   ├── globals.css          # Global styles & CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page component
│
├── components/
│   ├── sensors/
│   │   ├── index.ts         # Barrel exports
│   │   ├── ActionBar.tsx    # Sticky footer with confirm
│   │   ├── LocationSelect.tsx # Location dropdown
│   │   ├── SensorItem.tsx   # Individual sensor row (memoized)
│   │   └── SensorList.tsx   # Scrollable sensor list
│   │
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       └── select.tsx
│
├── data/
│   └── sensors.json         # Local sensor data (simulates API)
│
├── lib/
│   ├── sensors.ts           # Data access layer
│   └── utils.ts             # Utility functions (cn, etc.)
│
├── types/
│   └── sensors.ts           # TypeScript interfaces
│
└── ARCHITECTURE.md          # This file
```

---

## Performance Summary

| Aspect | Implementation | Big-O |
|--------|---------------|-------|
| Selection check | `Set.has()` | O(1) |
| Selection add/remove | `Set.add()/delete()` | O(1) |
| Select all | `new Set(sensors.map())` | O(n) |
| Sensor list render | Memoized items | O(changed items) |
| Location lookup | Array find | O(n) - small n |

---

## Testing Considerations (Future)

For production, add:

1. **Unit tests**: Data access functions, utility functions
2. **Component tests**: Render, interaction, accessibility
3. **Integration tests**: Full flow from location select to confirm
4. **E2E tests**: Cypress/Playwright for critical paths

Example test structure:
```
__tests__/
├── lib/
│   └── sensors.test.ts
├── components/
│   ├── LocationSelect.test.tsx
│   ├── SensorItem.test.tsx
│   └── SensorList.test.tsx
└── e2e/
    └── sensor-selection.spec.ts
```
