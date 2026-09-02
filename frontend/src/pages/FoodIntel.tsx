import React, { useState, useMemo } from 'react';
import { ShoppingCart, Info, X, Zap, Droplets, Target, Search, Sparkles } from 'lucide-react';
import { FOOD_DATABASE, type FoodItem } from '../data/foodDatabase';
import './FoodIntel.css';

const FoodIntel: React.FC = () => {
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const filteredFoods = useMemo(() => {
        return FOOD_DATABASE.filter(f =>
            (activeCategory === 'All' || f.category === activeCategory) &&
            (f.name.toLowerCase().includes(search.toLowerCase()) ||
                f.benefit.toLowerCase().includes(search.toLowerCase()) ||
                f.goodFor.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, activeCategory]);

    const categories = ['All', 'Herbs', 'Spices', 'Fruits', 'Dairy'];

    const getStats = useMemo(() => {
        return {
            total: FOOD_DATABASE.length,
            filtered: filteredFoods.length,
            categories: categories.slice(1).map(cat => ({
                name: cat,
                count: FOOD_DATABASE.filter(f => f.category === cat).length
            }))
        };
    }, [filteredFoods]);

    return (
        <div className="food-intel-page container section-padding">
            <div className="section-header">
                <div className="intelligence-badge">
                    <Sparkles size={16} /> AI-Powered Database
                </div>
                <h1>Food Intelligence Hub</h1>
                <p>Explore our library of {getStats.total}+ Ayurvedic superfoods with science-backed insights.</p>
            </div>

            <div className="food-stats-bar glass-card">
                {getStats.categories.map(c => (
                    <div key={c.name} className="stat-pill">
                        <strong>{c.count}</strong>
                        <span>{c.name}</span>
                    </div>
                ))}
            </div>

            <div className="food-controls">
                <div className="search-bar-intel glass-card">
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Search nutrients, diseases, or food names..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="results-info">
                Showing {getStats.filtered} items in {activeCategory} category
            </div>

            <div className="food-grid">
                {filteredFoods.map((food, i) => (
                    <div key={food.name} className="food-card glass-card animate-fade-in" style={{ animationDelay: `${(i % 10) * 0.05}s` }} onClick={() => setSelectedFood(food)}>
                        <div className="food-img-wrapper">
                            <img src={food.image} alt={food.name} className="food-img" loading="lazy" />
                            <span className="cat-badge">{food.category}</span>
                        </div>
                        <div className="food-info">
                            <h3>{food.name}</h3>
                            <p className="benefit-preview">{food.benefit}</p>
                            <div className="food-footer">
                                <span className="therapeutic-tag">{food.goodFor.split(',')[0]}</span>
                                <button className="view-link">View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFood && (
                <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
                    <div className="modal-content glass-card animate-scale-up" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedFood(null)}><X size={24} /></button>

                        <div className="modal-header-section">
                            <img src={selectedFood.image} alt={selectedFood.name} className="modal-img" />
                            <div className="modal-title-box">
                                <span className="modal-cat">{selectedFood.category}</span>
                                <h2>{selectedFood.name}</h2>
                                <div className="ayurvedic-tag">Ayurvedic Superfood</div>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="modal-grid">
                                <div className="info-section">
                                    <h4><Info size={16} /> Nature & Uses</h4>
                                    <p><strong>Primary Uses:</strong> {selectedFood.uses}</p>
                                    <p><strong>Science:</strong> {selectedFood.benefit}</p>
                                </div>

                                <div className="info-section">
                                    <h4><Zap size={16} /> Nutrition Breakdown</h4>
                                    <div className="nutri-pills">
                                        {Object.entries(selectedFood.nutrition).map(([key, val]: any) => (
                                            <div key={key} className="pill">
                                                <span className="capitalize">{key}</span>
                                                <strong>{val}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h4><Droplets size={16} /> Ayurvedic Perspective</h4>
                                    <p>{selectedFood.ayurvedicValue}</p>
                                </div>

                                <div className="info-section">
                                    <h4><Target size={16} /> Therapeutic Value</h4>
                                    <div className="disease-tags">
                                        {selectedFood.goodFor.split(', ').map((d: string) => (
                                            <span key={d} className="disease-tag">{d}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="price-comparison">
                                <div className="price-header">
                                    <h4><ShoppingCart size={16} /> Live E-Commerce Comparison</h4>
                                    <span className="live-update-badge">Live Prices</span>
                                </div>
                                <div className="price-cards">
                                    {Object.entries(selectedFood.prices).map(([site, price]: any) => (
                                        <div key={site} className="price-card">
                                            <span className="site-name capitalize">{site}</span>
                                            <span className="price-val">{price}</span>
                                            <button className="buy-btn">Buy Now</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodIntel;
