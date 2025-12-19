
import { Ornik8Data } from '../types';

const STORAGE_KEY = 'sudanese_traffic_incidents';

export const saveIncident = (data: Ornik8Data) => {
  try {
    const existing = getAllIncidents();
    const index = existing.findIndex(i => i.id === data.id);
    
    if (index > -1) {
      existing[index] = { ...data, updatedAt: new Date().toISOString() } as any;
    } else {
      existing.push({
        ...data,
        updatedAt: new Date().toISOString()
      } as any);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  } catch (e) {
    console.error("Storage error:", e);
    alert("خطأ في حفظ البيانات محلياً. تأكد من توفر مساحة على الجهاز.");
  }
};

export const getAllIncidents = (): Ornik8Data[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Parse error:", e);
    return [];
  }
};

export const deleteIncident = (id: string) => {
  const existing = getAllIncidents();
  const filtered = existing.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// وظيفة لتصدير كافة البيانات لملف خارجي (لحالات الطوارئ الميدانية)
export const exportAllData = () => {
  const data = getAllIncidents();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ORNIK8_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
