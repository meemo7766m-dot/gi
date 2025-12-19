
import React, { useState, useEffect } from 'react';
import { Ornik8Data, IncidentStatus, UserRole } from '../types';
import { exportAllData } from '../services/storage';
import { 
  Search, Filter, ChevronLeft, MapPin, Calendar, 
  Clock, MoreVertical, FileText, Download, Wifi, WifiOff 
} from 'lucide-react';

interface DashboardProps {
  incidents: Ornik8Data[];
  onEdit: (incident: Ornik8Data) => void;
  onDelete: (id: string) => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ incidents, onEdit, onDelete, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const filteredIncidents = incidents.filter(i => 
    i.ornikNumber.includes(searchTerm) || 
    i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.APPROVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case IncidentStatus.PENDING_APPROVAL: return 'bg-amber-100 text-amber-700 border-amber-200';
      case IncidentStatus.CLOSED: return 'bg-slate-200 text-slate-700 border-slate-300';
      case IncidentStatus.UNDER_INVESTIGATION: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      {/* Status Bar */}
      <div className={`mb-4 flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full w-fit ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
        {isOnline ? 'متصل بالشبكة (مزامنة مفعلة)' : 'وضع العمل الميداني (حفظ محلي فقط)'}
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">سجل الحوادث المرورية</h2>
          <p className="text-slate-500 text-sm">الإدارة العامة للمرور - متابعة البلاغات</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={exportAllData}
             className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
             title="نسخ احتياطي للبيانات"
           >
             <Download size={20} />
             <span className="hidden md:inline text-sm font-bold">نسخ احتياطي</span>
           </button>
           <div className="relative flex-1 md:w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="رقم الأورنيك أو السائق..."
               className="w-full pr-10 pl-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={40} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">لا توجد بلاغات مسجلة</h3>
          <p className="text-slate-400 text-sm mt-2">ابدأ بتسجيل حادث جديد باستخدام زر الإضافة بالأسفل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map(incident => (
            <div 
              key={incident.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all cursor-pointer relative active:scale-[0.99]"
              onClick={() => onEdit(incident)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">#{incident.ornikNumber}</span>
                </div>
                <MoreVertical size={18} className="text-slate-300" />
              </div>

              <h3 className="font-bold text-slate-800 text-lg mb-2">{incident.incidentType}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={16} className="text-emerald-500 shrink-0" />
                  <span className="truncate">{incident.location}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{incident.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{incident.time}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2 space-x-reverse">
                  {incident.vehicles.slice(0, 3).map((_, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                      V
                    </div>
                  ))}
                  {incident.vehicles.length > 3 && (
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      +{incident.vehicles.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-emerald-600 font-bold text-sm flex items-center gap-1">
                  فتح الأورنيك <ChevronLeft size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
