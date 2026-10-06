import { useState } from 'react';
import { formatCents, percentOf } from '../lib/money.js';
import { computeSplit } from '../lib/split.js';
import { newId } from '../lib/ids.js';
import FriendsBar from './FriendsBar.jsx';
import ItemList from './ItemList.jsx';
import AssignDrawer from './AssignDrawer.jsx';
import Adjustments from './Adjustments.jsx';
import TotalsCard from './TotalsCard.jsx';

const COLORS = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#db2777', '#4d7c0f'];

export default function Workspace({ receipt }) {
  const [friends, setFriends] = useState([]);
  const [colorCounter, setColorCounter] = useState(0);
  const [items, setItems] = useState(() =>
    receipt.items.map((i) => ({
      id: newId(),
      name: i.name,
      price_cents: i.price_cents,
      modifiers: i.modifiers ?? [],
      assignees: [],
    })),
  );
  const [adjustments, setAdjustments] = useState({
    tax_cents: receipt.tax_cents ?? 0,
    discount_cents: receipt.discount_cents ?? 0,
    fees_cents: receipt.fees_cents ?? 0,
  });
  const [tip, setTip] = useState({ mode: 'amount', cents: receipt.tip_cents ?? 0, basisPoints: 0 });
  const [assigningId, setAssigningId] = useState(null);
  const [showSummaryNote, setShowSummaryNote] = useState(false);

  const itemsSubtotal = items.reduce((sum, i) => sum + i.price_cents, 0);
  const tipCents = tip.mode === 'amount' ? tip.cents : percentOf(itemsSubtotal, tip.basisPoints);
  const result = computeSplit(friends, items, { ...adjustments, tip_cents: tipCents });
  const subtotalDiff = receipt.subtotal_cents == null ? 0 : itemsSubtotal - receipt.subtotal_cents;
  const assigningItem = items.find((i) => i.id === assigningId);

  function addFriend(name) {
    setFriends([...friends, { id: newId(), name, color: COLORS[colorCounter % COLORS.length] }]);
    setColorCounter(colorCounter + 1);
  }

  function removeFriend(id) {
    setFriends(friends.filter((f) => f.id !== id));
    setItems(items.map((i) => ({ ...i, assignees: i.assignees.filter((a) => a !== id) })));
  }

  const updateItem = (id, patch) => setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // Puts everyone on every item. Leftover cents on each item go to the first friend.
  function splitWholeBillEvenly() {
    const alreadyAssigned = items.some((i) => i.assignees.length > 0);
    if (alreadyAssigned && !window.confirm('Replace all current assignments and split every item among everyone?')) {
      return;
    }
    const everyoneIds = friends.map((f) => f.id);
    setItems(items.map((i) => ({ ...i, assignees: everyoneIds })));
  }

  const unassignedCount = result.unassigned.items.length;
  const everyoneOnEverything =
    items.length > 0 && items.every((i) => friends.every((f) => i.assignees.includes(f.id)));

  return (
    <main className="workspace">
      <header className="app-header">
        <h1>Split the bill</h1>
        <span className="tag">Sample receipt</span>
      </header>

      <FriendsBar friends={friends} onAdd={addFriend} onRemove={removeFriend} />

      <section className="card">
        <h2>Items</h2>
        <p className="muted small">Tap a name or price to edit it.</p>
        {friends.length >= 2 && !everyoneOnEverything && (
          <button type="button" className="link-btn" onClick={splitWholeBillEvenly}>
            Split whole bill evenly
          </button>
        )}

        {unassignedCount > 0 && (
          <div className="banner warn">
            {unassignedCount} {unassignedCount === 1 ? 'item' : 'items'} (
            {formatCents(result.unassigned.food_cents)}) not assigned yet.
          </div>
        )}
        {subtotalDiff !== 0 && (
          <div className="banner error">
            Items add up to {formatCents(itemsSubtotal)}, but the receipt subtotal is{' '}
            {formatCents(receipt.subtotal_cents)}: {subtotalDiff > 0 ? 'over' : 'under'} by{' '}
            {formatCents(Math.abs(subtotalDiff))}.
          </div>
        )}

        <ItemList
          items={items}
          friends={friends}
          onChange={updateItem}
          onDelete={(id) => setItems(items.filter((i) => i.id !== id))}
          onAssign={setAssigningId}
          onAdd={(name, price_cents) =>
            setItems([...items, { id: newId(), name, price_cents, modifiers: [], assignees: [] }])
          }
        />
      </section>

      <Adjustments
        adjustments={adjustments}
        onChange={(patch) => setAdjustments({ ...adjustments, ...patch })}
        tip={tip}
        onTipChange={setTip}
        tipCents={tipCents}
        itemsSubtotal={itemsSubtotal}
      />

      <TotalsCard result={result} />

      <button type="button" className="primary wide big" onClick={() => setShowSummaryNote(true)}>
        Generate Summary for Group Chat
      </button>
      {showSummaryNote && (
        <p className="muted small center">The summary screen is the next milestone. Coming soon.</p>
      )}

      {assigningItem && (
        <AssignDrawer
          item={assigningItem}
          friends={friends}
          onChange={(assignees) => updateItem(assigningItem.id, { assignees })}
          onClose={() => setAssigningId(null)}
        />
      )}
    </main>
  );
}
