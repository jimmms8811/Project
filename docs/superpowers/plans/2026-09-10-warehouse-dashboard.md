# Warehouse Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all-in-one glass-style warehouse dashboard with mock auth (Admin/Manager/SPV), KPIs, inventory with barcodes, dedicated scan page.

**Architecture:** React+Vite SPA, React Router, Tailwind glassmorphism (backdrop-blur, white/10), service layer over mock JSON, AuthContext with role guards.

**Tech Stack:** React 18, Vite 5, Tailwind 3, react-router-dom 6, recharts.

**Spec:** Chat-approved design 2026-09-10 (all-in-one Ops+KPIs, Sidebar+cards, barcode WH-XXXXXX, /scan page, glass style). No prior spec file (repo was empty).

## Global Constraints

- Mock data only, no backend.
- Barcode format WH-XXXXXX unique uppercase.
- Glass style everywhere: `bg-white/10 backdrop-blur-xl border-white/20`-type classes over gradient background.
- Roles: Admin full, Manager approve/edit no user-mgmt, SPV scan/adjust only.
- `npm run dev` and `npm run build` must pass.

---

### Task 1: Scaffold Vite+Tailwind+deps

**Files:**
- Create: `package.json, vite.config.js, tailwind.config.js, postcss.config.js, index.html, src/main.jsx, src/index.css`
- Test: `npm run build` passes

**Interfaces:**
- Consumes: empty repo
- Produces: runnable Vite app with Tailwind + router + recharts

- [ ] **Step 1: Scaffold vite react in place**

Run: `npm create vite@latest . -- --template react` (merge, keep AGENTS.md) then `npm install && npm install react-router-dom recharts`
Expected: package.json with deps

- [ ] **Step 2: Setup Tailwind**

Run: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
Configure content `./index.html, ./src/**/*.{js,jsx}`, index.css with `@tailwind` + glass helpers + gradient body bg.
Expected: build passes

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS, dist/ created

### Task 2: Auth + Glass Layout + Routing

**Files:**
- Create: `src/auth/AuthContext.jsx, src/app/Layout.jsx, src/app/guards.jsx, src/components/ui.jsx, src/pages/Login.jsx, src/App.jsx` (router)
- Modify: `src/main.jsx`

**Interfaces:**
- Consumes: Task 1 scaffold
- Produces: `useAuth() {user, login, logout, hasRole}`, `<GlassCard>`, `<Layout>`, routes with guards

- [ ] **Step 1: AuthContext with 3 mock users** (admin/manager/spv, password `password`, LocalStorage persist)
- [ ] **Step 2: ui.jsx Glass primitives** (GlassCard, KPI card, Badge, Btn, Input, Table shell)
- [ ] **Step 3: Layout Sidebar+Topbar** (sidebar nav, topbar quick-scan input -> /scan?barcode=, user chip, mobile collapse)
- [ ] **Step 4: Router + guards** (public /login, protected /, /inventory, /scan, /inbound, /outbound, /orders, /suppliers, /locations, /activity; Admin-only /users optional -> reuse activity)
- [ ] **Step 5: Verify** `npm run build` PASS

### Task 3: Mocks + API + Dashboard

**Files:**
- Create: `src/mocks/products.json, shipments.json, orders.json, suppliers.json, locations.json, activity.json, users.json`
- Create: `src/services/api.js`
- Create: `src/pages/Dashboard.jsx`

**Interfaces:**
- Consumes: Task 2 layout
- Produces: `api.listProducts, getProductByBarcode, searchProducts, adjustStock, listShipments, listOrders, kpis()` + Dashboard KPIs+charts

- [ ] **Step 1: Mocks** 12 products with sku+barcode WH-100001.., qty, reorder, location, category; 6 shipments, 6 orders, 4 suppliers, 5 locations
- [ ] **Step 2: api.js** async fns with 150ms delay, search matches name/sku/barcode (barcode exact-first), adjustStock validates >=0 + appends activity
- [ ] **Step 3: Dashboard** KPI cards + Recharts Bar (in/out 7-day) + Pie (stock by category) + low-stock table
- [ ] **Step 4: Verify** build PASS, manual: login each role, dashboard renders

### Task 4: Inventory + Scan + Ops pages

**Files:**
- Create: `src/pages/Inventory.jsx, Scan.jsx, Shipments.jsx, Orders.jsx, Suppliers.jsx, Locations.jsx, Activity.jsx`

**Interfaces:**
- Consumes: api + layout
- Produces: full ops flows, scan lookup + adjust + history

- [ ] **Step 1: Inventory** searchable table (SKU/barcode mono+copy), status badge, adjust dialog (Admin/Manager edit barcode + Generate WH- button; SPV qty only)
- [ ] **Step 2: Scan page** autofocus input, mode toggle Receive/Pick/Audit, result card + +/- adjust, session history, query param `?barcode=` support, big glass feedback
- [ ] **Step 3: Ops pages** inbound/outbound (status pills + approve button Manager/Admin), orders (pick/pack flow), suppliers/locations CRUD mock (add in-memory), activity log table
- [ ] **Step 4: Verify** `npm run build` PASS + `npm run dev` manual checklist

### Task 5: Polish + README

**Files:**
- Create/modify: `README.md`, `src/index.css` tweaks
- [ ] Glass background gradient + scrollbar + focus rings, empty states, toasts (simple inline), README with logins + scanner note
- [ ] Final `npm run build` PASS, `git status` review
