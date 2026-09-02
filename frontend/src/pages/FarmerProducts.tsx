import React, { useEffect, useState } from 'react';
import { Package, Upload, Trash2, Edit2, CheckCircle, AlertCircle, Search, Save } from 'lucide-react';
import { fetchInventory, addInventoryItem, updateInventoryItem } from '../services/farmer.service';
import { getAuthToken } from '../services/client';

const FarmerProducts: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: 'kg', price: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ stock: '', price: '' });

  const load = async () => {
    setLoading(true); setError(null);
    if (!getAuthToken()) { setError('Login as Farmer to manage products'); setLoading(false); return; }
    try { const res = await fetchInventory(); setItems(res.inventory); } catch (e: any) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const handleAdd = async () => {
    if (!newItem.name.trim() || !newItem.price.trim()) { setError('Name and Price required'); return; }
    setError(null);
    try {
      const res = await addInventoryItem({ name: newItem.name.trim(), stock: parseInt(newItem.stock, 10) || 0, unit: newItem.unit, price: parseFloat(newItem.price) });
      setItems(prev => [...prev, res.item]);
      setNewItem({ name: '', stock: '', unit: 'kg', price: '' });
    } catch (e: any) { setError(e.message); }
  };
  const handleUpdate = async (id: string) => {
    try {
      const res = await updateInventoryItem(id, { stock: parseInt(editForm.stock, 10), price: parseFloat(editForm.price) });
      setItems(prev => prev.map(it => it.id === id ? res.item : it));
      setEditing(null);
    } catch (e: any) { setError(e.message); }
  };
  const filtered = items.filter(it => it.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container section-padding">
      <div className="section-header">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Package size={28} className="text-primary" />
          <h1>Product Listing</h1>
          <span className="status-pill-small success">{items.length} products</span>
        </div>
        <p>PostgreSQL <code>farmer_inventory</code> `name stock unit price` via <code>farmer:3012</code> → visible in <code>Marketplace crops</code></p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Search size={18} className="text-muted" />
        <input aria-label="Search products" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
        <button className="btn btn-ghost btn-xs" onClick={load}>Refresh</button>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <h3>New Product — Image Upload UI + Price/Unit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem' }}>
          <input aria-label="Product name" placeholder="Product name (e.g. Tulsi)" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <input aria-label="Stock" placeholder="Stock (e.g. 50)" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
          <select aria-label="Unit" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }}><option>kg</option><option>g</option><option>pieces</option></select>
          <input aria-label="Price" placeholder="Price ₹" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-xs" aria-label="Upload image"><Upload size={14} /> Upload Image (stub)</button>
          <span className="hint-text" style={{ fontSize: '0.75rem' }}>Image stored in S3 stub — not in PG yet</span>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ marginLeft: 'auto' }}><Save size={14} /> Add Product</button>
        </div>
      </div>

      {loading && <div className="loading-state"><div className="spinner" /><p>Loading inventory…</p></div>}
      {error && <div className="glass-card" style={{ padding: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}><AlertCircle size={16} className="text-danger" /><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
        {filtered.map(it => (
          <div key={it.id} className="glass-card" style={{ padding: '1rem' }}>
            {editing === it.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <strong>{it.name}</strong>
                <input aria-label="Edit stock" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} placeholder="Stock" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                <input aria-label="Edit price" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-xs" onClick={() => handleUpdate(it.id)}><CheckCircle size={12} /> Save</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{it.name}</strong>
                  <span className="status-pill-small success">{it.stock}{it.unit}</span>
                </div>
                <p className="hint-text">₹{it.price} • {it.unit}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <button className="btn btn-outline btn-xs" onClick={() => { setEditing(it.id); setEditForm({ stock: String(it.stock), price: String(it.price) }); }} aria-label={`Edit ${it.name}`}><Edit2 size={12} /> Edit</button>
                  <button className="btn btn-ghost btn-xs text-danger" aria-label={`Delete ${it.name}`}><Trash2 size={12} /> Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && !loading && <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}><Package size={48} className="text-muted" /><h3>No products</h3><p>Add a product to sync with Marketplace via PostgreSQL</p></div>}
    </div>
  );
};

export default FarmerProducts;
