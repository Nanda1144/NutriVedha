import React, { useState } from 'react';
import { UtensilsCrossed, Clock, Zap, Heart, Search, CheckCircle, Save } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Recipe.css';

const Recipes: React.FC = () => {
    const [items, setItems] = useState('');
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const saveRecipe = useUserStore(state => state.saveRecipe);

    const recipeDatabase = [
        {
            title: "Golden Turmeric Milk",
            tags: ["turmeric", "milk", "honey", "ginger"],
            time: "5 mins",
            difficulty: "Easy",
            benefits: "Anti-inflammatory, Boosts Immunity",
            steps: ["Boil milk with a pinch of turmeric.", "Add ginger and black pepper.", "Sweeten with honey or jaggery."]
        },
        {
            title: "Ayurvedic Ginger Tea",
            tags: ["ginger", "water", "lemon", "honey"],
            time: "10 mins",
            difficulty: "Easy",
            benefits: "Aids Digestion, Relieves Colds",
            steps: ["Crush fresh ginger.", "Boil in water for 5 mins.", "Add lemon and honey."]
        },
        {
            title: "Amla Immunity Shot",
            tags: ["amla", "honey", "water"],
            time: "3 mins",
            difficulty: "Easy",
            benefits: "Vitamin C Boost, Glowing Skin",
            steps: ["Grate Amla and squeeze juice.", "Mix with warm water and honey.", "Consume on empty stomach."]
        }
    ];

    const [error, setError] = useState<string | null>(null);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const generateRecipes = () => {
        setError(null);
        const raw = items.trim();
        if (!raw) {
            setError('Enter at least one ingredient (e.g. Turmeric, Milk)');
            return;
        }
        if (raw.split(',').filter(s => s.trim()).length > 10) {
            setError('Max 10 ingredients at once.');
            return;
        }
        setLoading(true);
        const inputTags = raw.toLowerCase().split(',').map(tag => tag.trim()).filter(Boolean);
        setTimeout(() => {
            const scored = recipeDatabase.map(r => ({
                ...r,
                score: r.tags.filter((t: string) => inputTags.includes(t)).length
            })).sort((a: any, b: any) => b.score - a.score);
            const matched = scored.filter((r: any) => r.score > 0);
            setRecipes(matched.length > 0 ? matched.slice(0, 3) as any : recipeDatabase.slice(0, 2));
            setLoading(false);
        }, 900);
    };

    const handleSave = (recipe: any) => {
        if (savedIds.has(recipe.title)) return;
        saveRecipe({ ...recipe, id: Date.now().toString(), savedAt: new Date().toISOString() });
        setSavedIds(prev => new Set(prev).add(recipe.title));
        setTimeout(() => setSavedIds(prev => { const n = new Set(prev); n.delete(recipe.title); return n; }), 2000);
    };

    return (
        <div className="recipe-page container section-padding">
            <div className="section-header">
                <h1>AI Recipe Generator</h1>
                <p>Turn your available ingredients into healthy Ayurvedic meals.</p>
            </div>

            <div className="recipe-input-box glass-card">
                <label>Check available items in your kitchen</label>
                <div className="input-with-btn">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="e.g. Ginger, Turmeric, Milk, Amla..."
                            value={items}
                            onChange={(e) => setItems(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={generateRecipes} disabled={loading}>
                        {loading ? <><RefreshCw className="animate-spin" /> Searching...</> : "Find Recipes"}
                    </button>
                </div>
                <div className="popular-tags">
                    <span>Try:</span>
                    {['Ginger', 'Amla', 'Turmeric', 'Coconut', 'Milk', 'Honey'].map(t => (
                        <button key={t} className="tag-chip" onClick={() => setItems(prev => prev ? `${prev}, ${t}` : t)}>{t}</button>
                    ))}
                    {items && <button className="tag-chip" style={{ borderColor: '#ef4444' }} onClick={() => { setItems(''); setRecipes([]); setError(null); }}>Clear</button>}
                </div>
                {error && <div className="glass-card" style={{ padding: '0.7rem 1rem', marginTop: '0.8rem', borderLeft: '3px solid #ef4444', display: 'flex', gap: '0.6rem', alignItems: 'center' }}><span style={{ fontSize: '0.85rem' }}>{error}</span></div>}
            </div>

            {recipes.length > 0 ? (
                <div className="recipe-grid">
                    {recipes.map((r, i) => (
                        <div key={i} className="recipe-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="recipe-img-placeholder">
                                <UtensilsCrossed size={48} />
                                <button className={`save-recipe-btn ${savedIds.has(r.title) ? 'saved' : ''}`} onClick={() => handleSave(r)} title={savedIds.has(r.title) ? 'Saved!' : 'Save to profile'}>
                                    {savedIds.has(r.title) ? <CheckCircle size={20} className="text-success" /> : <Save size={20} />}
                                </button>
                            </div>
                            <div className="recipe-details">
                                <div className="recipe-meta">
                                    <span className="meta-item"><Clock size={14} /> {r.time}</span>
                                    <span className="meta-item"><Zap size={14} /> {r.difficulty}</span>
                                </div>
                                <h3>{r.title}</h3>
                                <div className="benefits-badge">
                                    <Heart size={14} /> {r.benefits}
                                </div>

                                <div className="steps">
                                    <h4><CheckCircle size={16} /> Cooking Steps:</h4>
                                    <ol>
                                        {r.steps.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                                    </ol>
                                    {savedIds.has(r.title) && <span className="benefits-badge" style={{ marginTop: '0.6rem', background: '#dcfce7' }}><CheckCircle size={12} /> Saved to Profile</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !loading && (
                <div className="empty-state glass-card">
                    <UtensilsCrossed size={64} className="text-muted" />
                    <p>Start by entering ingredients you have at home.</p>
                </div>
            )}

            {loading && <div className="loading-state">
                <div className="spinner"></div>
                <p>Searching Ayurvedic Wisdom...</p>
            </div>}
        </div>
    );
};

const RefreshCw = ({ className }: { className?: string }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
);

export default Recipes;
