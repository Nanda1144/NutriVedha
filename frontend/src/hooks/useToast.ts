import { useState, useCallback } from 'react';

// Replaces repeated `const [toast,setToast]=useState<string|null>(null); const showToast=(m:string)=>{setToast(m); setTimeout(()=>setToast(null),2500)}` in ~18 files
export function useToast(duration = 2500) {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }, [duration]);
  return { toast, showToast, setToast };
}
