
/** @jsx React.createElement */
import React, { useState, useEffect } from 'react';
import { 
  Shield, LogOut, PlusCircle, Users, Activity, Settings, 
  Database, Gavel, UserPlus, UserMinus, CheckCircle, XCircle, Edit2, Link, DatabaseZap
} from 'lucide-react';
import { UserRole, IncidentStatus, Ornik8Data } from './types';
import { getAllIncidents, saveIncident, deleteIncident } from './services/storage';
import { getAllUsers, saveUser, toggleUserStatus, User, deleteUser } from './services/userStorage';
import { STATES } from './constants';
import Dashboard from './components/Dashboard';
import IncidentForm from './components/IncidentForm';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'form' | 'admin_panel'>('dashboard');
  const [selectedIncident, setSelectedIncident] = useState<Ornik8Data | null>(null);
  const [incidents, setIncidents] = useState<Ornik8Data[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('SUPABASE_KEY') || '');

  useEffect(() => {
    setIncidents(getAllIncidents());
    setUsers(getAllUsers());
    (window as any).SUPABASE_ANON_KEY = supabaseKey;
  }, [view, showUserForm, supabaseKey]);

  const handleLogin = (role: UserRole) => {
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.role === role && u.isActive);
    if (user) {
      setCurrentUser(user);
    } else {
      alert("لا يوجد مستخدم نشط بهذا الدور. إذا كنت المدير، استخدم 'admin' كاسم مستخدم افتراضي.");
    }
  };

  const onSaveUserInternal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: editingUser?.id || crypto.randomUUID(),
      fullName: formData.get('fullName') as string,
      username: formData.get('username') as string,
      role: formData.get('role') as UserRole,
      state: formData.get('state') as string,
      locality: formData.get('locality') as string,
      isActive: editingUser ? editingUser.isActive : true,
      createdAt: editingUser?.createdAt || new Date().toISOString()
    };
    
    await saveUser(newUser);
    setShowUserForm(false);
    setEditingUser(null);
    setUsers(getAllUsers());
  };

  const handleSaveSupabaseKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('key') as string;
    if (key) {
      localStorage.setItem('SUPABASE_KEY', key);
      setSupabaseKey(key);
      (window as any).SUPABASE_ANON_KEY = key;
      setShowSupabaseModal(false);
      alert("تم الربط السحابي بنجاح");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="bg-white/10 p-6 rounded-full mb-6 border border-white/20">
          <Shield size={60} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2 official-header">نظام أورنيك (8) الرقمي</h1>
        <p className="text-emerald-200/60 text-sm mb-12">الإدارة العامة للمرور - السودان</p>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
          <button onClick={() => handleLogin(UserRole.ADMIN)} className="h-16 bg-red-900/40 border border-red-500/50 rounded-2xl font-bold flex items-center justify-center gap-3">
             <Settings size={20}/> دخول المدير
          </button>
          <button onClick={() => handleLogin(UserRole.OFFICER)} className="h-16 bg-emerald-600 rounded-2xl font-bold flex items-center justify-center gap-3">دخول الشرطي</button>
          <button onClick={() => handleLogin(UserRole.SUPERVISOR)} className="h-16 bg-blue-700 rounded-2xl font-bold flex items-center justify-center gap-3">دخول المشرف</button>
        </div>
        
        <button onClick={() => setShowSupabaseModal(true)} className="mt-8 text-[10px] text-amber-400 underline underline-offset-4 flex items-center gap-2">
          <Link size={12} /> {supabaseKey ? 'تحديث ربط Supabase Cloud' : 'اضغط هنا لربط النظام بـ Supabase Cloud'}
        </button>

        {/* Supabase Key Modal */}
        {showSupabaseModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <DatabaseZap size={20} className="text-emerald-400" />
                   <h3 className="font-bold">إعدادات الربط السحابي</h3>
                 </div>
                 <button onClick={() => setShowSupabaseModal(false)}><XCircle /></button>
               </div>
               <form onSubmit={handleSaveSupabaseKey} className="p-6 space-y-4 text-right">
                  <p className="text-xs text-slate-500 leading-relaxed">أدخل مفتاح (Anon Key) الخاص بمشروعك في Supabase لتفعيل المزامنة الوطنية والنسخ الاحتياطي التلقائي.</p>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">SUPABASE ANON KEY</label>
                    <textarea 
                      name="key" 
                      defaultValue={supabaseKey}
                      required 
                      className="w-full h-32 p-3 bg-slate-50 border rounded-xl font-mono text-[10px] outline-none focus:ring-2 focus:ring-emerald-500" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    />
                  </div>
                  <button type="submit" className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">تفعيل الربط السحابي</button>
                  <button type="button" onClick={() => setShowSupabaseModal(false)} className="w-full text-xs text-slate-400 py-2">إغلاق</button>
               </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-10">
      <header className={`p-4 shadow-lg sticky top-0 z-50 flex justify-between items-center text-white ${currentUser.role === UserRole.ADMIN ? 'bg-slate-900' : 'bg-emerald-900'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
             {currentUser.role === UserRole.ADMIN ? <Settings size={20} /> : <Shield size={20} />}
          </div>
          <div className="text-right">
            <h1 className="font-bold text-sm leading-tight">مركز الإدارة الوطنية</h1>
            <p className="text-[9px] text-emerald-300 opacity-80">{currentUser.fullName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser.role === UserRole.ADMIN && (
            <button onClick={() => setView('admin_panel')} className={`p-2 rounded-xl ${view === 'admin_panel' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
              <Users size={18} />
            </button>
          )}
          <button onClick={() => setView('dashboard')} className={`p-2 rounded-xl ${view === 'dashboard' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
            <Activity size={18} />
          </button>
          <button onClick={() => setCurrentUser(null)} className="p-2 bg-red-900/40 rounded-xl"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="flex-1">
        {view === 'dashboard' && (
          <Dashboard 
            incidents={incidents} 
            onEdit={(i) => { setSelectedIncident(i); setView('form'); }} 
            onDelete={(id) => { deleteIncident(id); setIncidents(getAllIncidents()); }}
            userRole={currentUser.role}
          />
        )}
        
        {view === 'form' && (
          <IncidentForm 
            initialData={selectedIncident} 
            onSave={(data) => { saveIncident(data); setView('dashboard'); }} 
            onCancel={() => setView('dashboard')}
            userRole={currentUser.role}
            currentUserName={currentUser.fullName}
          />
        )}

        {view === 'admin_panel' && (
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 text-right">
            <div className="flex justify-between items-center flex-row-reverse">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                 <Database className="text-emerald-600" /> إدارة القوى البشرية
               </h2>
               <button 
                 onClick={() => { setEditingUser(null); setShowUserForm(true); }}
                 className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg"
               >
                 <UserPlus size={18} /> إضافة موظف
               </button>
            </div>

            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500">الموظف</th>
                    <th className="p-4 text-xs font-bold text-slate-500">الدور</th>
                    <th className="p-4 text-xs font-bold text-slate-500">الحالة</th>
                    <th className="p-4 text-xs font-bold text-slate-500">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="p-4">
                        <div className="font-bold">{user.fullName}</div>
                        <div className="text-[10px] opacity-50">@{user.username}</div>
                      </td>
                      <td className="p-4 text-sm">{user.role}</td>
                      <td className="p-4">
                         <span onClick={() => { toggleUserStatus(user.id); setUsers(getAllUsers()); }} className={`cursor-pointer px-3 py-1 rounded-full text-[10px] font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                           {user.isActive ? 'نشط' : 'معطل'}
                         </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                           <button onClick={() => { setEditingUser(user); setShowUserForm(true); }} className="p-2 text-slate-400 hover:text-emerald-600"><Edit2 size={16}/></button>
                           {user.id !== 'admin-001' && (
                             <button onClick={() => { if(confirm('حذف الموظف؟')){ deleteUser(user.id); setUsers(getAllUsers()); } }} className="p-2 text-slate-400 hover:text-red-600"><UserMinus size={16}/></button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showUserForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
               <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                 <h3 className="font-bold">{editingUser ? 'تعديل موظف' : 'إضافة موظف جديد'}</h3>
                 <button onClick={() => setShowUserForm(false)}><XCircle /></button>
               </div>
               <form onSubmit={onSaveUserInternal} className="p-6 space-y-4 text-right">
                  <input name="fullName" defaultValue={editingUser?.fullName} required className="w-full h-12 px-4 bg-slate-50 border rounded-xl" placeholder="الاسم الكامل" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="username" defaultValue={editingUser?.username} required className="w-full h-12 px-4 bg-slate-50 border rounded-xl text-left" placeholder="اسم المستخدم" />
                    <select name="role" defaultValue={editingUser?.role || UserRole.OFFICER} className="w-full h-12 px-2 bg-slate-50 border rounded-xl">
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select name="state" defaultValue={editingUser?.state || STATES[0]} className="w-full h-12 px-2 bg-slate-50 border rounded-xl">
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input name="locality" defaultValue={editingUser?.locality} required className="w-full h-12 px-4 bg-slate-50 border rounded-xl" placeholder="المحلية" />
                  </div>
                  <button type="submit" className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg">حفظ الموظف</button>
               </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
