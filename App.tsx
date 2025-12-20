/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MemoryRouter, Routes, Route, useNavigate, useParams, Navigate, useLocation
} from 'react-router-dom';
import { 
  Shield, LogOut, Activity, UserCog, UserPlus, ShieldCheck, 
  ChevronLeft, Briefcase, Scale, ArrowRight, Settings, CheckCircle, Trash2, 
  UserCheck, XCircle, FolderOpen, Landmark, AlertCircle, Users, Info, Database, Cloud, CloudCheck, CloudOff
} from 'lucide-react';
import { UserRole, Ornik8Data } from './types';
import { getAllIncidents, saveIncident, deleteIncident } from './services/storage';
import { getAllUsers, saveUser, toggleUserStatus, User, deleteUser, ensureDefaultUsers } from './services/userStorage';
import { testCloudConnection } from './services/supabase';
import { SUDAN_TRAFFIC_LOGO } from './constants';
import Dashboard from './components/Dashboard';
import IncidentForm from './components/IncidentForm';

// --- Login Screen Component ---
const LoginScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [loginStep, setLoginStep] = useState<'role' | 'credentials'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginAttempt = () => {
    setLoginError('');
    if (!selectedRole || !usernameInput) return;
    
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.username.trim().toLowerCase() === usernameInput.trim().toLowerCase());

    if (!user) {
        setLoginError(`المعرف "${usernameInput}" غير موجود.`);
        return;
    }

    if (user.role !== selectedRole) {
        setLoginError(`تنبيه أمني: لا تملك صلاحية دخول بوابة (${selectedRole}) بهذا الحساب.`);
        return;
    }

    if (!user.isActive) {
        setLoginError("الحساب معطل إدارياً.");
        return;
    }

    onLogin(user);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.OFFICER: return <ShieldCheck size={20} />;
      case UserRole.SUPERVISOR: return <Briefcase size={20} />;
      case UserRole.INVESTIGATOR: return <Scale size={20} />;
      case UserRole.RECORDS: return <Landmark size={20} />;
      case UserRole.ADMIN: return <Settings size={20} />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#062c1e] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md z-10 space-y-6">
        <div className="flex flex-col items-center text-center">
           <div className="bg-white p-3 rounded-[2rem] shadow-2xl mb-4">{SUDAN_TRAFFIC_LOGO}</div>
           <h1 className="text-2xl font-black text-white">نظام أورنيك (8) الرقمي</h1>
           <p className="text-emerald-400/60 text-[10px] font-bold mt-1">شرطة المرور السودانية</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-2 rounded-[2.5rem] backdrop-blur-2xl">
          {loginStep === 'role' ? (
            <div className="space-y-1.5 p-2">
              {[
                { 
                  role: UserRole.OFFICER, 
                  label: 'بوابة الميدان (الشرطي)', 
                  color: 'bg-emerald-600', 
                  desc: 'تسجيل الحوادث الميدانية وإصدار أورنيك 8 الرقمي' 
                },
                { 
                  role: UserRole.SUPERVISOR, 
                  label: 'بوابة الإشراف والمتابعة', 
                  color: 'bg-blue-600', 
                  desc: 'مراجعة البلاغات الميدانية والتدقيق الفني والاعتماد' 
                },
                { 
                  role: UserRole.INVESTIGATOR, 
                  label: 'بوابة التحقيق الفني', 
                  color: 'bg-purple-600', 
                  desc: 'إعداد تقارير المسؤولية وخطابات التأمين المعتمدة' 
                },
                { 
                  role: UserRole.RECORDS, 
                  label: 'بوابة السجلات المركزية', 
                  color: 'bg-slate-700', 
                  desc: 'الأرشفة، المتابعة القانونية وإحالة الملفات للنيابة' 
                },
                { 
                  role: UserRole.ADMIN, 
                  label: 'لوحة تحكم الإدارة', 
                  color: 'bg-amber-600', 
                  desc: 'إدارة حسابات المنسوبين ومراقبة أداء النظام الوطني' 
                }
              ].map(btn => (
                <button 
                  key={btn.role} 
                  onClick={() => { setSelectedRole(btn.role); setLoginStep('credentials'); }} 
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-3xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-4 text-right">
                    <div 
                      className={`w-11 h-11 ${btn.color} rounded-2xl flex items-center justify-center text-white shadow-lg relative`}
                      title={btn.desc}
                    >
                      {getRoleIcon(btn.role)}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 rounded-full p-0.5 shadow-md">
                        <Info size={10} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xs">{btn.label}</h3>
                      <p className="text-white/40 text-[9px] mt-0.5 font-medium leading-tight max-w-[200px]">{btn.desc}</p>
                    </div>
                  </div>
                  <ChevronLeft className="text-white/10 group-hover:text-white/40 transition-colors" size={18} />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-right">
              <button onClick={() => { setLoginStep('role'); setLoginError(''); }} className="text-white/40 text-[10px] font-bold flex items-center gap-1 mb-6 hover:text-white transition-colors"><ArrowRight size={14} /> العودة</button>
              <div className="mb-8">
                  <h3 className="text-white text-xl font-black">تسجيل دخول</h3>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">{selectedRole}</p>
              </div>

              {loginError && (
                  <div className="mb-5 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-[10px] font-bold flex items-center gap-2 animate-pulse">
                      <AlertCircle size={16}/> {loginError}
                  </div>
              )}

              <div className="space-y-4">
                  <input 
                      type="text" 
                      value={usernameInput} 
                      onChange={(e) => setUsernameInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleLoginAttempt()} 
                      placeholder="المعرف / الرقم العسكري" 
                      className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-5 text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold placeholder:text-white/20" 
                      autoFocus 
                  />
                  <button onClick={handleLoginAttempt} className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black shadow-2xl active:scale-95 transition-all hover:bg-emerald-50">دخول آمن للمنصة</button>
              </div>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-white/20 text-[8px] font-medium uppercase tracking-[0.2em]">هذا النظام مخصص للاستخدام الرسمي فقط</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Wrapper with Routing ---
const AppRouter: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    ensureDefaultUsers();
    const session = localStorage.getItem('active_session');
    if (session) {
        try {
            const parsed = JSON.parse(session);
            const freshUser = getAllUsers().find(u => u.username === parsed.username);
            if (freshUser) {
                setCurrentUser(freshUser);
            } else {
                localStorage.removeItem('active_session');
            }
        } catch(e) {
            localStorage.removeItem('active_session');
        }
    }
    setIsReady(true);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('active_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('active_session');
  };

  if (!isReady) return null;

  return (
    <MemoryRouter>
      {!currentUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <AuthenticatedApp currentUser={currentUser} onLogout={handleLogout} />
      )}
    </MemoryRouter>
  );
};

// --- Authenticated App Layout & Routing Logic ---
const AuthenticatedApp: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidents, setIncidents] = useState<Ornik8Data[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    setIncidents(getAllIncidents());
    setUsers(getAllUsers());
  }, [location.pathname]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.OFFICER: return <ShieldCheck size={20} />;
      case UserRole.SUPERVISOR: return <Briefcase size={20} />;
      case UserRole.INVESTIGATOR: return <Scale size={20} />;
      case UserRole.RECORDS: return <Landmark size={20} />;
      case UserRole.ADMIN: return <Settings size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const roleTheme: Record<string, string> = {
    [UserRole.OFFICER]: 'bg-emerald-900',
    [UserRole.SUPERVISOR]: 'bg-blue-900',
    [UserRole.RECORDS]: 'bg-slate-800',
    [UserRole.ADMIN]: 'bg-slate-950 border-b-2 border-amber-500'
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className={`p-4 shadow-xl sticky top-0 z-50 flex justify-between items-center text-white ${roleTheme[currentUser.role] || 'bg-slate-900'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/15 border border-white/10 shadow-inner">
             {getRoleIcon(currentUser.role)}
          </div>
          <div className="text-right">
            <h1 className="font-black text-xs">أورنيك (8) الرقمي</h1>
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-white/60">{currentUser.fullName}</p>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-white/5">{currentUser.role}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role === UserRole.ADMIN && (
            <button 
              onClick={() => navigate('/admin')} 
              className={`p-3 rounded-2xl transition-all ${location.pathname === '/admin' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'bg-white/10 hover:bg-white/20'}`} 
              title="إدارة النظام"
            >
              <Settings size={18} />
            </button>
          )}
          <button 
            onClick={() => navigate('/')} 
            className={`p-3 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-white/20 shadow-inner' : 'bg-white/10 hover:bg-white/20'}`} 
            title="لوحة المعلومات"
          >
            <Activity size={18} />
          </button>
          <button onClick={onLogout} className="p-3 bg-red-500/20 rounded-2xl text-red-200 hover:bg-red-500/30 transition-all" title="تسجيل الخروج"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
        <Routes>
          <Route path="/" element={
            <Dashboard 
              incidents={incidents} 
              onAdd={() => navigate('/incident/new')} 
              onEdit={(i) => navigate(`/incident/edit/${i.id}`)} 
              onDelete={(id) => { if(confirm('تأكيد حذف سجل الحادث بشكل نهائي؟')) { deleteIncident(id); setIncidents(getAllIncidents()); } }} 
              userRole={currentUser.role} 
            />
          } />
          
          <Route path="/incident/new" element={
            <IncidentForm 
              initialData={null} 
              onSave={async (data) => { saveIncident(data); navigate('/'); }} 
              onCancel={() => navigate('/')} 
              userRole={currentUser.role} 
              currentUserName={currentUser.fullName} 
            />
          } />

          <Route path="/incident/edit/:id" element={<EditIncidentWrapper currentUser={currentUser} navigate={navigate} />} />

          <Route path="/admin" element={
            currentUser.role === UserRole.ADMIN ? (
              <AdminPanel 
                users={users} 
                onRefresh={() => setUsers(getAllUsers())} 
                getRoleIcon={getRoleIcon} 
                showUserForm={showUserForm} 
                setShowUserForm={setShowUserForm} 
              />
            ) : <Navigate to="/" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

// --- Cloud Settings Component ---
const CloudSettings: React.FC = () => {
  const [url, setUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [key, setKey] = useState(localStorage.getItem('SUPABASE_KEY') || '');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setStatus('testing');
    const result = await testCloudConnection(url, key);
    if (result.success) {
      localStorage.setItem('SUPABASE_URL', url);
      localStorage.setItem('SUPABASE_KEY', key);
      setStatus('success');
      setMsg('تم التحقق وحفظ إعدادات الربط السحابي بنجاح.');
    } else {
      setStatus('error');
      setMsg(`فشل الاتصال: ${result.message}`);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm p-8 space-y-6">
       <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Cloud size={24}/></div>
          <div>
            <h3 className="font-black text-slate-800">إعدادات الربط السحابي (API Keys)</h3>
            <p className="text-[10px] font-bold text-slate-400">تستخدم لمزامنة البيانات مع قاعدة البيانات الوطنية المركزية</p>
          </div>
       </div>

       <div className="space-y-4">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 mr-2">Cloud API URL</label>
             <input 
                type="text" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold outline-none focus:border-amber-500 transition-all" 
                placeholder="https://your-project.supabase.co" 
             />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-500 mr-2">Cloud API Key (Anon Key)</label>
             <input 
                type="password" 
                value={key} 
                onChange={e => setKey(e.target.value)}
                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-bold outline-none focus:border-amber-500 transition-all" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
             />
          </div>
       </div>

       {msg && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border ${status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
             {status === 'success' ? <CloudCheck size={18}/> : <CloudOff size={18}/>}
             {msg}
          </div>
       )}

       <button 
        onClick={handleSave} 
        disabled={status === 'testing'}
        className="w-full h-14 bg-amber-500 text-slate-900 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10"
       >
         {status === 'testing' ? 'جاري التحقق...' : 'حفظ واختبار الاتصال السحابي'}
       </button>
    </div>
  );
};

// --- Admin Panel Component ---
const AdminPanel: React.FC<{ 
  users: User[], onRefresh: () => void, getRoleIcon: (r: UserRole) => any, 
  showUserForm: boolean, setShowUserForm: (v: boolean) => void 
}> = ({ users, onRefresh, getRoleIcon, showUserForm, setShowUserForm }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'cloud'>('users');

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 text-right">
       <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h2 className="text-3xl font-black">إدارة المنظومة الوطنية</h2>
                <p className="text-amber-400 font-bold text-xs uppercase tracking-widest mt-1">التحكم في منسوبي شرطة المرور وصلاحيات الوصول</p>
            </div>
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl">
               <button 
                onClick={() => setActiveTab('users')} 
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'users' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                 المستخدمين
               </button>
               <button 
                onClick={() => setActiveTab('cloud')} 
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'cloud' ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                 الربط السحابي
               </button>
            </div>
          </div>
       </div>
       
       {activeTab === 'users' ? (
         <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border shadow-sm">
               <h3 className="font-black text-slate-800">قائمة المنسوبين المعتمدين</h3>
               <button onClick={() => setShowUserForm(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"><UserPlus size={16}/> إضافة موظف</button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden border-slate-200">
               {users.map(u => (
                 <div key={u.id} className="p-6 flex justify-between items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${u.isActive ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-300'}`}>{getRoleIcon(u.role)}</div>
                       <div>
                           <div className="font-black text-slate-800 text-sm">{u.fullName}</div>
                           <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-0.5">
                               <span className="text-emerald-600">المعرف: {u.username}</span> | <span>الدور: {u.role}</span>
                           </div>
                       </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button 
                       onClick={() => { toggleUserStatus(u.id); onRefresh(); }} 
                       className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                      >
                          {u.isActive ? 'نشط' : 'موقف'}
                      </button>
                      <button onClick={() => { if(confirm(`تأكيد حذف المستخدم ${u.fullName} نهائياً؟`)){ deleteUser(u.id); onRefresh(); } }} className="p-3 text-slate-300 hover:text-red-500 transition-colors" title="حذف مستخدم"><Trash2 size={18}/></button>
                   </div>
                 </div>
               ))}
               {users.length === 0 && (
                 <div className="p-20 text-center text-slate-300 font-bold">لا يوجد مستخدمين مسجلين حالياً</div>
               )}
            </div>
         </div>
       ) : (
         <CloudSettings />
       )}

       {showUserForm && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 text-right animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="font-black text-2xl text-slate-900">تعريف منسوب جديد</h3>
                  <button onClick={() => setShowUserForm(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><XCircle size={24}/></button>
               </div>
               <form onSubmit={async (e) => {
                  e.preventDefault(); const formData = new FormData(e.currentTarget);
                  await saveUser({
                    id: crypto.randomUUID(), 
                    fullName: formData.get('fullName') as string,
                    username: (formData.get('username') as string).toLowerCase(), 
                    role: formData.get('role') as UserRole,
                    state: 'الخرطوم', locality: 'الخرطوم', isActive: true, createdAt: new Date().toISOString()
                  });
                  onRefresh(); setShowUserForm(false);
               }} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">الاسم الرباعي والرتبة</label>
                    <input name="fullName" required className="w-full h-15 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all" placeholder="مثال: نقيب/ محمد أحمد يوسف" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">المعرف أو الرقم العسكري</label>
                    <input name="username" required className="w-full h-15 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all" placeholder="يستخدم لتسجيل الدخول" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2">تحديد الدور الوظيفي</label>
                    <select name="role" className="w-full h-15 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-amber-500 outline-none transition-all appearance-none">
                        {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black mt-6 shadow-xl active:scale-95 hover:bg-slate-800 transition-all">اعتماد الموظف في المنظومة الوطنية</button>
               </form>
            </div>
          </div>
        )}
    </div>
  );
};

// --- Helper Wrapper for Editing ---
const EditIncidentWrapper: React.FC<{ currentUser: User; navigate: any }> = ({ currentUser, navigate }) => {
  const { id } = useParams<{ id: string }>();
  const incident = useMemo(() => getAllIncidents().find(i => i.id === id), [id]);

  if (!incident) return <Navigate to="/" />;

  return (
    <IncidentForm 
      initialData={incident} 
      onSave={async (data) => { saveIncident(data); navigate('/'); }} 
      onCancel={() => navigate('/')} 
      userRole={currentUser.role} 
      currentUserName={currentUser.fullName} 
    />
  );
};

export default AppRouter;