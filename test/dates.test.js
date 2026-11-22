var test = require('node:test');
var assert = require('node:assert');
var dates = require('../lib/dates');

// ---------------------------------------------------------------
// Characterization: pin what normalizeDateKey does TODAY
// ---------------------------------------------------------------

test('normalizeDateKey – DD/MM/YYYY is converted to YYYY/MM/DD', function () {
  assert.strictEqual(dates.normalizeDateKey('15/03/2022'), '2022/03/15');
});

test('normalizeDateKey – YYYY-MM-DD is converted to YYYY/MM/DD', function () {
  assert.strictEqual(dates.normalizeDateKey('2022-01-01'), '2022/01/01');
});

test('normalizeDateKey – empty string returns empty', function () {
  assert.strictEqual(dates.normalizeDateKey(''), '');
});

test('normalizeDateKey – null returns empty', function () {
  assert.strictEqual(dates.normalizeDateKey(null), '');
});

// ---------------------------------------------------------------
// FIXED: normalizeDateKey output now sorts chronologically
// (was CURRENT BEHAVIOUR, updated after fix)
// ---------------------------------------------------------------
test('normalizeDateKey output sorts chronologically after fix', function () {
  var jan30 = dates.normalizeDateKey('30/01/2022');
  var mar15 = dates.normalizeDateKey('15/03/2022');
  assert.ok(mar15 > jan30, 'Mar 15 sorts after Jan 30');
});
