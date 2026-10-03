import { useEffect, useState } from 'react';

/**
 * A number field that lets you type "62." or clear it without fighting you.
 * Commits a number (or null) on every valid keystroke.
 */
export function NumInput({
  value,
  onChange,
  label,
  placeholder,
  decimals = true,
  className,
  max = 9999,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
  placeholder?: string;
  decimals?: boolean;
  className?: string;
  max?: number;
}) {
  const [text, setText] = useState(value == null ? '' : String(value));
  useEffect(() => {
    const parsed = text === '' ? null : Number(text.replace(',', '.'));
    if (parsed !== value) setText(value == null ? '' : String(value));
    // Only react to outside changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      className={className}
      aria-label={label}
      placeholder={placeholder}
      inputMode={decimals ? 'decimal' : 'numeric'}
      value={text}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const raw = e.target.value.replace(',', '.');
        const ok = decimals ? /^\d{0,4}(\.\d{0,2})?$/ : /^\d{0,4}$/;
        if (!ok.test(raw)) return;
        setText(raw);
        if (raw === '' || raw === '.') return onChange(null);
        const n = Number(raw);
        if (Number.isFinite(n) && n <= max) onChange(n);
      }}
    />
  );
}
