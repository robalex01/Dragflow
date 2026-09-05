interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PRESETS = ['10m', '30m', '1h', '6h', '1d', '7d'];

export function DurationInput({ value, onChange, placeholder }: DurationInputProps) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-card border border-surface-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900"
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`rounded-card px-2 py-1 text-xs transition ${
              value === p ? 'bg-ink-900 text-white' : 'border border-surface-300 text-neutral-600 hover:bg-surface-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
