import { useState } from 'react';
import { centsToInput, parseDollarsToCents } from '../lib/money.js';

// Shows a value as tappable text; tapping swaps in a text box.
// Saves on Enter or when you tap away; Escape cancels.
export function TapToEdit({ value, display, onSave, label, inputMode, className = '' }) {
  const [draft, setDraft] = useState(null); // null means "not editing"

  if (draft === null) {
    return (
      <button
        type="button"
        className={`tap-edit ${className}`}
        onClick={() => setDraft(value)}
        aria-label={`Edit ${label}`}
      >
        {display ?? value}
      </button>
    );
  }

  const finish = (save) => {
    if (save) onSave(draft);
    setDraft(null);
  };

  return (
    <input
      className={`tap-edit-input ${className}`}
      autoFocus
      value={draft}
      inputMode={inputMode}
      aria-label={label}
      onFocus={(e) => e.target.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => finish(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
      }}
    />
  );
}

// A number box that reports cents (or basis points) on every valid keystroke,
// so totals update live. Invalid text is outlined red and ignored.
export function AmountInput({
  value,
  onChange,
  label,
  hideLabel = false,
  prefix = '$',
  suffix,
  parse = parseDollarsToCents,
  format = centsToInput,
}) {
  const [text, setText] = useState(() => (value ? format(value) : ''));
  const invalid = parse(text) === null;

  return (
    <label className="field">
      <span className={hideLabel ? 'sr-only' : 'field-label'}>{label}</span>
      <span className={`amount-box ${invalid ? 'invalid' : ''}`}>
        {prefix && <span className="affix">{prefix}</span>}
        <input
          inputMode="decimal"
          placeholder="0.00"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const parsed = parse(e.target.value);
            if (parsed !== null) onChange(parsed);
          }}
          onBlur={() => setText(value ? format(value) : '')}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </span>
    </label>
  );
}
