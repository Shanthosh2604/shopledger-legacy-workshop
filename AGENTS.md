# ShopLedger – Agent Guidance

## Current Stack
- **Runtime**: Node.js (v14+ compatible) on Windows.
- **Web framework**: Express 4.17.1, handling JSON APIs and static assets.
- **Data store**: A single JSON file (`data/db.json`) accessed via the `store.js` module – no external database.
- **Dependencies**:
  - `express`
  - `body‑parser`

## Short Module Map
```
server.js          – Express app bootstrap, static middleware, router mounting
config.js          – Hard‑coded configuration (port, shop details, tax slabs, coupons)

routes/
  ├─ products.js   – CRUD endpoints for product catalog (/api/products)
  ├─ orders.js     – Order lifecycle: list, get, create, cancel (/api/orders)
  ├─ customers.js  – Customer CRUD (/api/customers)
  └─ reports.js    – Reporting endpoints (/api/reports)

lib/
  ├─ dates.js          – Date helpers (today, normalization)
  ├─ inventory.js      – Stock lookup, check, reserve, release
  ├─ pricing.js        – Sub‑total, discounts, GST calculations
  ├─ coupons.js        – Coupon normalization & validation
  ├─ tax.js            – HSN‑based GST rates & CGST/SGST split
  ├─ ledger.js         – "Khata" credit‑billing logic
  ├─ orders.js         – Order creation, lookup, cancellation
  ├─ reports.js        – Aggregated statistics (sales, stock, etc.)
  ├─ store.js          – Read/write of `data/db.json` + audit log
  └─ invoice.js        – HTML invoice rendering
```

## Primary Commands
| Command | What it does |
|---------|--------------|
| `npm start` | Executes `node server.js` – starts the API server on the configured port. |
| `node server.js` | Same as above, useful when running directly without npm. |
| `npm test` | (placeholder – currently prints an error) – intended for running the test suite. |

## Development Rules (enforced for all tickets)
1. **Write characterization tests before changing behaviour.**
   - Add unit tests that capture the current observable behaviour of the module you are about to modify.
2. **Change only the module the ticket is about.**
   - Scope modifications to the single file that implements the requested feature or bug‑fix.
3. **Tests must never touch `data/db.json`.**
   - The JSON database is considered production data; tests should use in‑memory fixtures or temporary test files.
4. **Do not add new dependencies.**
   - All required functionality should be built using the existing runtime, Express, and the standard library.

_These rules keep the legacy codebase lightweight, maintainable, and safe for the small shop environment it serves._
