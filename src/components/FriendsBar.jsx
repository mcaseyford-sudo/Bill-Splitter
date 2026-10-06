import { useState } from 'react';

export function Badge({ friend, small = false, onRemove }) {
  return (
    <span className={`badge ${small ? 'badge-small' : ''}`} style={{ background: friend.color }}>
      {small ? initials(friend.name) : friend.name}
      {onRemove && (
        <button
          type="button"
          className="badge-remove"
          onClick={onRemove}
          aria-label={`Remove ${friend.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
}

export default function FriendsBar({ friends, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (friends.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`${trimmed} is already on the list.`);
      return;
    }
    onAdd(trimmed);
    setName('');
    setError('');
  }

  return (
    <section className="card">
      <h2>Friends</h2>
      <form className="inline-form" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friend's name"
          aria-label="Friend's name"
          autoCapitalize="words"
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {error && <p className="field-error">{error}</p>}
      {friends.length > 0 ? (
        <div className="badge-list">
          {friends.map((f) => (
            <Badge key={f.id} friend={f} onRemove={() => onRemove(f.id)} />
          ))}
        </div>
      ) : (
        <p className="muted">Add everyone at the table, then assign items below.</p>
      )}
    </section>
  );
}
