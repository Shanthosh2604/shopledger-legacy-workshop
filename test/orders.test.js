var test = require('node:test');
var assert = require('node:assert');
var orders = require('../lib/orders');

function makeDb(orderList) {
  return {
    orders: orderList,
    products: [],
    customers: [],
    nextOrderId: 2000
  };
}

// ---------------------------------------------------------------
// Characterization: orders.list returns all orders
// ---------------------------------------------------------------

test('orders.list – returns all orders when no filters', function () {
  var db = makeDb([
    { id: 1001, date: '28/12/2021', customer: 'A', status: 'completed', total: 100 },
    { id: 1004, date: '30/01/2022', customer: 'B', status: 'completed', total: 200 },
    { id: 1007, date: '04/03/2022', customer: 'C', status: 'completed', total: 300 },
    { id: 1008, date: '15/03/2022', customer: 'D', status: 'completed', total: 400 },
  ]);
  var result = orders.list(db, {});
  assert.strictEqual(result.length, 4);
});

// ---------------------------------------------------------------
// FIXED: newest-first sort now works correctly
// (was CURRENT BEHAVIOUR, updated after dates.js fix)
// ---------------------------------------------------------------
test('orders.list – newest order first after fix', function () {
  var db = makeDb([
    { id: 1001, date: '28/12/2021', customer: 'A', status: 'completed', total: 100 },
    { id: 1004, date: '30/01/2022', customer: 'B', status: 'completed', total: 200 },
    { id: 1007, date: '04/03/2022', customer: 'C', status: 'completed', total: 300 },
    { id: 1008, date: '15/03/2022', customer: 'D', status: 'completed', total: 400 },
  ]);
  var result = orders.list(db, {});
  assert.strictEqual(result[0].id, 1008, 'Mar 15 (newest) is first');
  assert.strictEqual(result[1].id, 1007, 'Mar 4 is second');
  assert.strictEqual(result[2].id, 1004, 'Jan 30 is third');
  assert.strictEqual(result[3].id, 1001, 'Dec 28 (oldest) is last');
});

// ---------------------------------------------------------------
// FIXED: date range filter now returns only matching orders
// (was CURRENT BEHAVIOUR, updated after dates.js fix)
// ---------------------------------------------------------------
test('orders.list – date range filter for Jan 2022 returns only Jan orders after fix', function () {
  var db = makeDb([
    { id: 1001, date: '28/12/2021', customer: 'A', status: 'completed', total: 100 },
    { id: 1004, date: '30/01/2022', customer: 'B', status: 'completed', total: 200 },
    { id: 1007, date: '04/03/2022', customer: 'C', status: 'completed', total: 300 },
    { id: 1008, date: '15/03/2022', customer: 'D', status: 'completed', total: 400 },
  ]);
  var result = orders.list(db, { from: '2022-01-01', to: '2022-01-31' });
  var ids = result.map(function (o) { return o.id; });
  assert.strictEqual(ids.length, 1, 'exactly one order in Jan 2022');
  assert.strictEqual(ids[0], 1004, 'only order 1004 is in Jan 2022');
});
