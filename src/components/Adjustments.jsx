import { useState } from 'react';
import { centsToInput, formatCents, parsePercentToBasisPoints } from '../lib/money.js';
import { AmountInput } from './fields.jsx';

const QUICK_TIPS = [1500, 1800, 2000, 2200]; // basis points: 15%, 18%, 20%, 22%

export default function Adjustments({ adjustments, onChange, tip, onTipChange, tipCents, itemsSubtotal }) {
  // Bumped when a button changes the tip, so the tip box redraws with the new number.
  const [tipBoxVersion, setTipBoxVersion] = useState(0);
  const setTip = (next) => {
    onTipChange(next);
    setTipBoxVersion((v) => v + 1);
  };

  return (
    <section className="card">
      <h2>Tax, tip &amp; extras</h2>
      <div className="adjust-grid">
        <AmountInput
          label="Tax"
          value={adjustments.tax_cents}
          onChange={(tax_cents) => onChange({ tax_cents })}
        />

        <div className="field">
          <span className="field-label tip-label">
            Tip
            <span className="segmented" role="group" aria-label="Tip type">
              <button
                type="button"
                className={tip.mode === 'amount' ? 'on' : ''}
                onClick={() => setTip({ ...tip, mode: 'amount', cents: tipCents })}
              >
                $
              </button>
              <button
                type="button"
                className={tip.mode === 'percent' ? 'on' : ''}
                onClick={() => setTip({ ...tip, mode: 'percent' })}
              >
                %
              </button>
            </span>
          </span>
          {tip.mode === 'amount' ? (
            <AmountInput
              key={`amount-${tipBoxVersion}`}
              label="Tip amount"
              hideLabel
              value={tip.cents}
              onChange={(cents) => onTipChange({ ...tip, cents })}
            />
          ) : (
            <AmountInput
              key={`percent-${tipBoxVersion}`}
              label="Tip percent"
              hideLabel
              prefix=""
              suffix="%"
              parse={parsePercentToBasisPoints}
              format={(bp) => centsToInput(bp).replace(/\.00$/, '')}
              value={tip.basisPoints}
              onChange={(basisPoints) => onTipChange({ ...tip, basisPoints })}
            />
          )}
          <div className="quick-tips">
            {QUICK_TIPS.map((bp) => (
              <button
                key={bp}
                type="button"
                className={tip.mode === 'percent' && tip.basisPoints === bp ? 'on' : ''}
                onClick={() => setTip({ ...tip, mode: 'percent', basisPoints: bp })}
              >
                {bp / 100}%
              </button>
            ))}
          </div>
          {tip.mode === 'percent' && (
            <p className="muted small">
              = {formatCents(tipCents)} on a {formatCents(itemsSubtotal)} subtotal
            </p>
          )}
        </div>

        <AmountInput
          label="Discounts"
          prefix="−$"
          value={adjustments.discount_cents}
          onChange={(discount_cents) => onChange({ discount_cents })}
        />
        <AmountInput
          label="Other fees"
          value={adjustments.fees_cents}
          onChange={(fees_cents) => onChange({ fees_cents })}
        />
      </div>
    </section>
  );
}
