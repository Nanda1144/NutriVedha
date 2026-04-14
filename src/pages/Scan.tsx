import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, AlertCircle, CheckCircle, Info, Upload, Image as ImageIcon } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import './Scan.css';

const Scan: React.FC = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [report, setReport] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addReport, addScannedImage } = useUserStore();

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
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                startScan();
            };
            reader.readAsDataURL(file);
        }
    };

    const startScan = () => {
        if (!selectedImage && !isScanning) {
            fileInputRef.current?.click();
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
            setIsScanning(false);
            const result = scanResults[Math.floor(Math.random() * scanResults.length)];
            setReport(result);

            // Save to global history
            addReport({
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                ...result as any
            });
            if (selectedImage) addScannedImage(selectedImage);
        }
    }, [isScanning, progress]);

    const resetScan = () => {
        setReport(null);
        setSelectedImage(null);
        setProgress(0);
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
                                    </div>
                                ) : (
                                    !isScanning && (
                                        <div className="scan-actions-group">
                                            <button className="btn btn-primary" onClick={startScan}>
                                                <RefreshCw size={20} /> Re-scan Image
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
                                <button className="btn btn-outline" onClick={() => window.print()}>Save Evidence</button>
                            </div>
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
