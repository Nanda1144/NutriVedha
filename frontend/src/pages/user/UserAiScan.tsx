import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { scanFood } from '../../services/ai.service';
import { uploadReport } from '../../services/medical.service';
import { getAuthToken } from '../../services/client';
import { useUserStore } from '../../store/userStore';
import '../../styles/user.css';

const UserAiScan: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { addReport, addScannedImage } = useUserStore();

  const start = async () => {
    if (!image && desc.trim().length < 10) { setError('Upload image or describe at least 10 chars'); return; }
    setError(null); setScanning(true); setProgress(0); setResult(null);
  };

  useEffect(() => {
    if (!scanning) return;
    if (progress < 100) {
      const t = setTimeout(() => setProgress(p => Math.min(100, p + Math.random()*8+3)), 90);
      return () => clearTimeout(t);
    } else {
      (async () => {
        setScanning(false);
        let live=false, res:any=null;
        if (getAuthToken()) {
          try { const r=await scanFood({ image: image||undefined, description: desc||'skin symptoms'}); res=(r as any).result; live=true; } catch {}
        }
        if (!res) {
          const mocks = [
            { condition:'Pitta Imbalance (AI observation)', symptoms:['Redness','Heat Sensitivity'], severity:'Low', recommendations:[{title:'Cooling Herbs',text:'Aloe vera, neem water'}], doctorNote: null },
            { condition:'Vata Dryness (AI observation)', symptoms:['Dryness','Flaky'], severity:'Medium', recommendations:[{title:'Hydration',text:'Warm water + rock salt'}], doctorNote: 'Pending doctor review' },
          ];
          res = mocks[Math.floor(Math.random()*mocks.length)];
        }
        setResult(res); setIsLive(live);
        addReport({ id: Math.random().toString(36).slice(2,9), date: new Date().toLocaleDateString('en-IN'), ...res });
        if (image) addScannedImage(image);
        if (getAuthToken() && res) try{ await uploadReport({ condition: res.condition, symptoms: res.symptoms, severity: res.severity}); }catch{}
      })();
    }
  }, [scanning, progress]);

  return (
    <div>
      <section className="user-hero">
        <div className="user-hero__inner">
          <div>
            <h1>AI Scan</h1>
            <p>Upload / Camera → Preview → Start Scan → Scanning → AI Processing → Result → Recommendation → Doctor Review.</p>
          </div>
          <img src="/hero.png" alt="AI Scan" className="user-hero__img" />
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin:'0 auto', padding:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:16 }}>
          <div className="user-card" style={{ padding:20, position:'relative', overflow:'hidden' }}>
            {!result ? (
              <>
                <div style={{ minHeight:220, border:'2px dashed #e8ecec', borderRadius:30, display:'grid', placeItems:'center', position:'relative', overflow:'hidden', background:'#fdfcf8' }}>
                  {image ? (
                    <div style={{ position:'relative', width:'100%', height:220 }}>
                      <img src={image} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:30 }} />
                      {scanning && <div className="scan-beam" />}
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', padding:20 }}>
                      <Camera size={40} color="var(--user-primary)" />
                      <p style={{ marginTop:8, fontWeight:700 }}>Take photo or upload image</p>
                      <p style={{ color:'var(--user-muted)', fontSize:'0.85rem' }}>Face, skin, visible symptoms</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={e=>{
                  const f=e.target.files?.[0]; if(!f) return;
                  if(f.size>5*1024*1024){ setError('Max 5MB'); return; }
                  const r=new FileReader(); r.onloadend=()=>setImage(r.result as string); r.readAsDataURL(f);
                }} />
                <textarea placeholder="Or describe symptoms (e.g. redness 3 days, heat sensitivity)" value={desc} onChange={e=>setDesc(e.target.value)} rows={2} maxLength={300} style={{ width:'100%', marginTop:12, borderRadius:30, border:'1px solid #e8ecec', padding:'12px 16px' }} />
                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                  <button onClick={()=>fileRef.current?.click()} className="btn btn-primary" style={{ borderRadius:30, background:'var(--user-primary)', color:'white', padding:'10px 16px', fontWeight:800, fontFamily:'"Times New Roman"' }}><Camera size={16}/> Take Photo</button>
                  <button onClick={()=>fileRef.current?.click()} className="btn btn-outline" style={{ borderRadius:30, padding:'10px 16px', border:'1px solid var(--user-primary)', color:'var(--user-primary)', fontWeight:800 }}><Upload size={16}/> Upload</button>
                  <button onClick={start} disabled={scanning} className="btn btn-outline" style={{ borderRadius:30, padding:'10px 16px', fontWeight:800 }}>{scanning?'Scanning...':'Start Scan'}</button>
                </div>
                {error && <div style={{ marginTop:12, padding:10, borderRadius:30, background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', display:'flex', gap:8 }}><AlertCircle size={16}/>{error}</div>}
                {scanning && (
                  <div style={{ marginTop:12, background:'#e8ecec', borderRadius:30, height:14, overflow:'hidden', position:'relative' }}>
                    <div style={{ width:`${progress}%`, height:'100%', background:'linear-gradient(90deg, var(--user-primary), var(--user-accent))', transition:'width 0.2s' }} />
                    <span style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', fontSize:'0.75rem', fontWeight:800 }}>Scanning {Math.floor(progress)}%</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ animation:'staggerIn 0.4s ease' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <CheckCircle size={28} color="#22c55e" />
                  <div>
                    <h3 style={{ color:'var(--user-primary-dark)' }}>{result.condition}</h3>
                    <span style={{ padding:'4px 10px', borderRadius:30, background: result.severity==='Low'?'#ecfdf5':'#fef2f2', color: result.severity==='Low'?'#065f46':'#991b1b', fontWeight:700, fontSize:'0.8rem' }}>{result.severity}</span>
                    {isLive!==null && <span style={{ marginLeft:8, padding:'4px 8px', borderRadius:30, background: isLive?'#ecfdf5':'#fef3c7', color: isLive?'#065f46':'#92400e', fontWeight:700, fontSize:'0.7rem' }}>{isLive?'Live Gemini':'Mock Fallback'}</span>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                  {result.symptoms.map((s:string,i:number)=><span key={i} style={{ padding:'6px 10px', borderRadius:30, background:'var(--user-accent-soft)', color:'var(--user-primary-dark)', fontWeight:700, fontSize:'0.85rem' }}>{s}</span>)}
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  {result.recommendations.map((r:any,i:number)=>(
                    <div key={i} className="user-card" style={{ padding:12, display:'flex', gap:10 }}>
                      <Info size={16} color="var(--user-primary)" />
                      <div><strong>{r.title}</strong><p style={{ color:'var(--user-muted)', fontSize:'0.9rem' }}>{r.text}</p></div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:12, padding:12, borderRadius:30, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                  <p style={{ fontSize:'0.85rem', fontWeight:700, display:'flex', gap:6 }}><ShieldCheck size={14} color="var(--user-primary)" /> AI-generated observation — not a guaranteed medical diagnosis. {result.doctorNote ? `Doctor: ${result.doctorNote}` : 'Awaiting doctor review where applicable.'}</p>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button onClick={()=>{setResult(null); setProgress(0);}} className="btn btn-primary" style={{ borderRadius:30, background:'var(--user-primary)', color:'white', padding:'8px 14px', fontWeight:800 }}>New Scan</button>
                  <button onClick={()=>{const b=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='ai-scan.json'; a.click();}} style={{ borderRadius:30, border:'1px solid var(--user-primary)', padding:'8px 14px', fontWeight:700, background:'white', color:'var(--user-primary)' }}>Save</button>
                </div>
              </div>
            )}
          </div>

          <div className="user-card" style={{ padding:20 }}>
            <h3>Doctor-confirmed vs AI</h3>
            <ul style={{ marginTop:12, display:'grid', gap:10, fontSize:'0.92rem' }}>
              <li style={{ padding:10, borderRadius:30, background:'var(--user-accent-soft)', border:'1px solid rgba(167,201,87,0.2)' }}><strong>AI observation:</strong> Preliminary, pattern-based, shown above.</li>
              <li style={{ padding:10, borderRadius:30, background:'#f0fdf4', border:'1px solid #bbf7d0' }}><strong>Doctor-confirmed:</strong> Verified by physician, appears in Reports with green check.</li>
            </ul>
            <div style={{ marginTop:16, padding:12, borderRadius:30, background:'#fff', border:'1px solid #e8ecec', display:'flex', gap:8 }}>
              <AlertCircle size={16} color="#f59e0b" />
              <p style={{ fontSize:'0.85rem', color:'var(--user-muted)' }}>AI suggestions are not a replacement for professional diagnosis. Consult doctor for medical conditions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserAiScan;
