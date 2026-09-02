import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './Chatbot.css';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { chatHistory, addChatMessage, setAdminAuthenticated, addAdminAction, isAdminAuthenticated } = useUserStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const passkeys = ['@cC1411441', 'pavan', 'manil', 'jyo', 'janu'];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        addChatMessage({ role: 'user', content: userMsg });
        setInput('');

        // Check for Passkeys
        if (passkeys.some(key => userMsg.toLowerCase().includes(key.toLowerCase()))) {
            const matchedKey = passkeys.find(key => userMsg.toLowerCase().includes(key.toLowerCase()));
            setAdminAuthenticated(true, matchedKey!);
            addAdminAction({
                adminName: matchedKey!,
                action: 'Admin Login',
                details: `Admin access granted via passkey: ${matchedKey}`
            });

            setTimeout(() => {
                addChatMessage({
                    role: 'assistant',
                    content: `System Protocol Activated. Welcome, Admin ${matchedKey}. The Super Admin Dashboard is now accessible in your sidebar navigation.`
                });
            }, 500);
            return;
        }

        // Knowledge Base Response Logic
        setTimeout(() => {
            let response = "I'm analyzing your request. Can you tell me more about your health goals?";
            const msg = userMsg.toLowerCase().trim();

            // Check for Passkeys inside the timeout too for consistent feedback
            const foundKey = passkeys.find(key => msg.includes(key.toLowerCase()));
            if (foundKey) {
                setAdminAuthenticated(true, foundKey);
                addAdminAction({
                    adminName: foundKey,
                    action: 'Admin Login',
                    details: `Super Admin session initialized via Chatbot passkey: ${foundKey}`
                });

                const response = `PROTOCOL ACCEPTED. Welcome back, Admin ${foundKey}. I have unlocked the Super Admin Dashboard for you.`;
                addChatMessage({ role: 'assistant', content: response });

                // Add a special message with a button
                setTimeout(() => {
                    addChatMessage({
                        role: 'assistant',
                        content: `You can access the control panel via the sidebar or by clicking the button below.`,
                    });
                }, 500);
                return;
            }

            if (msg.includes('diet') || msg.includes('food')) {
                response = "AyurAI offers a personalized Diet module. We analyze your body type (Prakriti) and current health state to recommend specific Ayurvedic foods. You can also explore our Food Intelligence Hub for 100+ superfood insights.";
            } else if (msg.includes('scan') || msg.includes('disease')) {
                response = "Our AI Disease Scan uses computer vision to analyze physical symptoms. Once scanned, our neural engine provides Ayurvedic recommendations and connects you with specialized doctors if needed.";
            } else if (msg.includes('fitness') || msg.includes('workout') || msg.includes('gym')) {
                response = "The Fitness module is tailored to your age stage and body goal (Bulk, Skinny, or Cut). It includes Yoga classes, strength training, and a Progress tracker to monitor your transformation.";
            } else if (msg.includes('admin') || msg.includes('login') || msg.includes('access')) {
                response = "Standard user access is enabled. If you are a system administrator, please provide your authorized neural passkey (e.g., @cC1411441, pavan, etc.) to unlock restricted zones.";
            } else if (msg.includes('who are you') || msg.includes('help')) {
                response = "I am AyurAI Intelligence, your unified health companion. I can guide you through our AI Scans, Personalized Diets, Fitness Plans, and Telemedicine services.";
            }

            addChatMessage({ role: 'assistant', content: response });
        }, 800);
    };

    return (
        <div className={`chatbot-wrapper ${isOpen ? 'open' : ''}`}>
            {/* Hover Trigger */}
            {!isOpen && (
                <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
                    <div className="bot-pulse"></div>
                    <Bot size={28} />
                    <span className="trigger-tooltip">Chat with AyurAI</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window glass-card">
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="bot-avatar">
                                <Bot size={20} />
                                <div className="online-dot"></div>
                            </div>
                            <div>
                                <h4>AyurAI Intelligence</h4>
                                <span className="status">Neural Engine Active</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
                    </div>

                    <div className="chat-messages" ref={scrollRef}>
                        {chatHistory.map((m) => (
                            <div key={m.id} className={`message-row ${m.role}`}>
                                <div className="msg-icon">
                                    {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                                </div>
                                <div className="msg-bubble">
                                    <p>{m.content}</p>
                                    {m.content.includes('unlocked the Super Admin') && (
                                        <Link to="/admin-control" className="admin-msg-btn" onClick={() => setIsOpen(false)}>
                                            Open Admin Panel <ArrowRight size={14} />
                                        </Link>
                                    )}
                                    <span className="msg-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        ))}
                        {isAdminAuthenticated && (
                            <div className="admin-status-node">
                                <ShieldCheck size={14} />
                                <span>Administrative Session Active - {useUserStore.getState().adminKeyMember}</span>
                            </div>
                        )}
                    </div>

                    <div className="chat-input-area">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Ask anything about AyurAI..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
