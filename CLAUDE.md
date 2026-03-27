# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
node server.js
```

Serves the app at http://localhost:3000. No build step, no package.json, no dependencies.

## Architecture

**Zero-dependency stack**: Node.js standard library only (`http`, `fs`, `path`). No npm, no bundler, no framework.

### Server
`server.js` is a minimal static file server (CommonJS `require`). It maps file extensions to MIME types and serves everything from the project root. Root path (`/`) defaults to `index.html`.

### Frontend
Plain HTML + vanilla JS + one CSS file. No modules — scripts are loaded via `<script>` tags in each HTML page.

**Script loading order matters**: every page loads `js/app.js` first (defines shared globals), then the page-specific script. Functions like `fetchJSON`, `formatCurrency`, `formatDate`, and `getStatusBadge` are globals defined in `app.js` and called directly by page scripts.

### Data Layer
All data lives in `data/products.json` and `data/orders.json`. Pages fetch these via `XMLHttpRequest` at runtime — no server-side rendering, no API layer. Changes to JSON are reflected immediately on next page load.

**products.json schema**: `id, name, sku, category, price, stock, warehouse, reorderLevel`
**orders.json schema**: `id, customerName, productId, productName, quantity, status, orderDate, total`

### Page Scripts
Each page script is an IIFE that fetches data and renders into pre-existing DOM elements by `id`. The pattern is: fetch → transform → `innerHTML` or `appendChild`.

### Known Bugs (intentional, in `js/reports.js`)
1. `console.log("reports debug: rendering")` is called inside every render sub-function — spams the console on page load.
2. Year and Status filter dropdowns on the Reports page have empty `change` handlers — they render but do nothing.
3. "Average Order Value" stat divides `totalRevenue / products.length` instead of `/ totalOrders` — produces a wrong value.

## Code Style

- Always document non-obvious logic changes with comments.

---

## File Reference

### server.js
Static file server using Node's `http` and `fs` modules. Handles MIME types for `.html`, `.css`, `.js`, `.json`, `.png`, `.jpg`, `.ico`. Returns 404 for missing files, 500 for read errors. Strips query strings from URLs before resolving file paths.

### js/app.js
Shared globals loaded on every page. Defines: `fetchJSON(url, callback)` (XHR wrapper), `formatCurrency(value)`, `formatDate(dateStr)`, `getStatusBadge(status)` (returns HTML badge string), `buildSidebar(activePage)` (returns sidebar HTML string, unused — sidebar is hardcoded in each HTML file), and `setActiveNav()` (also unused — active state is hardcoded in HTML).

### js/dashboard.js
Fetches both `products.json` and `orders.json` in parallel using a `loadedCount` counter, renders once both are loaded. Populates KPI card elements (`kpi-products`, `kpi-orders`, `kpi-revenue`, `kpi-lowstock`), status counts (`count-pending`, `count-shipped`, `count-delivered`, `count-cancelled`), and the recent orders table (`recent-orders-body`) with the 10 most recent orders sorted by `orderDate`.

### js/inventory.js
Fetches `products.json` and renders all products into `inventory-body`. Adds `.low-stock` class to rows where `stock <= reorderLevel`. Filters in-memory on `input` (search box, matches name/sku/id) and `change` (category dropdown). Re-renders the full table on every filter change.

### js/orders.js
Fetches `orders.json` and renders into `orders-body`. Maintains a `currentFilter` string (default `'All'`). Status filter buttons use `data-filter` attributes; clicking one updates `currentFilter`, toggles `.active` class, and re-renders. Updates the `orders-count` badge in the topbar.

### js/reports.js
Fetches both JSON files, then calls `renderMonthlySummary()`, `renderTopProducts()`, and `renderSummaryStats()`. Contains three intentional bugs — see Known Bugs above. Monthly summary excludes Cancelled orders. Top products ranked by revenue, top 5 only. Summary stats write to `stat-total-revenue`, `stat-total-orders`, `stat-avg-order`.

### css/styles.css
Single stylesheet for the entire app. Key classes: `.app-layout` (flex container), `.sidebar` (fixed 220px left panel), `.main-content` (margin-left 220px), `.topbar` (sticky), `.kpi-grid` (4-col grid), `.card` / `.card-header` / `.card-body`, `.data-table`, `.low-stock` (orange row highlight for inventory), `.filter-btn` / `.filter-btn.active`, `.badge-blue/green/yellow/red/gray`, `.stats-row` (3-col grid for reports), `.filter-input` / `.filter-select`. Responsive breakpoint at 1100px collapses KPI grid to 2 columns.

### index.html
Dashboard page. DOM targets populated by `dashboard.js` and an inline script for warehouse counts (`wh-sf`, `wh-tokyo`, `wh-london`). Loads `app.js` → inline script → `dashboard.js`.

### inventory.html
Inventory page. Contains `#search-input` text field and `#category-filter` select wired up by `inventory.js`. Table body is `#inventory-body`.

### orders.html
Orders page. Contains five `.filter-btn` buttons with `data-filter` attributes (`All`, `Pending`, `Shipped`, `Delivered`, `Cancelled`). Table body is `#orders-body`. Order count badge is `#orders-count` in the topbar.

### reports.html
Reports page. Contains non-functional `#year-filter` and `#report-status-filter` dropdowns (bug). Summary stats in `#stat-total-revenue`, `#stat-total-orders`, `#stat-avg-order`. Monthly table body is `#monthly-body`, top products table body is `#top-products-body`.

### data/products.json
20 products. Categories: Electronics (6), Furniture (5), Office Supplies (5), Packaging (4). Warehouses: San Francisco (7), Tokyo (6), London (7). Several products are intentionally at or below reorder level (P002, P004, P009, P011, P013, P016, P018, P020).

### data/orders.json
28 orders spanning Jan–Dec 2025. Status breakdown: Delivered (16), Shipped (5), Pending (5), Cancelled (2). Customers: Acme Corp, TechStart Inc, Global Offices LLC, Metro Solutions, Sunrise Retail, Pinnacle Ventures, Orion Trading, BlueSky Partners, ClearPath Co, Nexus Group, Vertex Systems, Summit Logistics, Coastal Supplies, Redwood Enterprises, Horizon Tech, Apex Digital.
