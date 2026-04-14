import React, { useState } from 'react';
import { Hand, Volume2, Type, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import './SignAI.css';

const SignAI: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [detectedText, setDetectedText] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const startRecording = () => {
        setIsRecording(true);
        setLoading(true);
        setDetectedText("");

        // Simulate AI processing
        setTimeout(() => {
            const result = "Namaste, I need help with my digestion.";
            setDetectedText(result);
            setHistory(prev => [result, ...prev].slice(0, 5));
            setLoading(false);
            setIsRecording(false);

            // Simulate Speak
            const utterance = new SpeechSynthesisUtterance(result);
            window.speechSynthesis.speak(utterance);
        }, 3000);
    };

    return (
        <div className="sign-ai-page container section-padding">
            <div className="section-header">
                <h1>Universal Sign AI</h1>
                <p>Bridging the communication gap for inclusive healthcare using Neural Networks.</p>
            </div>

            <div className="sign-container">
                {/* Live Camera Feed */}
                <div className="sign-camera-box glass-card">
                    <div className="camera-header">
                        <div className="status-group">
                            <span className="live-pill">LIVE FEED</span>
                            <span className="neural-active">NEURAL ENGINE ACTIVE</span>
                        </div>
                        <span className="res-pill">1280x720 • 60 FPS</span>
                    </div>

                    <div className="camera-view-sign">
                        <div className="camera-overlay-sign">
                            <div className="scanning-corners">
                                <div className="corner tl"></div>
                                <div className="corner tr"></div>
                                <div className="corner bl"></div>
                                <div className="corner br"></div>
                            </div>

                            {isRecording && (
                                <div className="neural-skeleton">
                                    <div className="skeletal-hand"></div>
                                    <div className="tracking-blob"></div>
                                </div>
                            )}

                            <div className="center-feedback">
                                <Hand size={64} className={`camera-icon ${isRecording ? 'recording' : ''}`} />
                                <p>{isRecording ? "Interpreting Gestures..." : "Raise hands to begin"}</p>
                            </div>
                        </div>

                        <div className="sign-controls">
                            <button
                                className={`record-btn ${isRecording ? 'active' : ''}`}
                                onClick={startRecording}
                                disabled={isRecording}
                            >
                                {isRecording ? <RefreshCw className="animate-spin" /> : <div className="inner-circle"></div>}
                            </button>
                            <span className="btn-label">{isRecording ? "Neural Analysis..." : "Capture Sign"}</span>
                        </div>
                    </div>
                </div>

                {/* Translation Results */}
                <div className="translation-box">
                    <div className="result-card glass-card">
                        <div className="result-header">
                            <Type size={18} />
                            <h4>Neural Text Output</h4>
                        </div>
                        <div className="text-output">
                            {loading ? (
                                <div className="skeleton-pulse">Decoding signs...</div>
                            ) : detectedText ? (
                                <div className="output-rich">
                                    <p className="fade-in">{detectedText}</p>
                                    <span className="conf-score">98.2% Confidence</span>
                                </div>
                            ) : (
                                <p className="placeholder-text">Perform a sign to see interpretation</p>
                            )}
                        </div>
                    </div>

                    <div className="result-card glass-card">
                        <div className="result-header">
                            <Volume2 size={18} />
                            <h4>Audio Synthesis</h4>
                        </div>
                        <div className="voice-output">
                            <button
                                className={`play-btn ${detectedText ? 'visible' : ''}`}
                                disabled={!detectedText}
                                onClick={() => {
                                    const utterance = new SpeechSynthesisUtterance(detectedText);
                                    window.speechSynthesis.speak(utterance);
                                }}
                            >
                                <Volume2 size={24} /> Play Voice Analysis
                            </button>
                            {!detectedText && <p className="placeholder-text">Audio feedback will auto-play on output</p>}
                        </div>
                    </div>

                    <div className="history-card glass-card">
                        <h5>Recent Interpretations</h5>
                        <div className="history-list">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className="history-item">
                                    <Clock size={12} /> {h}
                                </div>
                            )) : (
                                <span className="no-history">No history yet</span>
                            )}
                        </div>
                    </div>

                    <div className="instruction-card glass-card">
                        <h5><AlertCircle size={16} /> Best Practices</h5>
                        <ul className="mini-instructions">
                            <li>Keep palms facing the camera</li>
                            <li>Slow, deliberate movements</li>
                            <li>Avoid busy backgrounds</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignAI;
