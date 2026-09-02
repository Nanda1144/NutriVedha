import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, User, MapPin, Award, Sprout, Calendar, TrendingDown, Info, Check, BarChart3, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Marketplace.css';

const Marketplace: React.FC = () => {
    const [view, setView] = useState<'grid' | 'detail' | 'farmer' | 'bookings'>('grid');
    const [selectedCrop, setSelectedCrop] = useState<any>(null);
    const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const addCropBooking = useUserStore(state => state.addCropBooking);
    const cropBookings = useUserStore(state => state.cropBookings);

    const crops = [
        {
            id: 1,
            name: "Organic Amla (Pratapgarh)",
            image: "https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?auto=format&fit=crop&q=80&w=600",
            category: "Ayurvedic Grade",
            harvestDate: "Oct 2026",
            price: 85,
            marketPrice: 120,
            recommended: true,
            farmer: {
                name: "Ram Singh",
                location: "Pratapgarh, UP",
                experience: "25 Years",
                verified: true,
                crops: ["Amla", "Aloe Vera", "Neem"],
                impact: "Supports 100% natural farming in his village."
            },
            description: "Grown without any synthetic fertilizers. These Amlas are high in Vitamin C and perfect for Triphala preparations.",
            benefits: "Boosts immunity, improves skin health, and supports digestion.",
            dietSupport: "Immunity Booster & Detox Diet"
        },
        {
            id: 2,
            name: "Chemical-Free Turmeric",
            image: "https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=600",
            category: "Natural",
            harvestDate: "Jan 2027",
            price: 140,
            marketPrice: 190,
            recommended: true,
            farmer: {
                name: "Savitri Devi",
                location: "Erode, Tamil Nadu",
                experience: "15 Years",
                verified: true,
                crops: ["Turmeric", "Ginger"],
                impact: "Helps preserve native turmeric varieties."
            },
            description: "Traditional Erode turmeric variety with high curcumin content. Harvested at peak maturity for maximum potency.",
            benefits: "Anti-inflammatory, improves joint health, and blood purifier.",
            dietSupport: "Anti-Inflammatory Plan"
        },
        {
            id: 3,
            name: "Native Ashwagandha Roots",
            image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
            category: "Ayurvedic Grade",
            harvestDate: "Nov 2026",
            price: 420,
            marketPrice: 550,
            recommended: false,
            farmer: {
                name: "Gopal Mandloi",
                location: "Neemuch, MP",
                experience: "30 Years",
                verified: true,
                crops: ["Ashwagandha", "Shatavari"],
                impact: "Empowering local tribal farmers through collective farming."
            },
            description: "Harvested from the dry lands of Neemuch. These roots are sun-dried using traditional methods to preserve their 'Ojas' building properties.",
            benefits: "Reduces stress, improves sleep quality, and boosts energy.",
            dietSupport: "Stress Relief & Vitality Diet"
        }
    ];

    const [qtyError, setQtyError] = useState<string | null>(null);

    const handleQtyChange = (delta: number) => {
        setQtyError(null);
        const next = quantity + delta;
        if (next < 1) {
            setQtyError('Minimum 1kg');
            return;
        }
        if (next > 20) {
            setQtyError('Max 20kg per booking (contact farmer for bulk)');
            return;
        }
        setQuantity(next);
    };

    const handlePreBook = () => {
        if (!selectedCrop) return;
        if (quantity < 1 || quantity > 20) {
            setQtyError('Quantity must be 1–20kg');
            return;
        }
        const existing = cropBookings.find((b: any) => b.crop.id === selectedCrop.id && b.status === 'Growing');
        if (existing) {
            if (!window.confirm(`You already have ${existing.quantity}kg of ${selectedCrop.name} growing. Add ${quantity}kg more?`)) return;
        }
        const booking = {
            id: `BK-${Date.now()}`,
            crop: selectedCrop,
            quantity,
            totalPrice: (selectedCrop.price * quantity) + 40,
            status: 'Growing' as const,
            orderDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            paymentIntentId: `pi_sim_${Math.random().toString(36).slice(2, 9)}`
        };
        addCropBooking(booking);
        setBookingSuccess(true);
        setTimeout(() => {
            setBookingSuccess(false);
            setView('bookings');
            setQuantity(1);
        }, 1200);
    };

    const handleModifyQty = (booking: any, delta: number) => {
        const newQty = booking.quantity + delta;
        if (newQty < 1) { alert('Minimum 1kg — use Cancel instead.'); return; }
        if (newQty > 20) { alert('Max 20kg'); return; }
        // update in store by removing and re-adding (simple frontend patch)
        const updated = { ...booking, quantity: newQty, totalPrice: (booking.crop.price * newQty) + 40 };
        // Zustand store doesn't have update, so we hack via localStorage patch + reload bookings view
        const store = useUserStore.getState();
        (store as any).cropBookings = (store as any).cropBookings.map((b: any) => b.id === booking.id ? updated : b);
        useUserStore.setState({ cropBookings: (store as any).cropBookings });
    };

    const handleRepeatBooking = (booking: any) => {
        setSelectedCrop(booking.crop);
        setQuantity(booking.quantity);
        setView('detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelBooking = (id: string) => {
        if (!window.confirm('Cancel this pre-booking? Farmer will be notified.')) return;
        const store = useUserStore.getState();
        (store as any).cropBookings = (store as any).cropBookings.filter((b: any) => b.id !== id);
        useUserStore.setState({ cropBookings: (store as any).cropBookings });
    };

    return (
        <div className="marketplace-page container section-padding">
            {/* Header / Nav */}
            <div className="marketplace-header glass-card">
                <div className="market-nav">
                    <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Marketplace</button>
                    <button className={view === 'bookings' ? 'active' : ''} onClick={() => setView('bookings')}>My Pre-Bookings</button>
                </div>
                <div className="disclaimer-banner">
                    <Info size={16} />
                    <span>Crop availability depends on seasonal and natural conditions.</span>
                </div>
            </div>

            {/* Grid View */}
            {view === 'grid' && (
                <div className="market-content animate-fade-in">
                    <div className="section-header">
                        <h1>Farm-to-Home Marketplace</h1>
                        <p>Direct from trusted farmers — ensuring purity, affordability, and fair profits.</p>
                    </div>

                    <div className="impact-summary-mini animate-fade-in">
                        <div className="impact-card-mini">
                            <BarChart3 size={24} />
                            <div>
                                <h4>100% Transparency</h4>
                                <p>No Middlemen. Full Profit to Farmers.</p>
                            </div>
                        </div>
                        <div className="impact-card-mini">
                            <TrendingDown size={24} />
                            <div>
                                <h4>30% Avg. Savings</h4>
                                <p>Lower costs than market retail.</p>
                            </div>
                        </div>
                    </div>

                    <div className="crop-grid">
                        {crops.map(crop => (
                            <div key={crop.id} className="crop-card glass-card" onClick={() => { setSelectedCrop(crop); setView('detail'); }}>
                                <div className="crop-img-wrapper">
                                    <img src={crop.image} alt={crop.name} />
                                    <span className={`farming-badge ${crop.category.toLowerCase().replace(' ', '-')}`}>{crop.category}</span>
                                    {crop.recommended && <span className="rec-tag"><Check size={12} /> Recommended for You</span>}
                                </div>
                                <div className="crop-info">
                                    <h3>{crop.name}</h3>
                                    <div className="crop-meta">
                                        <span><Calendar size={14} /> {crop.harvestDate}</span>
                                        <span className="price">₹{crop.price}/kg <small>₹{crop.marketPrice}</small></span>
                                    </div>
                                    <button className="btn btn-outline btn-sm btn-full">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="trust-section">
                        <div className="trust-card glass-card">
                            <ShieldCheck size={32} />
                            <h3>No Middlemen</h3>
                            <p>Direct handshake between you and the soil-carer.</p>
                        </div>
                        <div className="trust-card glass-card">
                            < Award size={32} />
                            <h3>Fair Farmer Profit</h3>
                            <p>100% of the crop price goes into farmers' hands.</p>
                        </div>
                        <div className="trust-card glass-card">
                            <Sprout size={32} />
                            <h3>Natural & Fresh</h3>
                            <p>Chemical-free crops grown with love and Ayurveda.</p>
                        </div>
                    </section>
                </div>
            )}

            {/* Detail View */}
            {view === 'detail' && selectedCrop && (
                <div className="crop-detail animate-fade-in">
                    <button className="back-link" onClick={() => setView('grid')}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Marketplace</button>

                    <div className="detail-layout">
                        <div className="detail-visuals">
                            <img src={selectedCrop.image} alt={selectedCrop.name} className="main-crop-img glass-card" />
                            <div className="farmer-preview glass-card" onClick={() => { setSelectedFarmer(selectedCrop.farmer); setView('farmer'); }}>
                                <div className="farmer-avatar">
                                    <User size={30} />
                                </div>
                                <div className="farmer-meta">
                                    <h4>{selectedCrop.farmer.name}</h4>
                                    <p><MapPin size={12} /> {selectedCrop.farmer.location}</p>
                                    <span className="verify-badge"><ShieldCheck size={12} /> Verified Expert</span>
                                </div>
                                <ChevronRight size={20} />
                            </div>
                        </div>

                        <div className="detail-info-pane glass-card">
                            <span className="category-tag">{selectedCrop.category}</span>
                            <h1>{selectedCrop.name}</h1>
                            <p className="description">{selectedCrop.description}</p>

                            <div className="benefit-pills">
                                <div className="benefit-pill">
                                    <Sprout size={16} />
                                    <span>{selectedCrop.benefits}</span>
                                </div>
                                <div className="benefit-pill highlight">
                                    <Award size={16} />
                                    <span>Supports: {selectedCrop.dietSupport}</span>
                                </div>
                            </div>

                            <div className="booking-controls">
                                <div className="qty-selector">
                                    <label>Quantity (kg) — min 1, max 20</label>
                                    <div className="qty-btns">
                                        <button onClick={() => handleQtyChange(-1)} disabled={quantity <= 1}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={() => handleQtyChange(1)} disabled={quantity >= 20}>+</button>
                                    </div>
                                    {qtyError && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{qtyError}</span>}
                                </div>

                                <div className="price-breakdown">
                                    <div className="price-row"><span>Farmer Price</span> <span>₹{selectedCrop.price * quantity}</span></div>
                                    <div className="price-row"><span>Delivery (flat)</span> <span>₹40</span></div>
                                    <div className="price-total"><span>Total</span> <span>₹{(selectedCrop.price * quantity) + 40}</span></div>
                                    <div className="savings-tag">You save ₹{(selectedCrop.marketPrice - selectedCrop.price) * quantity} compared to market</div>
                                </div>

                                <button className={`btn btn-primary btn-full ${bookingSuccess ? 'btn-success' : ''}`} onClick={handlePreBook}>
                                    {bookingSuccess ? <><Check /> Booking Confirmed!</> : <><ShoppingBag /> Pre-Book from Farmer</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Farmer Profile View */}
            {view === 'farmer' && selectedFarmer && (
                <div className="farmer-profile animate-fade-in">
                    <button className="back-link" onClick={() => setView('detail')}><ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Crop</button>

                    <div className="farmer-hero glass-card">
                        <div className="farmer-large-avatar">
                            <User size={80} />
                        </div>
                        <div className="farmer-hero-info">
                            <div className="name-row">
                                <h1>{selectedFarmer.name}</h1>
                                <span className="badge-expert">Verified Natural Farmer</span>
                            </div>
                            <p><MapPin size={16} /> {selectedFarmer.location} • {selectedFarmer.experience} experience</p>
                            <div className="farmer-badges">
                                <span className="f-badge"><Check size={14} /> AyurAI Partner</span>
                                <span className="f-badge"><Check size={14} /> Organic Certified</span>
                            </div>
                        </div>
                    </div>

                    <div className="farmer-grid">
                        <div className="farmer-about glass-card">
                            <h3>About the Farmer</h3>
                            <p>{selectedFarmer.impact}</p>
                            <div className="crops-list">
                                <h4>Crops Cultivated:</h4>
                                <div className="tags">
                                    {selectedFarmer.crops.map((c: string) => <span key={c} className="tag">{c}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="impact-dashboard glass-card">
                            <h3>Farmer Impact Dashboard</h3>
                            <div className="impact-stats">
                                <div className="impact-stat">
                                    <TrendingDown size={24} className="text-success" />
                                    <h4>0% Commission</h4>
                                    <p>100% farmer price goes direct.</p>
                                </div>
                                <div className="impact-stat">
                                    <Sprout size={24} className="text-primary" />
                                    <h4>Regenerative</h4>
                                    <p>Traditional methods supported.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* My Bookings View */}
            {view === 'bookings' && (
                <div className="bookings-view animate-fade-in">
                    <div className="section-header">
                        <h1>My Pre-Bookings</h1>
                        <p>Track your farm-direct Ayurvedic supply chain.</p>
                    </div>

                    {cropBookings.length > 0 ? (
                        <div className="bookings-list">
                            {cropBookings.map(booking => (
                                <div key={booking.id} className="booking-card glass-card">
                                    <div className="booking-main">
                                        <img src={booking.crop.image} alt={booking.crop.name} />
                                        <div className="booking-info">
                                            <h3>{booking.crop.name}</h3>
                                            <p>Ordered: {booking.orderDate} • Qty: {booking.quantity}kg</p>
                                            <div className="farmer-tag">Farmer: {booking.crop.farmer.name}</div>
                                        </div>
                                        <div className="booking-status-tag">{booking.status}</div>
                                    </div>

                                    <div className="delivery-tracker">
                                        <div className="tracker-steps">
                                            {['Growing', 'Harvested', 'Packed', 'Out for Delivery', 'Delivered'].map((step, idx, arr) => (
                                                <div key={step} className={`step ${booking.status === step ? 'active' : ''} ${arr.indexOf(booking.status) > idx ? 'completed' : ''}`}>
                                                    <div className="dot"></div>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="delivery-note">Delivered by AyurAI verified delivery partners</p>
                                    </div>

                                    <div className="booking-actions">
                                        <button className="btn btn-outline btn-sm" onClick={() => handleModifyQty(booking, -1)} title="Decrease 1kg">−1kg</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => handleModifyQty(booking, 1)} title="Increase 1kg">+1kg</button>
                                        <button className="btn btn-outline btn-sm" onClick={() => handleRepeatBooking(booking)}>Repeat</button>
                                        <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                                    </div>
                                    <span className="hint-text" style={{ fontSize: '0.75rem', marginTop: '0.4rem', display: 'block' }}>Payment: {booking.paymentIntentId || 'pi_sim_...'} • Total ₹{booking.totalPrice}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state glass-card">
                            <Sprout size={60} />
                            <h3>No Active Pre-Bookings</h3>
                            <p>Connect with a farmer to start your fresh Ayurvedic journey.</p>
                            <button className="btn btn-primary" onClick={() => setView('grid')}>Browse Marketplace</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
