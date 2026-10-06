// Split math from SPEC.md. Everything is integer cents.

// Divide one item's price evenly. `assigneeIds` must already be in
// friend-list order; leftover cents go to the first (earliest-added) person.
export function splitItem(priceCents, assigneeIds) {
  const count = assigneeIds.length;
  const base = Math.floor(priceCents / count);
  const leftover = priceCents - base * count;
  return assigneeIds.map((id, i) => ({ id, cents: base + (i === 0 ? leftover : 0) }));
}

/**
 * friends:     [{ id, name, color }] in the order they were added
 * items:       [{ id, name, price_cents, modifiers, assignees: [friendId] }]
 * adjustments: { tax_cents, tip_cents, fees_cents, discount_cents } (resolved numbers)
 *
 * Returns per-person totals plus an `unassigned` bucket. Per-person totals plus
 * the unassigned total always add up exactly to billTotal.
 */
export function computeSplit(friends, items, adjustments) {
  const position = new Map(friends.map((f, i) => [f.id, i]));
  const emptyBucket = () => ({ items: [], food_cents: 0, adjustment_cents: 0, total_cents: 0 });
  const people = friends.map((friend) => ({ friend, ...emptyBucket() }));
  const unassigned = emptyBucket();

  let itemsSubtotal = 0;
  for (const item of items) {
    itemsSubtotal += item.price_cents;
    const ids = item.assignees
      .filter((id) => position.has(id))
      .sort((a, b) => position.get(a) - position.get(b));

    if (ids.length === 0) {
      unassigned.items.push(item);
      unassigned.food_cents += item.price_cents;
      continue;
    }
    for (const { id, cents } of splitItem(item.price_cents, ids)) {
      const person = people[position.get(id)];
      person.items.push({ item, share_cents: cents, split_count: ids.length });
      person.food_cents += cents;
    }
  }

  // Tax + tip + fees - discounts, shared in proportion to food subtotals.
  // Unassigned items carry their proportional share too, so nothing is lost.
  const { tax_cents, tip_cents, fees_cents, discount_cents } = adjustments;
  const adjustmentTotal = tax_cents + tip_cents + fees_cents - discount_cents;
  const buckets = [...people, unassigned];

  if (itemsSubtotal > 0) {
    for (const bucket of buckets) {
      bucket.adjustment_cents = Math.floor((adjustmentTotal * bucket.food_cents) / itemsSubtotal);
    }
  }
  // Rounding down leaves a few cents over; they go to the first friend.
  const allocated = buckets.reduce((sum, b) => sum + b.adjustment_cents, 0);
  (people[0] ?? unassigned).adjustment_cents += adjustmentTotal - allocated;

  for (const bucket of buckets) {
    bucket.total_cents = bucket.food_cents + bucket.adjustment_cents;
  }

  return {
    people,
    unassigned,
    itemsSubtotal,
    adjustmentTotal,
    billTotal: itemsSubtotal + adjustmentTotal,
  };
}
