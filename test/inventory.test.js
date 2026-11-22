var test = require('node:test');
var assert = require('node:assert');
var inventory = require('../lib/inventory');

// ---------------------------------------------------------------
// Characterization: pin what check() does TODAY
// ---------------------------------------------------------------

test('inventory.check – passes when qty is less than sellable', function () {
  var products = [
    { id: 1, name: 'Ghee', stock: 5, reserved: 0, price: 200 }
  ];
  var result = inventory.check(products, [{ id: 1, qty: 4 }]);
  assert.strictEqual(result.ok, true);
});

test('inventory.check – rejects unknown product', function () {
  var products = [
    { id: 1, name: 'Ghee', stock: 5, reserved: 0, price: 200 }
  ];
  var result = inventory.check(products, [{ id: 999, qty: 1 }]);
  assert.strictEqual(result.ok, false);
});

// ---------------------------------------------------------------
// CURRENT BEHAVIOUR: check() uses >= so buying the last unit fails
// ---------------------------------------------------------------
test('CURRENT BEHAVIOUR: check() rejects qty equal to sellable stock', function () {
  var products = [
    { id: 1, name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0, price: 200 }
  ];
  // 1 sellable, requesting 1 — should succeed but currently fails
  var result = inventory.check(products, [{ id: 1, qty: 1 }]);
  assert.strictEqual(result.ok, false, 'qty == sellable is rejected (bug: >= instead of >)');
});

test('CURRENT BEHAVIOUR: check() rejects exact sellable with reserved stock', function () {
  var products = [
    { id: 2, name: 'Byadgi Kashmiri Chilli Powder 500g', stock: 4, reserved: 3, price: 150 }
  ];
  // sellable = 4 - 3 = 1, requesting 1 — should succeed but currently fails
  var result = inventory.check(products, [{ id: 2, qty: 1 }]);
  assert.strictEqual(result.ok, false, 'qty == sellable is rejected with reserved stock (bug)');
});

// ---------------------------------------------------------------
// Characterization: pin what reserve() does
// ---------------------------------------------------------------

test('inventory.reserve – deducts stock correctly', function () {
  var products = [
    { id: 1, name: 'Ghee', stock: 10, reserved: 0, price: 200 }
  ];
  inventory.reserve(products, [{ id: 1, qty: 3 }]);
  assert.strictEqual(products[0].stock, 7);
});

// ---------------------------------------------------------------
// CURRENT BEHAVIOUR: release() looks up by productId (wrong field)
// and decrements reserved instead of restoring stock
// ---------------------------------------------------------------
test('CURRENT BEHAVIOUR: release() does not restore stock because it uses wrong field name', function () {
  var products = [
    { id: 1, name: 'Ghee', stock: 8, reserved: 0, price: 200 },
    { id: 2, name: 'Oil', stock: 5, reserved: 0, price: 100 },
  ];
  // Order line items use "id", not "productId"
  var orderItems = [
    { id: 1, name: 'Ghee', qty: 2 },
    { id: 2, name: 'Oil', qty: 2 },
  ];
  inventory.release(products, orderItems);
  // Stock should go back up, but nothing happens because release looks for item.productId
  assert.strictEqual(products[0].stock, 8, 'stock unchanged — release did nothing (bug)');
  assert.strictEqual(products[1].stock, 5, 'stock unchanged — release did nothing (bug)');
});

// ---------------------------------------------------------------
// Pin getSellableStock
// ---------------------------------------------------------------

test('inventory.getSellableStock – returns stock minus reserved', function () {
  assert.strictEqual(inventory.getSellableStock({ stock: 10, reserved: 3 }), 7);
});

test('inventory.getSellableStock – returns 0 for null product', function () {
  assert.strictEqual(inventory.getSellableStock(null), 0);
});

test('inventory.getSellableStock – floors at 0', function () {
  assert.strictEqual(inventory.getSellableStock({ stock: 2, reserved: 5 }), 0);
});
