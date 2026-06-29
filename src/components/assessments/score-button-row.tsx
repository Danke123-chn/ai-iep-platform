"use client";

type ScoreOption<T extends string | number> = {
  value: T;
  label: string;
  color: string;
};

type ScoreButtonRowProps<T extends string | number> = {
  options: readonly ScoreOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function ScoreButtonRow<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
}: ScoreButtonRowProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
              selected
                ? "ring-2 ring-white/30"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{
              backgroundColor: selected ? opt.color : `${opt.color}33`,
              color: selected ? "#18181b" : opt.color,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
