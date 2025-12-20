import React, { useState, useEffect } from 'react';
import { Ornik8Data, IncidentStatus, UserRole } from '../types';
import { exportAllData } from '../services/storage';
import { generateDailySummary } from '../services/pdfGenerator';
import { 
  Search, MapPin, Calendar, 
  FileText, Download, Plus, 
  CheckCircle, Clock3, ClipboardList, 
  Lock, ArrowRight, BarChart3,
  Gavel, Landmark, ShieldCheck, Scale, Briefcase, Settings,
  AlignRight, User as UserIcon
} from 'lucide-react';

interface DashboardProps {
  incidents: Ornik8Data[];
  onAdd: () => void;
  onEdit: (incident: Ornik8Data) => void;
  onDelete: (id: string) => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ incidents, onAdd, onEdit, onDelete, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const getRoleHeader = () => {
    switch(userRole) {
      case UserRole.OFFICER: return { label: 'منصة العمل الميداني', icon: <ShieldCheck className="text-emerald-500"/>, color: 'text-emerald-700' };
      case UserRole.SUPERVISOR: return { label: 'منصة الإشراف والعمليات', icon: <Briefcase className="text-blue-500"/>, color: 'text-blue-700' };
      case UserRole.INVESTIGATOR: return { label: 'منصة التحقيق الفني', icon: <Scale className="text-purple-500"/>, color: 'text-purple-700' };
      case UserRole.RECORDS: return { label: 'منصة السجلات والأرشفة', icon: <Landmark className="text-slate-500"/>, color: 'text-slate-700' };
      default: return { label: 'التحكم المركزي بالمرور', icon: <Settings className="text-amber-500"/>, color: 'text-amber-700' };
    }
  };

  const getStatusConfig = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.PROSECUTION:
        return { icon: <Landmark size={14} />, label: 'محال للنيابة', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', accent: 'bg-blue-600' };
      case IncidentStatus.COURT:
        return { icon: <Gavel size={14} />, label: 'محال للمحكمة', bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-700', accent: 'bg-slate-900' };
      case IncidentStatus.APPROVED:
        return { icon: <CheckCircle size={14} />, label: 'معتمد', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-500' };
      case IncidentStatus.PENDING_APPROVAL:
        return { icon: <Clock3 size={14} />, label: 'قيد الاعتماد', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: 'bg-amber-500' };
      case IncidentStatus.CLOSED:
        return { icon: <Lock size={14} />, label: 'مغلق', bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800', accent: 'bg-slate-700' };
      default:
        return { icon: <FileText size={14} />, label: status, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', accent: 'bg-slate-400' };
    }
  };

  const filteredIncidents = incidents.filter(i => 
    i.ornikNumber.includes(searchTerm) || 
    i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.driver && i.driver.name && i.driver.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const roleInfo = getRoleHeader();
  const canAddIncident = [UserRole.OFFICER, UserRole.SUPERVISOR, UserRole.ADMIN].includes(userRole);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 text-right" dir="rtl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className={`mb-3 flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl w-fit bg-white border shadow-sm ${roleInfo.color}`}>
            {roleInfo.icon}
            {roleInfo.label}
          </div>
          <h2 className="text-3xl font-black text-slate-900 official-header">سجلات الحوادث</h2>
          <p className="text-slate-500 text-xs font-bold mt-1">نظام أورنيك (8) الرقمي - النسخة الميدانية</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {canAddIncident && (
             <button onClick={onAdd} className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
               <Plus size={20}/> بلاغ ميداني جديد
             </button>
          )}
          <button onClick={() => generateDailySummary(incidents)} className="p-4 bg-white border border-slate-200 rounded-[1.5rem] text-slate-600 shadow-sm hover:bg-slate-50 transition-colors" title="التقرير اليومي">
             <ClipboardList size={20} />
          </button>
          <button onClick={exportAllData} className="p-4 bg-white border border-slate-200 rounded-[1.5rem] text-slate-600 shadow-sm hover:bg-slate-50 transition-colors" title="تصدير البيانات">
             <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <div className="text-2xl font-black text-slate-900 leading-none">{incidents.length}</div>
            <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">إجمالي البلاغات</div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <div className="text-2xl font-black text-blue-600 leading-none">{incidents.filter(i => i.status === IncidentStatus.PROSECUTION).length}</div>
            <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">محال للنيابة</div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <div className="text-2xl font-black text-purple-600 leading-none">{incidents.filter(i => i.status === IncidentStatus.UNDER_INVESTIGATION).length}</div>
            <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">قيد التحقيق الفني</div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <div className="text-2xl font-black text-emerald-600 leading-none">{incidents.filter(i => i.status === IncidentStatus.CLOSED).length}</div>
            <div className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">بلاغات مغلقة</div>
         </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input 
          type="text" 
          placeholder="البحث العالمي: برقم الأورنيك، الموقع، أو اسم السائق..."
          className="w-full pr-16 pl-6 py-5 bg-white border-2 border-slate-50 rounded-[2.2rem] outline-none shadow-sm focus:border-emerald-500 transition-all text-sm font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncidents.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed text-slate-400 font-bold">لا توجد نتائج مطابقة لبحثك في قاعدة البيانات الحالية</div>
        ) : filteredIncidents.map(incident => {
          const config = getStatusConfig(incident.status);
          return (
            <div 
              key={incident.id}
              className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden relative active:scale-[0.98]"
              onClick={() => onEdit(incident)}
            >
              <div className={`absolute top-0 right-0 left-0 h-1.5 ${config.accent}`}></div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black ${config.bg} ${config.text} ${config.border}`}>
                    {config.icon}
                    <span>{config.label}</span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-300">#{incident.ornikNumber}</div>
                </div>
                <h3 className="font-black text-slate-800 text-sm mb-4 line-clamp-1">{incident.incidentType}</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><MapPin size={12} className="text-slate-300"/> {incident.location}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><Calendar size={12} className="text-slate-300"/> {incident.date}</div>
                  {incident.driver?.name && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold"><UserIcon size={12} className="text-slate-300"/> السائق: {incident.driver.name}</div>
                  )}
                  
                  {/* ملخص وصف الحادث */}
                  {incident.incidentDescription && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <AlignRight size={12} className="text-slate-400 mt-1 shrink-0" />
                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed line-clamp-2">
                          {incident.incidentDescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400">مراجعة التفاصيل</span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <ArrowRight size={14} className="rotate-180" />
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;