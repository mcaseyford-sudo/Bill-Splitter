// Hard-coded stand-in for what the receipt parser will return.
// All money is integer cents. Shape matches the PARSING RULES in SPEC.md.
//
// What the paper receipt "said":
//   Classic Burger            $14.50
//     + bacon                  $1.50
//     no onions
//   2 x IPA                   $15.99   -> split into $8.00 + $7.99 (extra cent to first copy)
//   Caesar Salad              $12.00
//   Truffle Fries              $6.50
//   Chocolate Cake             $9.00
//   Subtotal                  $59.49
//   Happy Hour discount       -$5.00
//   Tax                        $4.77
//   Total                     $59.26
//   (no tip printed — it would be handwritten)
export const SAMPLE_RECEIPT = {
  items: [
    {
      name: 'Classic Burger',
      price_cents: 1600, // 1450 base + 150 bacon
      modifiers: [
        { name: '+ bacon', price_cents: 150 },
        { name: 'no onions', price_cents: 0 },
      ],
    },
    { name: 'IPA', price_cents: 800, modifiers: [] },
    { name: 'IPA', price_cents: 799, modifiers: [] },
    { name: 'Caesar Salad', price_cents: 1200, modifiers: [] },
    { name: 'Truffle Fries', price_cents: 650, modifiers: [] },
    { name: 'Chocolate Cake', price_cents: 900, modifiers: [] },
  ],
  subtotal_cents: 5949,
  tax_cents: 477,
  tip_cents: null,
  discount_cents: 500,
  fees_cents: null,
  total_cents: 5926,
};
