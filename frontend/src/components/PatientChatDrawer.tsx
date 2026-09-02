import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { fetchNotifications, sendNotification } from '../services/notification.service';
import { getAuthToken } from '../services/client';

interface Props {
  patientName: string;
  onClose: () => void;
}

const PatientChatDrawer: React.FC<Props> = ({ patientName, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!getAuthToken()) return;
    try {
      const res = await fetchNotifications();
      // Filter inapp appointment type for this patient (mock filter by name in title/message)
      const filtered = res.notifications.filter((n: any) => n.channel === 'inapp' && (n.title.includes(patientName) || n.message.includes(patientName) || n.type === 'appointment'));
      setMessages(filtered.slice(0, 20));
    } catch {}
  };
  useEffect(() => { void load(); }, [patientName]);

  const handleSend = async () => {
    if (!input.trim() || input.trim().length < 2) return;
    setSending(true);
    try {
      await sendNotification({ title: `Chat with ${patientName}`, message: input.trim(), type: 'appointment', channel: 'inapp' });
      setMessages(prev => [{ id: `tmp-${Date.now()}`, title: `You → ${patientName}`, message: input.trim(), sentAt: new Date().toISOString(), type: 'appointment', channel: 'inapp' }, ...prev]);
      setInput('');
    } catch {}
    setSending(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '92%', height: '70vh', display: 'flex', flexDirection: 'column', padding: '1rem', position: 'fixed', bottom: '1rem', right: '1rem', maxHeight: '70vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
          <h3 style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><MessageSquare size={18} /> Chat — {patientName}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.6, padding: '1rem' }}>
              <MessageSquare size={32} />
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No messages yet — start the conversation. Stored in PostgreSQL <code>notifications</code> `channel inapp`.</p>
            </div>
          ) : messages.map((m: any) => (
            <div key={m.id} className="glass-card" style={{ padding: '0.6rem 0.8rem', alignSelf: m.title?.startsWith('You') ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.title?.startsWith('You') ? 'rgba(99,102,241,0.12)' : undefined }}>
              <strong style={{ fontSize: '0.8rem' }}>{m.title}</strong>
              <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}>{m.message}</p>
              <span className="hint-text" style={{ fontSize: '0.7rem' }}>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.6rem' }}>
          <input placeholder={`Message to ${patientName}...`} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }} maxLength={300} />
          <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending || !input.trim()}><Send size={14} /> {sending ? '...' : 'Send'}</button>
        </div>
        <span className="hint-text" style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '0.4rem' }}>Via <code>POST /notification/send</code> → PostgreSQL `notifications` → patient Inbox</span>
      </div>
    </div>
  );
};

export default PatientChatDrawer;
