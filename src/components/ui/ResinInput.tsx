"use client";

interface ResinInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  ariaLabel: string;
  id?: string;
}

// Words written into core-sample resin, suspended in a glass tube. Not a
// textarea look: no boxy chrome, just a resin-filled well with an engraved edge.
export function ResinInput({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 5,
  maxLength,
  ariaLabel,
  id,
}: ResinInputProps) {
  const shared =
    "w-full bg-transparent resin rounded-sm px-4 py-3 text-bone font-mark text-sm leading-relaxed placeholder:text-[rgba(140,138,130,0.6)] focus:outline-none";
  if (multiline) {
    return (
      <textarea
        id={id}
        aria-label={ariaLabel}
        className={`${shared} resize-none thin-scroll`}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      id={id}
      aria-label={ariaLabel}
      className={shared}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
