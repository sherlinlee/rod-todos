"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { hapticSelection } from "@/lib/haptics";
import {
  WHEEL_HOURS,
  WHEEL_MINUTES,
  WHEEL_PERIODS,
  buildTimeWheelValue,
  timeWheelFrom24,
  type TimeWheelValue,
  type WheelHour,
  type WheelMinute,
  type WheelPeriod,
} from "@/lib/time-wheel";

export const WHEEL_ITEM_HEIGHT = 32;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_LOOP_REPEATS = 41;
const SETTLE_DEBOUNCE_MS = 140;

type WheelColumnProps<T extends string | number> = {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  formatItem: (item: T) => string;
  ariaLabel: string;
  loop?: boolean;
  disabled?: boolean;
  registerCommit?: (commit: () => T) => () => void;
};

function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
  formatItem,
  ariaLabel,
  loop = true,
  disabled = false,
  registerCommit,
}: WheelColumnProps<T>) {
  const listId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmitted = useRef(value);
  const internalValueChange = useRef(false);
  const isSettling = useRef(false);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const valueIndex = items.indexOf(value);
  const safeIndex = valueIndex >= 0 ? valueIndex : 0;
  const [focusedIndex, setFocusedIndex] = useState(safeIndex);

  const extendedItems = loop
    ? Array.from({ length: WHEEL_LOOP_REPEATS }, () => items).flat()
    : [...items];

  const centerRepeat = Math.floor(WHEEL_LOOP_REPEATS / 2);

  const scrollToIndex = useCallback((index: number, smooth: boolean) => {
    const el = scrollRef.current;
    if (!el) return;

    const top = index * WHEEL_ITEM_HEIGHT;
    if (smooth) {
      el.scrollTo({ top, behavior: "smooth" });
      return;
    }
    el.scrollTop = top;
  }, []);

  const indexForValue = useCallback(
    (target: T, repeat = loop ? centerRepeat : 0) => {
      const idx = items.indexOf(target);
      const base = idx >= 0 ? idx : 0;
      return loop ? repeat * items.length + base : base;
    },
    [centerRepeat, items, loop],
  );

  const readValueFromScroll = useCallback((): T => {
    const el = scrollRef.current;
    if (!el || items.length === 0) {
      return lastEmitted.current;
    }

    const rawIndex = Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT);
    const itemIndex = loop
      ? ((rawIndex % items.length) + items.length) % items.length
      : Math.min(Math.max(rawIndex, 0), items.length - 1);

    return items[itemIndex] ?? lastEmitted.current;
  }, [items, loop]);

  const commitValue = useCallback(
    (nextValue: T, emit: boolean) => {
      const el = scrollRef.current;
      const centeredIndex = loop ? indexForValue(nextValue) : items.indexOf(nextValue);
      const targetTop = centeredIndex * WHEEL_ITEM_HEIGHT;

      if (el && Math.abs(el.scrollTop - targetTop) > 1) {
        el.scrollTop = targetTop;
      }

      const itemIndex = items.indexOf(nextValue);
      if (itemIndex >= 0) {
        setFocusedIndex(itemIndex);
      }

      const changed = nextValue !== lastEmitted.current;
      lastEmitted.current = nextValue;

      if (emit) {
        internalValueChange.current = true;
        onChangeRef.current(nextValue);
        if (changed) {
          hapticSelection();
        }
      }

      return nextValue;
    },
    [indexForValue, items, loop],
  );

  const settleScroll = useCallback(() => {
    if (items.length === 0 || isSettling.current) return;

    isSettling.current = true;
    const nextValue = readValueFromScroll();
    commitValue(nextValue, true);

    requestAnimationFrame(() => {
      isSettling.current = false;
    });
  }, [commitValue, items.length, readValueFromScroll]);

  const commit = useCallback(() => {
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = null;
    }
    const nextValue = readValueFromScroll();
    return commitValue(nextValue, true);
  }, [commitValue, readValueFromScroll]);

  useLayoutEffect(() => {
    lastEmitted.current = value;
    const idx = items.indexOf(value);
    if (idx >= 0) setFocusedIndex(idx);

    if (internalValueChange.current) {
      internalValueChange.current = false;
      return;
    }

    scrollToIndex(indexForValue(value), false);
  }, [indexForValue, items, scrollToIndex, value]);

  useEffect(() => {
    if (!registerCommit) return;
    return registerCommit(commit);
  }, [commit, registerCommit]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onScrollEnd() {
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
        scrollEndTimer.current = null;
      }
      settleScroll();
    }

    el.addEventListener("scrollend", onScrollEnd);
    return () => {
      el.removeEventListener("scrollend", onScrollEnd);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [settleScroll]);

  function handleScroll() {
    if (disabled || isSettling.current) return;

    const el = scrollRef.current;
    if (el && items.length > 0) {
      const rawIndex = Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT);
      const itemIndex = loop
        ? ((rawIndex % items.length) + items.length) % items.length
        : Math.min(Math.max(rawIndex, 0), items.length - 1);
      setFocusedIndex(itemIndex);
    }

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      scrollEndTimer.current = null;
      settleScroll();
    }, SETTLE_DEBOUNCE_MS);
  }

  function moveBy(delta: number) {
    if (disabled || items.length === 0) return;
    const currentIndex = items.indexOf(lastEmitted.current);
    const base = currentIndex >= 0 ? currentIndex : safeIndex;
    const nextIndex = loop
      ? (base + delta + items.length) % items.length
      : Math.min(Math.max(base + delta, 0), items.length - 1);
    const nextValue = items[nextIndex];
    if (nextValue === undefined) return;
    commitValue(nextValue, true);
    scrollToIndex(indexForValue(nextValue), true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      moveBy(1);
    }
  }

  const padRows = Math.floor(WHEEL_VISIBLE_ROWS / 2);
  const scrollHeight = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

  return (
    <div className="wheel-column relative min-w-0 flex-1">
      <div
        ref={scrollRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className="wheel-column-scroll overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        style={{ height: scrollHeight }}
      >
        {!loop && (
          <div aria-hidden style={{ height: padRows * WHEEL_ITEM_HEIGHT }} />
        )}
        {extendedItems.map((item, index) => {
          const itemIndex = loop ? index % items.length : index;
          const selected = itemIndex === focusedIndex;
          return (
            <div
              key={`${String(item)}-${index}`}
              role="option"
              aria-selected={selected}
              className={`wheel-column-item flex items-center justify-center px-0.5 text-[17px] leading-none ${
                selected
                  ? "font-semibold text-foreground opacity-100"
                  : "font-normal text-foreground/35"
              }`}
              style={{ height: WHEEL_ITEM_HEIGHT }}
            >
              {formatItem(item)}
            </div>
          );
        })}
        {!loop && (
          <div aria-hidden style={{ height: padRows * WHEEL_ITEM_HEIGHT }} />
        )}
      </div>
    </div>
  );
}

export type TimeWheelPickerHandle = {
  flush: () => TimeWheelValue;
};

export type TimeWheelPickerProps = {
  value?: string | null;
  onChange?: (value: TimeWheelValue) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const TimeWheelPicker = forwardRef<TimeWheelPickerHandle, TimeWheelPickerProps>(
  function TimeWheelPicker(
    {
      value,
      onChange,
      disabled = false,
      className = "",
      "aria-label": ariaLabel = "Select time",
    },
    ref,
  ) {
    const propSelection = timeWheelFrom24(value ?? null);
    const [selection, setSelection] = useState(propSelection);
    const selectionRef = useRef(propSelection);
    const lastOwnEmit = useRef<string | null>(null);
    const onChangeRef = useRef(onChange);

    const commitHour = useRef<() => WheelHour>(() => selectionRef.current.hour12);
    const commitMinute = useRef<() => WheelMinute>(() => selectionRef.current.minute);
    const commitPeriod = useRef<() => WheelPeriod>(() => selectionRef.current.period);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      const incoming = value ?? null;
      if (incoming === lastOwnEmit.current) return;

      const next = timeWheelFrom24(incoming);
      selectionRef.current = next;
      setSelection(next);
    }, [value]);

    const emitSelection = useCallback(
      (hour12: WheelHour, minute: WheelMinute, period: WheelPeriod) => {
        const next = buildTimeWheelValue(hour12, minute, period);
        selectionRef.current = next;
        setSelection(next);
        lastOwnEmit.current = next.time24;
        onChangeRef.current?.(next);
        return next;
      },
      [],
    );

    const patchSelection = useCallback(
      (patch: Partial<Pick<TimeWheelValue, "hour12" | "minute" | "period">>) => {
        const current = selectionRef.current;
        return emitSelection(
          patch.hour12 ?? current.hour12,
          patch.minute ?? current.minute,
          patch.period ?? current.period,
        );
      },
      [emitSelection],
    );

    const flush = useCallback(() => {
      const hour12 = commitHour.current();
      const minute = commitMinute.current();
      const period = commitPeriod.current();
      return emitSelection(hour12, minute, period);
    }, [emitSelection]);

    useImperativeHandle(ref, () => ({ flush }), [flush]);

    const registerHourCommit = useCallback((commit: () => WheelHour) => {
      commitHour.current = commit;
      return () => {
        commitHour.current = () => selectionRef.current.hour12;
      };
    }, []);

    const registerMinuteCommit = useCallback((commit: () => WheelMinute) => {
      commitMinute.current = commit;
      return () => {
        commitMinute.current = () => selectionRef.current.minute;
      };
    }, []);

    const registerPeriodCommit = useCallback((commit: () => WheelPeriod) => {
      commitPeriod.current = commit;
      return () => {
        commitPeriod.current = () => selectionRef.current.period;
      };
    }, []);

    return (
      <div
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={`time-wheel-picker relative overflow-hidden rounded-xl border border-accent-soft/25 bg-card/90 ${className}`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-8 -translate-y-1/2 rounded-lg border border-accent-soft/20 bg-accent-soft/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_bottom,var(--card)_0%,transparent_30%,transparent_70%,var(--card)_100%)] opacity-95"
        />

        <div className="relative z-0 flex items-stretch px-0.5 py-0.5">
          <WheelColumn
            items={WHEEL_HOURS}
            value={selection.hour12}
            onChange={(hour12) => {
              patchSelection({ hour12 });
            }}
            formatItem={(hour) => String(hour)}
            ariaLabel="Hour"
            loop
            disabled={disabled}
            registerCommit={registerHourCommit}
          />

          <div
            aria-hidden
            className="flex w-2 shrink-0 items-center justify-center text-[17px] font-semibold text-foreground/70"
          >
            :
          </div>

          <WheelColumn
            items={WHEEL_MINUTES}
            value={selection.minute}
            onChange={(minute) => {
              patchSelection({ minute });
            }}
            formatItem={(minute) => String(minute).padStart(2, "0")}
            ariaLabel="Minute"
            loop
            disabled={disabled}
            registerCommit={registerMinuteCommit}
          />

          <WheelColumn
            items={WHEEL_PERIODS}
            value={selection.period}
            onChange={(period) => {
              patchSelection({ period });
            }}
            formatItem={(period) => period}
            ariaLabel="AM or PM"
            loop={false}
            disabled={disabled}
            registerCommit={registerPeriodCommit}
          />
        </div>

        <p className="px-3 pb-2 text-center text-xs font-semibold text-accent">
          {selection.label12}
        </p>
      </div>
    );
  },
);

export default TimeWheelPicker;
export type { TimeWheelValue };
