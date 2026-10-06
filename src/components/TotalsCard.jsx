import { formatCents } from '../lib/money.js';
import { Badge } from './FriendsBar.jsx';

function extrasText(cents) {
  return `${cents < 0 ? '−' : '+'} ${formatCents(Math.abs(cents))} tax/tip/etc`;
}

export default function TotalsCard({ result }) {
  const { people, unassigned, billTotal } = result;

  return (
    <section className="card totals">
      <h2>Who owes what</h2>
      {people.length === 0 ? (
        <p className="muted">Add friends to see each person's total.</p>
      ) : (
        <ul className="totals-list">
          {people.map((p) => (
            <li key={p.friend.id}>
              <div>
                <Badge friend={p.friend} />
                <div className="muted small">
                  {formatCents(p.food_cents)} food {extrasText(p.adjustment_cents)}
                </div>
              </div>
              <strong>{formatCents(p.total_cents)}</strong>
            </li>
          ))}
        </ul>
      )}
      {unassigned.items.length > 0 && (
        <div className="totals-row unassigned-row">
          <span>
            Unassigned
            <span className="muted small"> (with its share of tax/tip)</span>
          </span>
          <strong>{formatCents(unassigned.total_cents)}</strong>
        </div>
      )}
      <div className="totals-row bill-total">
        <span>Bill total</span>
        <strong>{formatCents(billTotal)}</strong>
      </div>
    </section>
  );
}
