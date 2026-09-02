import React from 'react';
import { BookOpen, Trash2, UtensilsCrossed, Heart, Clock, Search, Save } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Link } from 'react-router-dom';

const Saved: React.FC = () => {
  const { savedRecipes, savedDietPlans, reports } = useUserStore();
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState<'recipes' | 'diets' | 'reports'>('recipes');

  const filteredRecipes = savedRecipes.filter((r: any) => r.title.toLowerCase().includes(search.toLowerCase()));
  const filteredDiets = savedDietPlans.filter((d: any) => JSON.stringify(d.meals).toLowerCase().includes(search.toLowerCase()));

  const handleRemoveRecipe = (id: string) => {
    const store = useUserStore.getState() as any;
    store.savedRecipes = store.savedRecipes.filter((r: any) => r.id !== id);
    useUserStore.setState({ savedRecipes: store.savedRecipes });
  };

  return (
    <div className="saved-page container section-padding">
      <div className="section-header">
        <h1>Saved Vault</h1>
        <p>Local `userStore.savedRecipes / savedDietPlans` — will sync to `POST /api/user/saved` PostgreSQL `user_profiles` when gateway wired (Part-5)</p>
      </div>

      <div className="diet-tabs">
        <button className={`tab-btn ${tab === 'recipes' ? 'active' : ''}`} onClick={() => setTab('recipes')}><BookOpen size={16} /> Recipes ({savedRecipes.length})</button>
        <button className={`tab-btn ${tab === 'diets' ? 'active' : ''}`} onClick={() => setTab('diets')}><UtensilsCrossed size={16} /> Diet Plans ({savedDietPlans.length})</button>
        <button className={`tab-btn ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}><Heart size={16} /> Reports ({reports.length})</button>
      </div>

      <div className="glass-card" style={{ padding: '0.8rem 1rem', display: 'flex', gap: '0.8rem', marginBottom: '1rem', marginTop: '1rem' }}>
        <Search size={18} className="text-muted" />
        <input placeholder="Search saved items" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent' }} />
      </div>

      {tab === 'recipes' && (
        filteredRecipes.length === 0 ? (
          <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <BookOpen size={48} className="text-muted" />
            <h3>No saved recipes yet</h3>
            <p>Go to <Link to="/recipes">Recipe Generator</Link> → Find → Save</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {filteredRecipes.map((r: any, i: number) => (
              <div key={r.id || i} className="recipe-card glass-card" style={{ padding: '1rem' }}>
                <h3>{r.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', margin: '0.4rem 0' }}>
                  <span className="meta-item"><Clock size={12} /> {r.time}</span>
                  <span className="meta-item">{r.difficulty}</span>
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{r.benefits}</p>
                <ol style={{ fontSize: '0.85rem', marginTop: '0.6rem', paddingLeft: '1.2rem' }}>{(r.steps || []).map((s: string, idx: number) => <li key={idx}>{s}</li>)}</ol>
                <button className="btn btn-ghost btn-xs text-danger" onClick={() => handleRemoveRecipe(r.id)} style={{ marginTop: '0.8rem' }}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'diets' && (
        filteredDiets.length === 0 ? (
          <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <UtensilsCrossed size={48} className="text-muted" />
            <h3>No saved diet plans</h3>
            <p>Go to <Link to="/diet">AI Diet</Link> → Save This Plan</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredDiets.map((d: any) => (
              <div key={d.id} className="glass-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{d.scanContext} • {d.type}</strong>
                  <span className="hint-text">{new Date(d.date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                  {d.meals.map((m: any, idx: number) => <span key={idx} className="ing-tag">{m.time}: {m.meal}</span>)}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'reports' && (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Save size={48} className="text-muted" />
          <p>Reports live in <Link to="/reports">Reports Vault</Link> (encrypted PostgreSQL `medical_reports`)</p>
        </div>
      )}
    </div>
  );
};

export default Saved;
