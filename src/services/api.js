import activitySeed from '../mocks/activity.json'
import locations from '../mocks/locations.json'
import orders from '../mocks/orders.json'
import productsSeed from '../mocks/products.json'
import shipmentsSeed from '../mocks/shipments.json'
import suppliersSeed from '../mocks/suppliers.json'

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms))

let products = [...productsSeed]
let activity = [...activitySeed]
let shipments = [...shipmentsSeed]
let suppliers = [...suppliersSeed]
let movements = [
  { id: 'm1', at: '2026-09-10 09:12', barcode: 'WH-100003', sku: 'SKU-1003', name: 'Safety Gloves L', type: 'out', qty: 5, ref: 'OUT-7001', note: 'Store issue', by: 'supervisor' },
  { id: 'm2', at: '2026-09-09 14:20', barcode: 'WH-100002', sku: 'SKU-1002', name: 'Pallet Wrap Film 500mm', type: 'in', qty: 120, ref: 'IN-9003', note: 'Supplier receipt', by: 'manager' },
  { id: 'm3', at: '2026-09-09 10:05', barcode: 'WH-100006', sku: 'SKU-1006', name: 'Barcode Label Roll', type: 'out', qty: 20, ref: 'SO-5001', note: 'Order picking', by: 'supervisor' },
]

export const api = {
  async searchProducts(q) {
    await delay(80)
    const s = (q || '').trim().toLowerCase()
    if (!s) return products
    const exact = products.filter((p) => p.barcode.toLowerCase() === s || p.sku.toLowerCase() === s)
    if (exact.length) return exact
    return products.filter((p) =>
      [p.name, p.sku, p.barcode, p.category, p.location].join(' ').toLowerCase().includes(s)
    )
  },
  async getProductByBarcode(code) {
    await delay(80)
    const s = (code || '').trim().toLowerCase()
    return products.find((p) => p.barcode.toLowerCase() === s || p.sku.toLowerCase() === s) || null
  },
  async adjustStock(id, delta, by = 'app') {
    await delay()
    const p = products.find((x) => x.id === id)
    if (!p) throw new Error('Product not found')
    const next = p.qty + delta
    if (next < 0) throw new Error('Resulting qty cannot be negative')
    p.qty = next
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Adjusted ${p.barcode} qty by ${delta} -> ${next}`,
    })
    return { ...p }
  },
  async setStock(id, qty, by = 'app') {
    await delay()
    const p = products.find((x) => x.id === id)
    if (!p) throw new Error('Product not found')
    const next = Number(qty)
    if (!Number.isFinite(next) || next < 0) throw new Error('Counted qty must be 0 or more')
    const before = p.qty
    p.qty = Math.floor(next)
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Audit ${p.barcode} count ${before} -> ${p.qty}`,
    })
    return { ...p }
  },
  async updateProduct(id, patch) {
    await delay()
    const i = products.findIndex((x) => x.id === id)
    if (i < 0) throw new Error('Product not found')
    if (patch.barcode) {
      const dup = products.find((x) => x.id !== id && x.barcode.toLowerCase() === String(patch.barcode).toLowerCase())
      if (dup) throw new Error('Barcode must be unique')
    }
    products[i] = { ...products[i], ...patch }
    return { ...products[i] }
  },
  async addProduct(data, by = 'app') {
    await delay()
    const sku = String(data.sku || '').trim()
    const barcode = String(data.barcode || '').trim().toUpperCase()
    const name = String(data.name || '').trim()
    if (!name) throw new Error('Name is required')
    if (!sku) throw new Error('SKU is required')
    if (!barcode) throw new Error('Barcode is required')
    if (products.some((x) => x.sku.toLowerCase() === sku.toLowerCase())) throw new Error('SKU must be unique')
    if (products.some((x) => x.barcode.toLowerCase() === barcode.toLowerCase())) throw new Error('Barcode must be unique')
    const p = {
      id: `p${Date.now()}`,
      sku,
      barcode,
      name,
      category: data.category || 'General',
      location: data.location || 'A-01-01',
      qty: Math.max(0, Number(data.qty) || 0),
      reorderPoint: Math.max(0, Number(data.reorderPoint) || 0),
      supplierId: data.supplierId || 's1',
      price: Math.max(0, Number(data.price) || 0),
    }
    products.unshift(p)
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Added item ${p.barcode} (${p.sku}) ${p.name} qty ${p.qty}`,
    })
    return { ...p }
  },
  async removeProduct(id, by = 'app') {
    await delay()
    const i = products.findIndex((x) => x.id === id)
    if (i < 0) throw new Error('Product not found')
    const [gone] = products.splice(i, 1)
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Removed item ${gone.barcode} (${gone.sku}) ${gone.name}`,
    })
    return gone.id
  },
  async listShipments() {
    await delay()
    return shipments
  },
  async updateShipment(id, patch, by = 'app') {
    await delay()
    const i = shipments.findIndex((x) => x.id === id)
    if (i < 0) throw new Error('Shipment not found')
    shipments[i] = { ...shipments[i], ...patch }
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `${shipments[i].ref} -> ${shipments[i].status}`,
    })
    return { ...shipments[i] }
  },
  async listOrders() {
    await delay()
    return orders
  },
  async listSuppliers() {
    await delay()
    return suppliers
  },
  async addSupplier(data, by = 'app') {
    await delay()
    const name = String(data.name || '').trim()
    if (!name) throw new Error('Supplier name is required')
    if (suppliers.some((x) => x.name.toLowerCase() === name.toLowerCase())) throw new Error('Supplier already exists')
    const s = {
      id: `s${Date.now()}`,
      name,
      contact: String(data.contact || '').trim() || '-',
      leadTime: String(data.leadTime || '').trim() || '-',
    }
    suppliers.unshift(s)
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Added supplier ${s.name}`,
    })
    return { ...s }
  },
  async removeSupplier(id, by = 'app') {
    await delay()
    const i = suppliers.findIndex((x) => x.id === id)
    if (i < 0) throw new Error('Supplier not found')
    if (products.some((p) => p.supplierId === id)) throw new Error('Supplier is used by inventory items')
    const [gone] = suppliers.splice(i, 1)
    activity.unshift({
      id: `a${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      by,
      action: `Removed supplier ${gone.name}`,
    })
    return gone.id
  },
  async listLocations() {
    await delay()
    return locations
  },
  async listActivity() {
    await delay()
    return activity
  },
  async listMovements() {
    await delay()
    return movements
  },
  async recordMovement({ productId, type, qty, ref = '', note = '', by = 'app' }) {
    await delay()
    const n = Number(qty)
    if (!Number.isFinite(n) || n <= 0) throw new Error('Qty must be greater than 0')
    if (type !== 'in' && type !== 'out') throw new Error('Type must be in or out')
    const delta = type === 'in' ? n : -n
    const updated = await this.adjustStock(productId, delta, by)
    movements.unshift({
      id: `m${Date.now()}`,
      at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      barcode: updated.barcode,
      sku: updated.sku,
      name: updated.name,
      type,
      qty: n,
      ref,
      note,
      by,
    })
    return { ...updated }
  },
  async kpis() {
    await delay()
    const totalSkus = products.length
    const stockValue = products.reduce((s, p) => s + p.qty * (p.price || 0), 0)
    const lowStock = products.filter((p) => p.qty <= p.reorderPoint).length
    const byCategory = Object.entries(
      products.reduce((m, p) => {
        m[p.category] = (m[p.category] || 0) + p.qty
        return m
      }, {})
    ).map(([name, value]) => ({ name, value }))
    return {
      totalSkus,
      stockValue,
      lowStock,
      inboundToday: 2,
      outboundToday: 2,
      fillRate: 94.2,
      byCategory,
      weekFlow: [
        { day: 'Mon', inbound: 120, outbound: 90 },
        { day: 'Tue', inbound: 200, outbound: 150 },
        { day: 'Wed', inbound: 150, outbound: 180 },
        { day: 'Thu', inbound: 240, outbound: 200 },
        { day: 'Fri', inbound: 180, outbound: 220 },
        { day: 'Sat', inbound: 90, outbound: 110 },
        { day: 'Sun', inbound: 60, outbound: 70 },
      ],
      topMovers: [...products].sort((a, b) => b.qty - a.qty).slice(0, 5),
    }
  },
}
