
/** @jsx React.createElement */
import React, { useState, useEffect } from 'react';
import { Shield, LogOut, PlusCircle, Search, Filter } from 'lucide-react';
import { UserRole, IncidentStatus, Ornik8Data } from './types';
import { getAllIncidents, saveIncident, deleteIncident } from './services/storage';
import Dashboard from './components/Dashboard';
import IncidentForm from './components/IncidentForm';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<Ornik8Data | null>(null);
  const [incidents, setIncidents] = useState<Ornik8Data[]>([]);

  useEffect(() => {
    setIncidents(getAllIncidents());
  }, [view]);

  const handleLogin = (role: UserRole) => {
    let name = role === UserRole.OFFICER ? 'ملازم أول أحمد محمد' : 
               role === UserRole.SUPERVISOR ? 'عقيد شرطة خالد علي' : 'الرائد محمود النيل';
    setCurrentUser({ name, role });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-white/10 p-6 rounded-full mb-6 border border-white/20">
          <Shield size={60} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2 official-header">نظام أورنيك (8) الرقمي</h1>
        <p className="text-emerald-200/60 text-sm mb-12">الإدارة العامة للمرور - جمهورية السودان</p>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
          <button onClick={() => handleLogin(UserRole.OFFICER)} className="h-16 bg-emerald-600 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">دخول شرطي المرور</button>
          <button onClick={() => handleLogin(UserRole.SUPERVISOR)} className="h-16 bg-blue-700 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">دخول المشرف</button>
          <button onClick={() => handleLogin(UserRole.INVESTIGATOR)} className="h-16 bg-purple-700 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">دخول المحقق</button>
        </div>
        <div className="mt-20 text-[10px] opacity-40">نظام تقني معتمد للأغراض الميدانية</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-emerald-900 text-white p-4 shadow-lg sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
             <Shield size={20} className="text-emerald-300" />
          </div>
          <div className="text-right">
            <h1 className="font-bold text-sm leading-tight">أورنيك 8 الرقمي</h1>
            <p className="text-[9px] text-emerald-300 opacity-80">{currentUser.name}</p>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="p-2 bg-emerald-800 rounded-xl active:bg-emerald-700"><LogOut size={18} /></button>
      </header>

      <main className="flex-1">
        {view === 'dashboard' ? (
          <Dashboard 
            incidents={incidents} 
            onEdit={(i) => { setSelectedIncident(i); setView('form'); }} 
            onDelete={(id) => { deleteIncident(id); setIncidents(getAllIncidents()); }}
            userRole={currentUser.role}
          />
        ) : (
          <IncidentForm 
            initialData={selectedIncident} 
            onSave={(data) => { saveIncident(data); setView('dashboard'); }} 
            onCancel={() => setView('dashboard')}
            userRole={currentUser.role}
            currentUserName={currentUser.name}
          />
        )}
      </main>

      {view === 'dashboard' && (
        <button 
          onClick={() => { setSelectedIncident(null); setView('form'); }}
          className="fixed bottom-6 left-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40"
        >
          <PlusCircle size={32} />
        </button>
      )}
    </div>
  );
};

export default App;
