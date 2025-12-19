
/** @jsx React.createElement */
import React, { useState, useEffect, useRef } from 'react';
import { Ornik8Data, Vehicle, Victim, IncidentStatus, UserRole } from '../types';
import { STATES, INCIDENT_TYPES, SUDAN_TRAFFIC_LOGO } from '../constants';
import { generateOfficialPDF } from '../services/pdfGenerator';
import { Save, FileText, Plus, Trash2, Camera, MapPin, X, Printer, CheckCircle, Clock, Calendar } from 'lucide-react';

interface IncidentFormProps {
  initialData: Ornik8Data | null;
  onSave: (data: Ornik8Data) => void;
  onCancel: () => void;
  userRole: UserRole;
  currentUserName: string;
}

const SectionTitle: React.FC<{ children: React.ReactNode; number: number }> = ({ children, number }) => (
  <div className="flex items-center gap-3 bg-slate-100 p-3 rounded-xl border-r-4 border-emerald-600 mb-4 mt-6 shadow-sm">
    <span className="bg-emerald-600 text-white w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold">{number}</span>
    <h3 className="font-bold text-slate-800 text-sm md:text-base">{children}</h3>
  </div>
);

const IncidentForm: React.FC<IncidentFormProps> = ({ initialData, onSave, onCancel, userRole, currentUserName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Ornik8Data>(initialData || {
    id: crypto.randomUUID(),
    ornikNumber: `ORN-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 8),
    state: STATES[0],
    localArea: '',
    location: '',
    gps: { lat: 15.5007, lng: 32.5599 },
    incidentType: INCIDENT_TYPES[0],
    incidentCause: '',
    roadCondition: 'جيدة',
    weatherCondition: 'صحو',
    incidentDescription: '',
    vehicles: [],
    driver: { name: '', licenseNumber: '', licenseType: '', issueAuthority: '', condition: 'طبيعي' },
    victims: [],
    officer: { name: '', militaryId: '', unit: '', signature: '', date: new Date().toISOString().split('T')[0] },
    supervisor: { name: '', notes: '', signature: '', approvalDate: '' },
    investigation: { investigatorName: '', summary: '', responsibility: '', signature: '', closingDate: '' },
    attachments: [],
    status: IncidentStatus.DRAFT,
    createdAt: new Date().toISOString()
  });

  // طلب الموقع التلقائي عند فتح النموذج على أندرويد
  useEffect(() => {
    if ("geolocation" in navigator && !initialData) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          gps: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }));
      }, (err) => console.log("GPS Error", err));
    }
  }, []);

  useEffect(() => {
    if (userRole === UserRole.INVESTIGATOR && !formData.investigation.investigatorName) {
      setFormData(prev => ({
        ...prev,
        investigation: { ...prev.investigation, investigatorName: currentUserName }
      }));
    }
  }, [userRole, currentUserName]);

  const addVehicle = () => {
    setFormData({ ...formData, vehicles: [...formData.vehicles, { id: crypto.randomUUID(), plateNumber: '', type: '', color: '', licenseAuthority: '', damages: '' }] });
  };

  const removeVehicle = (id: string) => {
    setFormData({ ...formData, vehicles: formData.vehicles.filter(v => v.id !== id) });
  };

  const updateVehicle = (id: string, field: keyof Vehicle, value: string) => {
    setFormData({ ...formData, vehicles: formData.vehicles.map(v => v.id === id ? { ...v, [field]: value } : v) });
  };

  const addVictim = () => {
    setFormData({ ...formData, victims: [...formData.victims, { id: crypto.randomUUID(), name: '', age: '', injuryType: '', transportDestination: '' }] });
  };

  const updateVictim = (id: string, field: keyof Victim, value: string) => {
    setFormData({ ...formData, victims: formData.victims.map(v => v.id === id ? { ...v, [field]: value } : v) });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, reader.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-3 md:py-10 pb-40">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        {/* Header optimized for mobile */}
        <div className="bg-emerald-900 text-white p-4 text-center">
          <div className="flex justify-between items-center mb-3">
             <div className="text-right text-[9px] font-bold opacity-80 leading-tight">
                <div>جمهورية السودان</div>
                <div>وزارة الداخلية</div>
                <div>شرطة المرور</div>
             </div>
             <div className="bg-white p-1 rounded-full">{SUDAN_TRAFFIC_LOGO}</div>
             <div className="text-left text-[9px] font-mono opacity-80">
                <div className="font-bold">#{formData.ornikNumber}</div>
                <div>{formData.date}</div>
             </div>
          </div>
          <h2 className="text-lg md:text-xl font-bold official-header border-b border-emerald-700 pb-2">أورنيك (8) حوادث المرور</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-4 space-y-6">
          <section>
            <SectionTitle number={1}>موقع الحادث</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الولاية</label>
                <select className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">المحلية</label>
                <input type="text" className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.localArea} onChange={e => setFormData({...formData, localArea: e.target.value})} placeholder="مثال: بحري" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">وصف الموقع</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input type="text" className="w-full h-12 px-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="شارع النيل - تقاطع..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="block text-[10px] text-slate-400">خط العرض</label>
                   <div className="text-xs font-mono bg-slate-100 p-2 rounded-lg">{formData.gps.lat.toFixed(4)}</div>
                 </div>
                 <div>
                   <label className="block text-[10px] text-slate-400">خط الطول</label>
                   <div className="text-xs font-mono bg-slate-100 p-2 rounded-lg">{formData.gps.lng.toFixed(4)}</div>
                 </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle number={2}>تفاصيل الحادث</SectionTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">نوع الحادث</label>
                  <select className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.incidentType} onChange={e => setFormData({...formData, incidentType: e.target.value})}>
                    {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">تاريخ ووقت الحادث</label>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 h-12 px-2 bg-slate-50 border rounded-xl text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    <input type="time" step="1" className="w-32 h-12 px-2 bg-slate-50 border rounded-xl text-sm" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>
              </div>
              <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.incidentDescription} onChange={e => setFormData({...formData, incidentDescription: e.target.value})} placeholder="وصف الحادث ميدانياً..." />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-2">
              <SectionTitle number={3}>المركبات</SectionTitle>
              <button type="button" onClick={addVehicle} className="bg-emerald-600 text-white h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
                <Plus size={16} /> إضافة مركبة
              </button>
            </div>
            <div className="space-y-3">
              {formData.vehicles.map((v) => (
                <div key={v.id} className="p-3 border border-slate-100 bg-slate-50 rounded-2xl relative shadow-sm">
                  <button type="button" onClick={() => removeVehicle(v.id)} className="absolute -top-2 -left-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={14} /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="رقم اللوحة" className="w-full h-10 px-2 border rounded-lg text-sm font-bold" value={v.plateNumber} onChange={e => updateVehicle(v.id, 'plateNumber', e.target.value)} />
                    <input placeholder="نوع المركبة" className="w-full h-10 px-2 border rounded-lg text-sm" value={v.type} onChange={e => updateVehicle(v.id, 'type', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle number={4}>السائق</SectionTitle>
            <div className="space-y-3">
              <input type="text" className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={formData.driver.name} onChange={e => setFormData({...formData, driver: {...formData.driver, name: e.target.value}})} placeholder="الاسم الرباعي للسائق" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.driver.licenseNumber} onChange={e => setFormData({...formData, driver: {...formData.driver, licenseNumber: e.target.value}})} placeholder="رقم الرخصة" />
                <select className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl" value={formData.driver.condition} onChange={e => setFormData({...formData, driver: {...formData.driver, condition: e.target.value}})}>
                  <option value="طبيعي">طبيعي</option>
                  <option value="مخمور">تحت تأثير مسكر</option>
                  <option value="مرهق">مرهق</option>
                </select>
              </div>
            </div>
          </section>

          <section>
             <SectionTitle number={5}>الصور والمرفقات</SectionTitle>
             <div className="grid grid-cols-3 gap-2">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" multiple onChange={handleImageUpload} />
                <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 active:bg-slate-200 transition-all">
                  <Camera size={24} />
                  <span className="text-[10px] mt-1 font-bold">التقط صورة</span>
                </div>
                {formData.attachments.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(p => ({...p, attachments: p.attachments.filter((_,i)=>i!==idx)}))} className="absolute top-1 left-1 bg-red-600 text-white p-1 rounded-full"><X size={10}/></button>
                  </div>
                ))}
             </div>
          </section>

          {/* Fixed Footer Actions for Android */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <button type="submit" className="flex-1 bg-emerald-700 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:bg-emerald-800">
              <Save size={20} /> حفظ الأورنيك
            </button>
            <button type="button" onClick={() => generateOfficialPDF(formData)} className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center border shadow-sm">
              <Printer size={20} />
            </button>
            <button type="button" onClick={onCancel} className="w-14 h-14 bg-white text-red-500 border border-red-100 rounded-2xl flex items-center justify-center">
              <X size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;
