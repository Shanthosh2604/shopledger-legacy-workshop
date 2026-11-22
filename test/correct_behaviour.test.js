var test = require('node:test');
var assert = require('node:assert');
var dates = require('../lib/dates');
var orders = require('../lib/orders');
var ledger = require('../lib/ledger');

function makeDb(orderList) {
  return { orders: orderList, products: [], customers: [], nextOrderId: 2000 };
}

// ---------------------------------------------------------------
// CORRECT BEHAVIOUR: normalizeDateKey must produce a string that
// sorts chronologically (YYYY/MM/DD).
// ---------------------------------------------------------------
test('CORRECT: normalizeDateKey output must sort chronologically', function () {
  var jan30 = dates.normalizeDateKey('30/01/2022');
  var mar15 = dates.normalizeDateKey('15/03/2022');
  assert.ok(mar15 > jan30, 'Mar 15 must sort after Jan 30');
});

// ---------------------------------------------------------------
// CORRECT BEHAVIOUR: orders.list must return newest first
// ---------------------------------------------------------------
test('CORRECT: orders.list returns newest order first', function () {
  var db = makeDb([
    { id: 1001, date: '28/12/2021', customer: 'A', status: 'completed', total: 100 },
    { id: 1004, date: '30/01/2022', customer: 'B', status: 'completed', total: 200 },
    { id: 1007, date: '04/03/2022', customer: 'C', status: 'completed', total: 300 },
    { id: 1008, date: '15/03/2022', customer: 'D', status: 'completed', total: 400 },
  ]);
  var result = orders.list(db, {});
  assert.strictEqual(result[0].id, 1008, 'Mar 15 (newest) should be first');
  assert.strictEqual(result[1].id, 1007, 'Mar 4 should be second');
  assert.strictEqual(result[2].id, 1004, 'Jan 30 should be third');
  assert.strictEqual(result[3].id, 1001, 'Dec 28 (oldest) should be last');
});

// ---------------------------------------------------------------
// CORRECT BEHAVIOUR: date range filter returns only matching orders
// ---------------------------------------------------------------
test('CORRECT: date range filter for Jan 2022 returns only Jan orders', function () {
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

// ---------------------------------------------------------------
// CORRECT BEHAVIOUR: settlement must add numerically, not concatenate
// ---------------------------------------------------------------
test('CORRECT: recordSettlement adds amount numerically', function () {
  var db = {
    customers: [
      { id: 1, name: 'Meera Joshi', phone: '9876', openingBalance: 450, totalBilled: 1982.01, totalSettled: '1200', creditLimit: 5000 }
    ],
    orders: [],
    settlements: [],
    nextSettlementId: 100
  };
  var res = ledger.recordSettlement(db, 1, 500, 'upi', 'payment');
  assert.ok(res.ok);
  assert.strictEqual(db.customers[0].totalSettled, 1700, 'totalSettled should be 1700, not "1200500"');
  assert.strictEqual(db.customers[0].balance, 732.01, 'balance should be 732.01');
});
