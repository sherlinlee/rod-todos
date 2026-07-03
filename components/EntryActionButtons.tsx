import type { MouseEvent } from "react";

type EntryActionButtonsProps = {
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  className?: string;
};

const actionClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-foreground/75 transition active:scale-95 active:bg-accent-soft/40 dark:text-foreground/90 sm:opacity-80 sm:hover:bg-accent-soft/30";

function guardFocus(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export default function EntryActionButtons({
  onEdit,
  onCopy,
  onDelete,
  className = "",
}: EntryActionButtonsProps) {
  return (
    <div className={`flex shrink-0 items-center gap-0.5 ${className}`}>
      {onEdit && (
        <button
          type="button"
          onMouseDown={guardFocus}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          aria-label="Edit"
          className={actionClass}
        >
          ✏️
        </button>
      )}
      {onCopy && (
        <button
          type="button"
          onMouseDown={guardFocus}
          onClick={(event) => {
            event.stopPropagation();
            onCopy();
          }}
          aria-label="Copy"
          className={actionClass}
        >
          📋
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onMouseDown={guardFocus}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="Delete"
          className={actionClass}
        >
          🗑️
        </button>
      )}
    </div>
  );
}
