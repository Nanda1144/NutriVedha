import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Check, Stethoscope, Sprout, Save, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore, type Meal } from '../store/userStore';
import './Diet.css';

const Diet: React.FC = () => {
    const { lastScanResult, saveDietPlan } = useUserStore();
    const [dietType, setDietType] = useState('ai');
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [customMeals, setCustomMeals] = useState<Meal[]>([]);

    // Determine initial diet plan based on AI Scan
    const aiSuggestedPlan = useMemo(() => {
        if (!lastScanResult) return null;

        const condition = lastScanResult.condition.toLowerCase();

        if (condition.includes('pitta')) {
            return [
                { time: "Breakfast", meal: "Cucumber & Mint Cooler with Oats", ingredients: ["Oats", "Mint", "Cucumber", "Coconut Milk"], budget: true, health: "Pitta Cooling" },
                { time: "Lunch", meal: "Sweet Potato & Mung Beans", ingredients: ["Mung Dal", "Sweet Potato", "Ghee", "Coriander"], budget: true, health: "Anti-inflammatory" },
                { time: "Dinner", meal: "Bottle Gourd Stew", ingredients: ["Lauki", "Cumin", "Ginger", "Coconut"], budget: true, health: "Digestive Support" }
            ];
        } else if (condition.includes('vata')) {
            return [
                { time: "Breakfast", meal: "Warm Ragi Porridge", ingredients: ["Ragi", "Jaggery", "Almonds", "Sesame Oil"], budget: true, health: "Vata Grounding" },
                { time: "Lunch", meal: "Steamed Rice & Lentil Soup", ingredients: ["Basmati Rice", "Toor Dal", "Turmeric", "Garlic"], budget: true, health: "Hydrating" },
                { time: "Dinner", meal: "Carrot & Ginger Creamy Soup", ingredients: ["Carrots", "Ginger", "Coconut Milk"], budget: true, health: "Warming" }
            ];
        } else {
            return [
                { time: "Breakfast", meal: "Spiced Quinoa with Apple", ingredients: ["Quinoa", "Apple", "Cardamom", "Honey"], budget: true, health: "Kapha Stimulating" },
                { time: "Lunch", meal: "Mixed Vegetable Kichdi", ingredients: ["Brown Rice", "Moong Dal", "Turmeric", "Black Pepper"], budget: true, health: "Metabolic Boost" },
                { time: "Dinner", meal: "Clear Vegetable Broth", ingredients: ["Spinach", "Bottle Gourd", "Fenugreek"], budget: true, health: "Light & Easy" }
            ];
        }
    }, [lastScanResult]);

    // Doctor specialized diet plan
    const doctorDietPlan = [
        { time: "Breakfast", meal: "Doctor's Ayurvedic Tonic + Eggs", ingredients: ["Organic Eggs", "Ashwagandha Powder", "Cow Ghee"], budget: false, health: "High Protein / Strength", isDoctorRecommended: true },
        { time: "Lunch", meal: "Spiced Chicken Broth & Veggies", ingredients: ["Lean Chicken", "Turmeric", "Broken Wheat"], budget: false, health: "Muscle Recovery", isDoctorRecommended: true },
        { time: "Dinner", meal: "Herb-Crusted Vegetable Soup", ingredients: ["Broccoli", "Cauliflower", "Black Seed Oil"], budget: false, health: "Immunity Support", isDoctorRecommended: true }
    ];

    useEffect(() => {
        if (aiSuggestedPlan) {
            setCustomMeals(aiSuggestedPlan);
        } else {
            // Default blank
            setCustomMeals([
                { time: "Breakfast", meal: "Oats & Honey", ingredients: ["Oats", "Honey"], budget: true, health: "General Wellness" },
                { time: "Lunch", meal: "Rice & Dal", ingredients: ["Rice", "Dal"], budget: true, health: "Energy" },
                { time: "Dinner", meal: "Veggie Soup", ingredients: ["Veggies"], budget: true, health: "Light" }
            ]);
        }
    }, [aiSuggestedPlan]);

    const handleEditMeal = (index: number, field: keyof Meal, value: string) => {
        const updated = [...customMeals];
        if (field === 'ingredients') {
            updated[index][field] = value.split(',').map(v => v.trim());
        } else {
            (updated[index] as any)[field] = value;
        }
        setCustomMeals(updated);
    };

    const handleSave = () => {
        saveDietPlan({
            id: Date.now(),
            date: new Date().toISOString(),
            meals: customMeals,
            scanContext: lastScanResult?.condition || "Manual",
            type: dietType
        });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="diet-page container section-padding">
            <div className="section-header">
                <h1>AI-Powered Diet Plan</h1>
                {lastScanResult ? (
                    <div className="scan-alert glass-card">
                        <ShieldCheck className="text-success" />
                        <div>
                            <p><strong>Diagnosis Detected:</strong> {lastScanResult.condition}</p>
                            <span>Generating personalized Ayurvedic plan...</span>
                        </div>
                    </div>
                ) : (
                    <p>Scan your health to get a personalized AI diet plan.</p>
                )}
            </div>

            {/* Marketplace Entry Section */}
            <div className="marketplace-banner glass-card animate-fade-in">
                <div className="banner-content">
                    <span className="banner-tag">Farmer-to-Home 🌱</span>
                    <h2>Your Ayurvedic Diet Starts at the Farm</h2>
                    <p>Direct from trusted farmers — no middlemen. Ensure purity and affordability.</p>
                    <Link to="/marketplace" className="btn btn-primary">
                        Pre-Book Natural Crops
                    </Link>
                    <span className="subtitle-farm">Direct from trusted farmers — no middlemen</span>
                </div>
                <div className="banner-illustration">
                    <Sprout size={80} className="sprout-icon" />
                </div>
            </div>

            {/* Fitness Integration Section */}
            <div className="fitness-integration-banner glass-card animate-fade-in">
                <div className="banner-visual-fit">
                    <Dumbbell size={60} className="fit-icon" />
                </div>
                <div className="banner-content">
                    <span className="banner-tag fit">Body Transformation 🌱</span>
                    <h2>"Food alone doesn’t build strength"</h2>
                    <p>Combine your Ayurvedic diet with age-specific training and mentorship.</p>
                    <Link to="/fitness" className="btn btn-primary fit-btn">
                        Sync My Fitness Plan
                    </Link>
                </div>
            </div>

            <div className="diet-tabs">
                <button className={`tab-btn ${dietType === 'ai' ? 'active' : ''}`} onClick={() => setDietType('ai')}>AI Suggested</button>
                <button className={`tab-btn ${dietType === 'doctor' ? 'active' : ''}`} onClick={() => setDietType('doctor')}>Doctor Verified</button>
                <button className={`tab-btn ${dietType === 'custom' ? 'active' : ''}`} onClick={() => setDietType('custom')}>Custom Plan</button>
            </div>

            <div className="diet-grid">
                {(dietType === 'doctor' ? doctorDietPlan : customMeals).map((p, i) => (
                    <div key={i} className={`meal-card glass-card ${p.isDoctorRecommended ? 'doctor-card-border' : ''}`}>
                        <div className="meal-header">
                            <span className="time-badge">{p.time}</span>
                            {p.isDoctorRecommended && (
                                <span className="doc-badge"><Stethoscope size={12} /> Verified</span>
                            )}
                        </div>

                        {isEditing === i && dietType !== 'doctor' ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={p.meal}
                                    onChange={(e) => handleEditMeal(i, 'meal', e.target.value)}
                                    placeholder="Meal Name"
                                />
                                <input
                                    type="text"
                                    value={p.ingredients.join(', ')}
                                    onChange={(e) => handleEditMeal(i, 'ingredients', e.target.value)}
                                    placeholder="Ingredients (comma separated)"
                                />
                                <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(null)}><Check size={16} /></button>
                            </div>
                        ) : (
                            <div className="meal-content">
                                <h3>{p.meal}</h3>
                                <p className="health-tag">{p.health}</p>
                                <div className="ingredient-list">
                                    {p.ingredients.map((ing, idx) => (
                                        <span key={idx} className="ing-tag">{ing}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="meal-actions">
                            {dietType !== 'doctor' && (
                                <button className="icon-btn" onClick={() => setIsEditing(i === isEditing ? null : i)}>
                                    <Edit2 size={16} />
                                </button>
                            )}
                            <button className="icon-btn text-danger">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="diet-footer-actions">
                <button className="btn btn-outline" onClick={() => setCustomMeals([...customMeals, { time: "Extra", meal: "New Snack", ingredients: [], budget: true, health: "Optional" }])}>
                    <Plus size={18} /> Add Meal
                </button>
                <button className={`btn ${isSaved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave}>
                    <Save size={18} /> {isSaved ? 'Plan Saved!' : 'Save This Plan'}
                </button>
            </div>
        </div>
    );
};

export default Diet;
