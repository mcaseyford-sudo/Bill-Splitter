import { useEffect } from 'react';
import { formatCents } from '../lib/money.js';
import { Badge } from './FriendsBar.jsx';

function splitPreview(item, chosen) {
  if (chosen.length === 0) return 'Nobody selected yet.';
  if (chosen.length === 1) return `${chosen[0].name} pays the full ${formatCents(item.price_cents)}.`;
  const each = Math.floor(item.price_cents / chosen.length);
  const extra = item.price_cents - each * chosen.length;
  const extraNote = extra ? ` (+${extra}¢ to ${chosen[0].name})` : '';
  return `Split ${chosen.length} ways: ${formatCents(each)} each${extraNote}.`;
}

export default function AssignDrawer({ item, friends, onChange, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const chosen = friends.filter((f) => item.assignees.includes(f.id));
  const everyone = friends.length > 0 && chosen.length === friends.length;

  function toggle(id) {
    const ids = item.assignees.includes(id)
      ? item.assignees.filter((x) => x !== id)
      : [...item.assignees, id];
    onChange(ids);
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Assign ${item.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-handle" />
        <h2 className="drawer-title">
          <span>{item.name}</span>
          <span>{formatCents(item.price_cents)}</span>
        </h2>

        {friends.length === 0 ? (
          <p className="muted">Add friends at the top of the page first.</p>
        ) : (
          <>
            <ul className="check-list">
              {friends.map((f) => (
                <li key={f.id}>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={item.assignees.includes(f.id)}
                      onChange={() => toggle(f.id)}
                    />
                    <Badge friend={f} />
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="link-btn"
              onClick={() => onChange(everyone ? [] : friends.map((f) => f.id))}
            >
              {everyone ? 'Clear all' : 'Select everyone'}
            </button>
            <p className="split-preview">{splitPreview(item, chosen)}</p>
          </>
        )}

        <button type="button" className="primary wide" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
