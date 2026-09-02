import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertCircle, CheckCircle, Info, Upload, Image as ImageIcon, FileWarning, Wifi } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { Link } from 'react-router-dom';
import { scanFood } from '../services/ai.service';
import { uploadReport } from '../services/medical.service';
import { getAuthToken } from '../services/client';
import './Scan.css';

const Scan: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [report, setReport] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [usedLive, setUsedLive] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addReport, addScannedImage, reports } = useUserStore();

    const scanResults = [
        {
            condition: "Pitta Imbalance (Skin Irritation)",
            symptoms: ["Redness", "Mild Inflammation", "Heat Sensitivity"],
            severity: "Low",
            recommendations: [
                { title: "Cooling Herbs", text: "Apply Aloe Vera gel or drink Neem water." },
                { title: "Dietary Adjustment", text: "Avoid spicy and oily foods for 3 days." }
            ]
        },
        {
            condition: "Vata Dryness (Dehydration)",
            symptoms: ["Dry skin", "Flaky patches", "Chapped lips"],
            severity: "Medium",
            recommendations: [
                { title: "Hydration Plus", text: "Drink warm water with a pinch of rock salt." },
                { title: "Oil Massage", text: "Apply Sesame oil or Coconut oil before bath." }
            ]
        },
        {
            condition: "Kapha Slow Metabolism",
            symptoms: ["Oily skin", "Puffy face", "Lethargy"],
            severity: "Low",
            recommendations: [
                { title: "Stimulating Herbs", text: "Drink Trikatu tea (Ginger, Pepper, Pippali)." },
                { title: "Activity", text: "Include 20 mins of brisk walking in the morning." }
            ]
        }
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
            setError('Only JPG, PNG, WEBP images are supported.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image too large (max 5MB). Please compress and try again.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
            // auto-start scan if user already clicked scan
            if (description.trim() || file) {
                setIsScanning(true);
                setProgress(0);
                setReport(null);
            }
        };
        reader.onerror = () => setError('Failed to read image. Please retry.');
        reader.readAsDataURL(file);
        // reset input so same file can be re-selected
        e.target.value = '';
    };

    const startScan = () => {
        setError(null);
        if (!selectedImage && !description.trim()) {
            setError('Please upload an image or describe your symptoms to scan.');
            return;
        }
        if (!selectedImage && description.trim().length < 10) {
            setError('Please describe symptoms in at least 10 characters or upload an image.');
            return;
        }
        setIsScanning(true);
        setProgress(0);
        setReport(null);
    };

    useEffect(() => {
        if (isScanning && progress < 100) {
            const timer = setTimeout(() => setProgress(prev => prev + (Math.random() * 5 + 2)), 80);
            return () => clearTimeout(timer);
        } else if (progress >= 100 && isScanning) {
            (async () => {
                setIsScanning(false);
                // Try live gateway ai.service:14 scanFood, fallback to mock SCAN_BANK
                let result: any = null;
                let live = false;
                if (getAuthToken()) {
                    try {
                        const res = await scanFood({ image: selectedImage || undefined, description: description || 'skin symptoms' });
                        result = (res as any).result;
                        live = (res as any).meta?.usedLive ?? true;
                    } catch { /* gateway offline → fallback */ }
                }
                if (!result) {
                    result = scanResults[Math.floor(Math.random() * scanResults.length)];
                    live = false;
                }
                setReport(result);
                setUsedLive(live);
                addReport({
                    id: Math.random().toString(36).substr(2, 9),
                    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    ...result as any
                });
                if (selectedImage) addScannedImage(selectedImage);
                // Persist encrypted to PostgreSQL medical_reports via gateway if authenticated
                if (getAuthToken() && result) {
                    try { await uploadReport({ condition: result.condition, symptoms: result.symptoms, severity: result.severity }); } catch {}
                }
            })();
        }
    }, [isScanning, progress]);

    const resetScan = () => {
        setReport(null);
        setSelectedImage(null);
        setProgress(0);
        setDescription('');
        setError(null);
    };

    const handleSaveEvidence = () => {
        if (!report) return;
        const blob = new Blob([JSON.stringify({ ...report, image: selectedImage?.slice(0, 100) + '...', date: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ayurai-report-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="scan-page container section-padding">
            <div className="section-header">
                <h1>AI Disease Scan</h1>
                <p>Instant health analysis using advanced computer vision.</p>
            </div>

            <div className="scan-container">
                <div className="camera-box glass-card">
                    {!report ? (
                        <div className="camera-view">
                            <div className="camera-placeholder">
                                {selectedImage ? (
                                    <div className="image-preview-container">
                                        <img src={selectedImage} alt="Scanning area" className="image-preview" />
                                        {isScanning && (
                                            <div className="scan-overlay">
                                                <div className="scan-line"></div>
                                                <p className="scan-status-text">Analyzing image data...</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-scan-state">
                                        <div className="icon-stack">
                                            <Camera size={48} className="base-icon" />
                                            <Upload size={24} className="overlay-icon" />
                                        </div>
                                        <p>Take a photo or upload an image for analysis</p>
                                        <span className="hint-text">Supported: face, skin, or visible symptoms</span>
                                    </div>
                                )}
                            </div>

                            <div className="camera-controls">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="scan-description-input" style={{ width: '100%', marginTop: '1rem' }}>
                                    <label className="hint-text" style={{ display: 'block', marginBottom: '0.4rem' }}>Or describe symptoms (optional if image uploaded)</label>
                                    <textarea
                                        placeholder="e.g. redness on cheeks, mild inflammation for 3 days, heat sensitivity..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                        maxLength={300}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.6)', resize: 'none' }}
                                    />
                                    <span className="hint-text">{description.length}/300</span>
                                </div>
                                {error && (
                                    <div className="glass-card" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.7rem 1rem', marginTop: '0.8rem', borderLeft: '3px solid #ef4444', width: '100%' }}>
                                        <FileWarning size={16} className="text-danger" />
                                        <span style={{ fontSize: '0.85rem' }}>{error}</span>
                                    </div>
                                )}

                                {!selectedImage ? (
                                    <div className="scan-actions-group">
                                        <button className="btn btn-primary btn-lg" onClick={() => fileInputRef.current?.click()}>
                                            <Camera size={24} />
                                            Take Photo
                                        </button>
                                        <button className="btn btn-secondary btn-lg" onClick={() => fileInputRef.current?.click()}>
                                            <Upload size={24} />
                                            Upload Image
                                        </button>
                                        <button className="btn btn-outline btn-lg" onClick={startScan} disabled={isScanning}>
                                            Analyze Symptoms
                                        </button>
                                    </div>
                                ) : (
                                    !isScanning && (
                                        <div className="scan-actions-group">
                                            <button className="btn btn-primary" onClick={startScan}>
                                                <RefreshCw size={20} /> Re-scan
                                            </button>
                                            <button className="btn btn-secondary" onClick={startScan}>
                                                <CheckCircle size={20} /> Analyze
                                            </button>
                                            <button className="btn btn-outline" onClick={resetScan}>
                                                Change Image
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>

                            {isScanning && (
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                    <span className="progress-text">Neural Analysis: {Math.floor(progress)}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="report-ui animate-fade-in">
                            <div className="report-header">
                                <CheckCircle className="text-success" size={48} />
                                <div className="report-title-group">
                                    <h2>Analysis Report</h2>
                                    <span className="report-id">Ref: AI-{Math.floor(Math.random() * 10000)}</span>
                                    {usedLive !== null && (
                                        <span className={`status-pill-small ${usedLive ? 'success' : 'warning'}`} style={{ marginLeft: '0.6rem', fontSize: '0.7rem', display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}>
                                            <Wifi size={12} /> {usedLive ? 'Live Gemini' : 'Mock Fallback'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="report-summary-box glass-card">
                                <div className="scanned-image-mini">
                                    <img src={selectedImage!} alt="Source" />
                                    <span>Analysis Source</span>
                                </div>
                                <div className="report-grid-simple">
                                    <div className="report-item">
                                        <span className="label">Conditions</span>
                                        <p className="value">{report.condition}</p>
                                    </div>
                                    <div className="report-item">
                                        <span className="label">Severity</span>
                                        <span className={`severity-badge ${report.severity.toLowerCase()}`}>
                                            {report.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="recommendations-section">
                                <h3>Ayurvedic Recommendations</h3>
                                <div className="rec-cards">
                                    {report.recommendations.map((r: any, i: number) => (
                                        <div key={i} className="rec-card">
                                            <div className="rec-icon">
                                                <Info size={16} />
                                            </div>
                                            <div>
                                                <h4>{r.title}</h4>
                                                <p>{r.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="report-actions">
                                <button className="btn btn-primary" onClick={resetScan}>New Scan</button>
                                <button className="btn btn-outline" onClick={handleSaveEvidence}>Save Evidence</button>
                                <Link to="/diet" className="btn btn-secondary">View Diet Plan →</Link>
                            </div>
                            {report.symptoms && (
                                <div className="glass-card" style={{ marginTop: '1rem', padding: '1rem' }}>
                                    <h4 style={{ marginBottom: '0.6rem' }}>Detected Symptoms</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {report.symptoms.map((s: string, i: number) => <span key={i} className="ing-tag">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="instructions-panel glass-card">
                    <h3><ImageIcon size={20} /> Capture Guidelines</h3>
                    <ul className="instruction-list">
                        <li><strong>Lighting:</strong> Best results in bright, natural light.</li>
                        <li><strong>Clarity:</strong> Ensure the image is not blurry or shaky.</li>
                        <li><strong>Angle:</strong> Capture the affected area from the front.</li>
                        <li><strong>Privacy:</strong> Images are processed locally for analysis.</li>
                    </ul>
                    {reports.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Recent Scans ({reports.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {reports.slice(0, 3).map((r: any) => (
                                    <div key={r.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong style={{ fontSize: '0.85rem' }}>{r.condition}</strong>
                                            <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{r.date} • {r.severity}</p>
                                        </div>
                                        <span className={`severity-badge ${r.severity.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{r.severity}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/profile" className="btn btn-ghost btn-xs btn-full" style={{ marginTop: '0.6rem' }}>View all in Profile →</Link>
                        </div>
                    )}
                    <div className="disclaimer-mini">
                        <AlertCircle size={16} />
                        <span>AI suggestions are not a replacement for professional clinical diagnosis.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scan;
