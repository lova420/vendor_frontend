"use client";

interface ChipSelectProps<T extends string> {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  ariaLabel?: string;
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: ChipSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          className="chip"
          data-selected={value === opt}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
