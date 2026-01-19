"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  selectedCount: number;
  totalCount: number;
  onConfirm: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
}

/**
 * ActionBar Component
 *
 * OPTIMIZATION: Wrapped in React.memo.
 * Only re-renders when:
 * - selectedCount changes (number comparison)
 * - totalCount changes (number comparison)
 * - onConfirm changes (should be stable via ref pattern in parent)
 * - confirmLabel changes (string comparison)
 * - isLoading changes (boolean comparison)
 *
 * Since parent now uses refs for callbacks, onConfirm is stable and
 * this component only re-renders when counts change.
 */
function ActionBarComponent({
  selectedCount,
  totalCount,
  onConfirm,
  confirmLabel = "Confirm Selection",
  isLoading = false,
}: ActionBarProps) {
  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0",
        "border-t border-border bg-background/95 backdrop-blur-sm",
        "px-6 py-4",
        "flex items-center justify-between gap-4",
        "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      )}
    >
      <div
        className="flex items-center gap-3"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className={cn(
            "flex items-center justify-center",
            "size-10 rounded-full",
            "text-sm font-semibold",
            "transition-colors duration-200",
            hasSelection
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {selectedCount}
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {hasSelection
              ? isAllSelected
                ? "All sensors selected"
                : `${selectedCount} sensor${selectedCount !== 1 ? "s" : ""} selected`
              : "No sensors selected"}
          </span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalCount} total in this location
            </span>
          )}
        </div>
      </div>

      <Button
        onClick={onConfirm}
        disabled={!hasSelection || isLoading}
        size="lg"
        className="min-w-[160px]"
      >
        {isLoading ? (
          <>
            <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Processing...
          </>
        ) : (
          confirmLabel
        )}
      </Button>
    </div>
  );
}

export const ActionBar = memo(ActionBarComponent);
