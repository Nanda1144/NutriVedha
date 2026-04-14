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

    const generateRecipes = () => {
        setLoading(true);
        const inputTags = items.toLowerCase().split(',').map(tag => tag.trim());

        setTimeout(() => {
            const matched = recipeDatabase.filter(recipe =>
                recipe.tags.some(tag => inputTags.includes(tag))
            );
            setRecipes(matched.length > 0 ? matched : recipeDatabase.slice(0, 2));
            setLoading(false);
        }, 1000);
    };

    const handleSave = (recipe: any) => {
        saveRecipe(recipe);
        alert("Recipe saved to your profile!");
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
                        {loading ? <RefreshCw className="animate-spin" /> : "Find Recipes"}
                    </button>
                </div>
                <div className="popular-tags">
                    <span>Try:</span>
                    {['Ginger', 'Amla', 'Turmeric', 'Coconut'].map(t => (
                        <button key={t} className="tag-chip" onClick={() => setItems(prev => prev ? `${prev}, ${t}` : t)}>{t}</button>
                    ))}
                </div>
            </div>

            {recipes.length > 0 ? (
                <div className="recipe-grid">
                    {recipes.map((r, i) => (
                        <div key={i} className="recipe-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="recipe-img-placeholder">
                                <UtensilsCrossed size={48} />
                                <button className="save-recipe-btn" onClick={() => handleSave(r)}>
                                    <Save size={20} />
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
