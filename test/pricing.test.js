import test from 'node:test';
import assert from 'node:assert';
import pricing from '../lib/pricing.js';
import tax from '../lib/tax.js';
import invoice from '../lib/invoice.js';

// Helper to round to 2 decimals (same as pricing.round2)
function round2(n) {
  return Math.round((Number(n) + 1e-9) * 100) / 100;
}

// ---------------------------------------------------------------
// Test 1: Basic totals without any coupon
// ---------------------------------------------------------------
test('Pricing.computeTotals – basic calculation without coupon', () => {
  const items = [
    { id: 1, name: 'Rice', price: 100, qty: 2, hsn: '1006' }, // 5% GST
    { id: 2, name: 'Ghee', price: 200, qty: 1, hsn: '0405' }, // 12% GST
  ];

  const totals = pricing.computeTotals(items, '');

  const expectedSubtotal = round2(100 * 2 + 200 * 1);
  assert.strictEqual(totals.subtotal, expectedSubtotal, 'subtotal matches');
  assert.strictEqual(totals.discount, 0, 'no discount');
  assert.strictEqual(totals.taxable, expectedSubtotal, 'taxable equals subtotal');

  const rateRice = tax.getRateForItem(items[0]); // 0.05
  const rateGhee = tax.getRateForItem(items[1]); // 0.12
  const lineTaxRice = round2(round2(100 * 2) * rateRice);
  const lineTaxGhee = round2(round2(200 * 1) * rateGhee);
  const expectedTotalTax = round2(lineTaxRice + lineTaxGhee);
  assert.strictEqual(totals.tax, expectedTotalTax, 'total tax matches summed line tax');
  assert.strictEqual(totals.total, round2(totals.taxable + totals.tax), 'total matches taxable + tax');
});

// ---------------------------------------------------------------
// Test 2: CURRENT BEHAVIOUR – discount rounding can create mismatch
// ---------------------------------------------------------------
// This reproduces a scenario where the overall discount amount does not equal the sum of per‑line discounts
test('CURRENT BEHAVIOUR: per‑line discount rounding mismatch', () => {
  // Two cheap items totalling 0.04, we want a discount of 0.03 (75% of subtotal)
  const items = [
    { id: 1, name: 'CheapA', price: 0.02, qty: 1, hsn: '1006' },
    { id: 2, name: 'CheapB', price: 0.02, qty: 1, hsn: '1006' },
  ];

  const subtotal = pricing.subtotal(items); // 0.04
  const manualDiscount = 0.03; // 75% of subtotal
  const discountRatio = subtotal > 0 ? manualDiscount / subtotal : 0;

  const lineDiscounts = items.map(it => round2(round2(it.price * it.qty) * discountRatio));
  const summedLineDiscounts = round2(lineDiscounts.reduce((a, b) => a + b, 0));

  // Because of rounding, the summed per‑line discounts (0.04) differ from the intended discount (0.03)
  assert.notStrictEqual(summedLineDiscounts, manualDiscount, 'Rounded line discounts do NOT equal the original discount (CURRENT BEHAVIOUR)');
});

// ---------------------------------------------------------------
// Test 3: Invoice.render – HTML contains the total amount
// ---------------------------------------------------------------
test('Invoice.render – HTML contains total amount', () => {
  const order = {
    id: 123,
    customer: 'Test Customer',
    items: [
      { id: 1, name: 'Rice', price: 100, qty: 2, hsn: '1006' },
    ],
    subtotal: 200,
    discount: 0,
    taxable: 200,
    tax: 10,
    total: 210,
  };

  const html = invoice.render(order);
  assert.ok(html.includes('210'), 'Rendered invoice contains the total amount');
});
