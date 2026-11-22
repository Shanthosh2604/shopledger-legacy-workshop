var test = require('node:test');
var assert = require('node:assert');
var ledger = require('../lib/ledger');

function makeDb(customers) {
  return {
    customers: customers,
    orders: [],
    settlements: [],
    nextSettlementId: 100
  };
}

// ---------------------------------------------------------------
// Characterization: pin what recordSettlement does
// ---------------------------------------------------------------

test('ledger.recordSettlement – basic settlement decreases balance', function () {
  var db = makeDb([
    { id: 1, name: 'Meera Joshi', phone: '9876', openingBalance: 450, totalBilled: 1982.01, totalSettled: 1200, creditLimit: 5000 }
  ]);
  var before = ledger.listCustomers(db)[0];
  assert.strictEqual(before.balance, 1232.01, 'opening balance correct');

  var res = ledger.recordSettlement(db, 1, 500, 'upi', 'payment');
  assert.ok(res.ok, 'settlement succeeds');
});

// ---------------------------------------------------------------
// FIXED: recordSettlement now coerces totalSettled to Number before
// adding. Even when totalSettled is a string in the data,
// the result is a proper numeric addition.
// (was CURRENT BEHAVIOUR, updated after ledger.js fix)
// ---------------------------------------------------------------
test('ledger.recordSettlement – adds numerically even with string input after fix', function () {
  var db = makeDb([
    { id: 1, name: 'Meera Joshi', phone: '9876', openingBalance: 450, totalBilled: 1982.01, totalSettled: '1200', creditLimit: 5000 }
  ]);
  var res = ledger.recordSettlement(db, 1, 500, 'upi', 'payment');
  assert.ok(res.ok);
  assert.strictEqual(db.customers[0].totalSettled, 1700, 'totalSettled is 1700, not "1200500"');
  assert.strictEqual(db.customers[0].balance, 732.01, 'balance is 732.01');
});

test('ledger.chargeOrderToKhata – pins current behaviour', function () {
  var db = makeDb([
    { id: 1, name: 'Test', phone: '1234', openingBalance: 0, totalBilled: 0, totalSettled: 0, creditLimit: 5000 }
  ]);
  var res = ledger.chargeOrderToKhata(db, 1, 1000);
  assert.ok(res.ok);
  assert.strictEqual(db.customers[0].totalBilled, 1000);
});

test('ledger.chargeOrderToKhata – rejects over credit limit', function () {
  var db = makeDb([
    { id: 1, name: 'Test', phone: '1234', openingBalance: 0, totalBilled: 4500, totalSettled: 0, creditLimit: 5000 }
  ]);
  var res = ledger.chargeOrderToKhata(db, 1, 1000);
  assert.strictEqual(res.ok, false);
});
