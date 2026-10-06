import { describe, expect, it } from 'vitest';
import { computeSplit, splitItem } from './split.js';
import { parseDollarsToCents, percentOf, formatCents } from './money.js';

const friends = [
  { id: 'a', name: 'Ana' },
  { id: 'b', name: 'Ben' },
  { id: 'c', name: 'Cy' },
];
const item = (id, price_cents, assignees) => ({ id, name: id, price_cents, modifiers: [], assignees });
const noAdjustments = { tax_cents: 0, tip_cents: 0, fees_cents: 0, discount_cents: 0 };

describe('splitItem', () => {
  it('gives leftover cents to the first person', () => {
    expect(splitItem(650, ['a', 'b', 'c'])).toEqual([
      { id: 'a', cents: 218 },
      { id: 'b', cents: 216 },
      { id: 'c', cents: 216 },
    ]);
  });
});

describe('computeSplit', () => {
  it('splits the sample receipt exactly', () => {
    const items = [
      item('burger', 1600, ['a']),
      item('ipa1', 800, ['a']),
      item('ipa2', 799, ['b']),
      item('salad', 1200, ['b']),
      item('fries', 650, ['c', 'b', 'a']), // order of ticking shouldn't matter
      item('cake', 900, ['c']),
    ];
    const tip = percentOf(5949, 2000); // 20% -> 1190
    const result = computeSplit(friends, items, {
      tax_cents: 477,
      tip_cents: tip,
      fees_cents: 0,
      discount_cents: 500,
    });

    expect(result.people.map((p) => p.food_cents)).toEqual([2618, 2215, 1116]);
    // 1167 of adjustments: floors are 513/434/218, the 2 spare cents go to Ana.
    expect(result.people.map((p) => p.adjustment_cents)).toEqual([515, 434, 218]);
    expect(result.people.map((p) => p.total_cents)).toEqual([3133, 2649, 1334]);
    expect(result.billTotal).toBe(7116);
  });

  it('always adds up to the bill total, including unassigned items', () => {
    const items = [item('x', 1001, ['b']), item('y', 333, []), item('z', 777, ['a', 'c'])];
    const result = computeSplit(friends, items, {
      tax_cents: 187,
      tip_cents: 401,
      fees_cents: 99,
      discount_cents: 250,
    });
    const sum = result.people.reduce((s, p) => s + p.total_cents, 0) + result.unassigned.total_cents;
    expect(sum).toBe(result.billTotal);
    expect(result.unassigned.food_cents).toBe(333);
  });

  it('handles discounts bigger than tax and tip', () => {
    const items = [item('x', 1000, ['a']), item('y', 1001, ['b'])];
    const result = computeSplit(friends, items, { ...noAdjustments, discount_cents: 500 });
    expect(result.people.map((p) => p.total_cents)).toEqual([751, 750, 0]);
  });

  it('ignores assignees who were removed from the friend list', () => {
    const result = computeSplit(friends, [item('x', 500, ['gone', 'b'])], noAdjustments);
    expect(result.people[1].food_cents).toBe(500);
  });
});

describe('money helpers', () => {
  it('parses typed dollars into cents', () => {
    expect(parseDollarsToCents('12.5')).toBe(1250);
    expect(parseDollarsToCents('$1,000')).toBe(100000);
    expect(parseDollarsToCents('.99')).toBe(99);
    expect(parseDollarsToCents('')).toBe(0);
    expect(parseDollarsToCents('1.234')).toBeNull();
    expect(parseDollarsToCents('abc')).toBeNull();
  });

  it('formats cents', () => {
    expect(formatCents(5926)).toBe('$59.26');
    expect(formatCents(-500)).toBe('-$5.00');
    expect(formatCents(7)).toBe('$0.07');
  });
});
