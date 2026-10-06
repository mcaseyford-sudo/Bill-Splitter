import { useState } from 'react';
import { centsToInput, formatCents, parseDollarsToCents } from '../lib/money.js';
import { TapToEdit } from './fields.jsx';
import { Badge } from './FriendsBar.jsx';

function ItemRow({ item, assignedFriends, friendCount, onChange, onDelete, onAssign, onSplitEvenly }) {
  const unassigned = assignedFriends.length === 0;
  const canSplitEvenly = friendCount >= 2 && assignedFriends.length < friendCount;

  return (
    <li className={`item ${unassigned ? 'item-unassigned' : ''}`}>
      <TapToEdit
        className="item-price"
        label={`price of ${item.name}`}
        inputMode="decimal"
        value={centsToInput(item.price_cents)}
        display={formatCents(item.price_cents)}
        onSave={(text) => {
          const cents = parseDollarsToCents(text);
          if (cents !== null) onChange({ price_cents: cents });
        }}
      />
      <div className="item-main">
        <TapToEdit
          className="item-name"
          label="item name"
          value={item.name}
          onSave={(text) => text.trim() && onChange({ name: text.trim() })}
        />
        {item.modifiers.length > 0 && (
          <div className="item-mods">{item.modifiers.map((m) => m.name).join(', ')}</div>
        )}
        {canSplitEvenly && (
          <button type="button" className="link-btn split-evenly-btn" onClick={onSplitEvenly}>
            Split evenly
          </button>
        )}
      </div>
      <button type="button" className="assign-btn" onClick={onAssign}>
        {unassigned
          ? 'Assign'
          : assignedFriends.map((f) => <Badge key={f.id} friend={f} small />)}
      </button>
      <button type="button" className="icon-btn" onClick={onDelete} aria-label={`Delete ${item.name}`}>
        ×
      </button>
    </li>
  );
}

function AddItemForm({ onAdd }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const cents = parseDollarsToCents(price);
    if (!name.trim()) return setError('Give the item a name.');
    if (cents === null || price.trim() === '') return setError('Enter a price like 12.50');
    onAdd(name.trim(), cents);
    setName('');
    setPrice('');
    setError('');
  }

  return (
    <>
      <form className="inline-form add-item" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item" aria-label="New item name" />
        <input
          className="price-input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="$0.00"
          inputMode="decimal"
          aria-label="New item price"
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="field-error">{error}</p>}
    </>
  );
}

export default function ItemList({ items, friends, onChange, onDelete, onAssign, onAdd }) {
  const everyoneIds = friends.map((f) => f.id);
  return (
    <>
      <ul className="item-list">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            assignedFriends={friends.filter((f) => item.assignees.includes(f.id))}
            friendCount={friends.length}
            onChange={(patch) => onChange(item.id, patch)}
            onDelete={() => onDelete(item.id)}
            onAssign={() => onAssign(item.id)}
            onSplitEvenly={() => onChange(item.id, { assignees: everyoneIds })}
          />
        ))}
      </ul>
      {items.length === 0 && <p className="muted">No items. Add one below.</p>}
      <AddItemForm onAdd={onAdd} />
    </>
  );
}
