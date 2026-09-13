# Warehouse — Glass Dashboard

All-in-one warehouse dashboard: KPIs, inventory with barcodes, dedicated scan page, inbound/outbound, orders, suppliers, locations, activity. Mock data only.

## Run

```bash
npm install
npm run dev
npm run build
```

## Demo logins (password: `password`)

- `admin` — Admin (inventory items/data entry + **Transactions** in/out entry, no shipment approvals)
- `manager` — Manager (approve/complete inbound & outbound, scan ops)
- `supervisor` — Supervisor (approve/complete inbound & outbound, scan ops)

Or use the Admin / Manager / Supervisor quick buttons on `/login`.

## Barcode + Scan

- Format: `WH-XXXXXX` (unique). Every product in `src/mocks/products.json` has one.
- Inventory: search matches name/SKU/barcode, barcode column has copy button, edit dialog has Generate.
- Topbar: global scan/search input → jumps to `/scan?barcode=...`.
- `/scan`: autofocus input for USB HID scanner guns (they type + Enter). Modes: Receive / Pick / Audit. Session history kept in-memory.
- `/transactions` (Admin only sidebar menu, labeled Transactions): input data movement items — find item by name/SKU/barcode, choose Goods IN/OUT, qty, reference, note. Updates stock + movement history + activity log.
- Future: add camera scanning (e.g. html5-qrcode) reusing `api.getProductByBarcode()` — no data migration needed.

## Glass style + themes

Tailwind v4 + custom `.glass` / `.glass-strong` / `.glass-input` in `src/index.css` (backdrop-blur over gradient background).
Theme toggle (sun/moon button) on the login page and in the dashboard header switches light/dark; choice persists in LocalStorage. Dark mode remaps surfaces, text, badges, inputs, scrollbars and chart colors.
