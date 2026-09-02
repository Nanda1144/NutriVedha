import React, { useMemo, useState } from 'react';
import { Search as SearchIcon, ShoppingBag, Stethoscope, UtensilsCrossed, BookOpen, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FOOD_DATABASE } from '../data/foodDatabase';
import './Search.css';

const SearchPage: React.FC = () => {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'All' | 'Food' | 'Doctors' | 'Marketplace' | 'Recipes'>('All');

  const doctors = [
    { name: 'Dr. Ananya Sharma', spec: 'Ayurvedic Internal Medicine', path: '/telemedicine' },
    { name: 'Dr. Priya Iyer', spec: 'Nutrition & Dietetics', path: '/telemedicine' },
  ];
  const crops = [
    { name: 'Organic Amla (Pratapgarh)', path: '/marketplace' },
    { name: 'Chemical-Free Turmeric', path: '/marketplace' },
    { name: 'Native Ashwagandha Roots', path: '/marketplace' },
  ];
  const recipes = [
    { name: 'Golden Turmeric Milk', path: '/recipes' },
    { name: 'Ayurvedic Ginger Tea', path: '/recipes' },
    { name: 'Amla Immunity Shot', path: '/recipes' },
  ];

  const foodResults = useMemo(() => {
    if (!q.trim()) return [];
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) || f.benefit.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  }, [q]);

  const hasQuery = q.trim().length >= 2;

  return (
    <div className="search-page container section-padding">
      <div className="section-header">
        <h1>Search & Discovery</h1>
        <p>Global index — FoodIntel + Marketplace + Telemedicine + Recipes (frontend `useMemo` now, `GET /api/analytics/search` PostgreSQL later)</p>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '1rem' }}>
        <SearchIcon size={20} className="text-muted" />
        <input placeholder="Search foods, doctors, crops, recipes (min 2 chars)" value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem' }} />
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <option value="All">All</option><option value="Food">Food</option><option value="Doctors">Doctors</option><option value="Marketplace">Marketplace</option><option value="Recipes">Recipes</option>
        </select>
      </div>

      {!hasQuery ? (
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <SearchIcon size={40} className="text-muted" />
          <p style={{ marginTop: '0.6rem' }}>Type at least 2 characters to discover foods, doctors, crops and recipes. Shortcuts: <Link to="/food-intel">FoodIntel</Link> • <Link to="/telemedicine">Doctors</Link> • <Link to="/marketplace">Marketplace</Link></p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(filter === 'All' || filter === 'Food') && foodResults.length > 0 && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Sprout size={18} /> Foods ({foodResults.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '0.8rem', marginTop: '0.8rem' }}>
                {foodResults.map(f => (
                  <Link key={f.name} to="/food-intel" className="glass-card" style={{ padding: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
                    <strong>{f.name}</strong><p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{f.benefit.slice(0, 60)}…</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {(filter === 'All' || filter === 'Marketplace') && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><ShoppingBag size={18} /> Marketplace</h3>
              {crops.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase())).map(c => <Link key={c.name} to={c.path} style={{ display: 'block', padding: '0.5rem 0' }}>{c.name} → View</Link>)}
            </div>
          )}
          {(filter === 'All' || filter === 'Doctors') && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Stethoscope size={18} /> Doctors</h3>
              {doctors.filter(d => !q || d.name.toLowerCase().includes(q.toLowerCase())).map(d => <Link key={d.name} to={d.path} style={{ display: 'block', padding: '0.5rem 0' }}>{d.name} — {d.spec}</Link>)}
            </div>
          )}
          {(filter === 'All' || filter === 'Recipes') && (
            <div className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><UtensilsCrossed size={18} /> Recipes</h3>
              {recipes.filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase())).map(r => <Link key={r.name} to={r.path} style={{ display: 'block', padding: '0.5rem 0' }}>{r.name}</Link>)}
            </div>
          )}
          {foodResults.length === 0 && <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}><BookOpen size={24} className="text-muted" /><p>No results for “{q}” in {filter}</p></div>}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
