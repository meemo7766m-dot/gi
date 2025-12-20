/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useRef, useEffect } from 'react';
import { Ornik8Data, Vehicle, Victim, IncidentStatus, UserRole } from '../types';
import { STATES, INCIDENT_TYPES, INCIDENT_CAUSES, SUDAN_TRAFFIC_LOGO, ROAD_CONDITIONS, WEATHER_CONDITIONS } from '../constants';
import { generateOfficialPDF, generateInsuranceReport } from '../services/pdfGenerator';
import { 
  Save, Plus, Trash2, X, Printer, MapPin, Navigation, Clock, 
  Car, Users, Shield, Briefcase, Scale, AlertCircle,
  Loader2, Camera, Trash, FileDown,
  Image as ImageIcon, XCircle, AlertTriangle, 
  ArrowUpRight, Search, ChevronDown, User as UserIcon
} from 'lucide-react';

interface IncidentFormProps {
  initialData: Ornik8Data | null;
  onSave: (data: Ornik8Data) => Promise<void>;
  onCancel: () => void;
  userRole: UserRole;
  currentUserName: string;
}

const SectionTitle: React.FC<{ children: React.ReactNode; number: number; icon: React.ReactNode }> = ({ children, number, icon }) => (
  <div className="flex items-center justify-between bg-slate-100 p-4 rounded-2xl border-r-4 border-emerald-700 mb-6 mt-8 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="bg-emerald-700 text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-lg shadow-emerald-700/20">{number}</div>
      <h3 className="font-black text-slate-800 text-sm md:text-base">{children}</h3>
    </div>
    <div className="text-slate-400">{icon}</div>
  </div>
);

const IncidentForm: React.FC<IncidentFormProps> = ({ initialData, onSave, onCancel, userRole, currentUserName }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');

  const getInitialTime = () => {
    const now = new Date();
    return [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0')
    ].join(':');
  };

  const [formData, setFormData] = useState<Ornik8Data>(initialData || {
    id: crypto.randomUUID(),
    ornikNumber: 'قيد التوليد...',
    date: new Date().toISOString().split('T')[0],
    time: getInitialTime(),
    state: STATES[0],
    localArea: '',
    location: '',
    gps: { lat: 0, lng: 0 },
    incidentType: '',
    incidentCause: INCIDENT_CAUSES[0],
    roadCondition: ROAD_CONDITIONS[0],
    weatherCondition: WEATHER_CONDITIONS[0],
    incidentDescription: '',
    vehicles: [],
    driver: { name: '', licenseNumber: '', licenseType: '', issueAuthority: '', condition: 'طبيعي' },
    victims: [],
    guarantees: [],
    officer: { name: currentUserName, militaryId: '', unit: '', date: new Date().toISOString().split('T')[0] },
    supervisor: { name: currentUserName, notes: '', approvalDate: '', technicalReportApproved: false },
    investigation: { investigatorName: '', summary: '', responsibility: '', technicalInsuranceReport: '', closingDate: '' },
    attachments: [],
    status: IncidentStatus.DRAFT,
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.location.trim()) newErrors.location = 'يرجى تحديد موقع الحادث بدقة';
    if (!formData.incidentType.trim()) newErrors.incidentType = 'يرجى اختيار نوع الحادث';
    if (!formData.incidentDescription.trim()) newErrors.incidentDescription = 'يرجى كتابة وصف مختصر للحادث';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({ ...prev, gps: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
      });
    }
  };

  const addVehicle = () => {
    const newVehicle: Vehicle = { id: crypto.randomUUID(), plateNumber: '', type: '', color: '', licenseAuthority: '', damages: '' };
    setFormData(prev => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
  };

  const removeVehicle = (id: string) => {
    setFormData(prev => ({ ...prev, vehicles: prev.vehicles.filter(v => v.id !== id) }));
  };

  const addVictim = () => {
    const newVictim: Victim = { id: crypto.randomUUID(), name: '', age: '', injuryType: '', transportDestination: '' };
    setFormData(prev => ({ ...prev, victims: [...prev.victims, newVictim] }));
  };

  const removeVictim = (id: string) => {
    setFormData(prev => ({ ...prev, victims: prev.victims.filter(v => v.id !== id) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, attachments: [...prev.attachments, base64String] }));
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  const filteredIncidentTypes = INCIDENT_TYPES.filter(type => 
    type.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const canEditSupervisor = [UserRole.SUPERVISOR, UserRole.ADMIN].includes(userRole);
  const canEditInvestigation = [UserRole.INVESTIGATOR, UserRole.RECORDS, UserRole.ADMIN].includes(userRole);

  return (
    <div className="max-w-4xl mx-auto p-4 md:py-10 pb-40 text-right animate-in fade-in slide-in-from-bottom-4" dir="rtl">
      
      {Object.keys(errors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600">
           <AlertTriangle size={24} className="shrink-0" />
           <div className="text-xs font-black">تنبيه: يرجى إكمال الحقول الإلزامية المطلوبة قبل الحفظ.</div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
        {/* الترويسة الرسمية */}
        <div className="bg-[#062c1e] text-white p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">{SUDAN_TRAFFIC_LOGO}</div>
           <div className="flex flex-col items-center gap-4 mb-6 relative z-10">
              <div className="bg-white p-2 rounded-2xl shadow-xl">{SUDAN_TRAFFIC_LOGO}</div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black official-header">جمهورية السودان - وزارة الداخلية</h2>
                <h3 className="text-xl font-bold official-header">شرطة المرور</h3>
              </div>
           </div>
           <div className="h-px bg-white/20 w-full mb-6"></div>
           <div className="flex justify-between items-end">
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">أورنيك (8) حوادث المرور</p>
                <h1 className="text-3xl font-black mt-1">بلاغ حادث مروري رقمي</h1>
              </div>
              <div className="text-left bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                 <p className="text-[10px] font-bold text-white/50">رقم الأورنيك | التاريخ | الوقت</p>
                 <p className="font-mono font-black text-sm">{formData.ornikNumber} | {formData.date} | {formData.time}</p>
              </div>
           </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          
          {/* القسم 1: بيانات البلاغ */}
          <section>
            <SectionTitle number={1} icon={<MapPin size={20}/>}>بيانات البلاغ</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2">الولاية</label>
                <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2">المحلية</label>
                <input placeholder="المحلية" className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.localArea} onChange={e => setFormData({...formData, localArea: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-black mr-2 ${errors.location ? 'text-red-500' : 'text-slate-500'}`}>موقع الحادث *</label>
                <input placeholder="وصف دقيق للموقع" className={`w-full h-14 bg-slate-50 border-2 rounded-2xl px-4 font-bold transition-all ${errors.location ? 'border-red-500' : 'border-slate-100'}`} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="md:col-span-3">
                 <button onClick={getCurrentLocation} className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-100">
                    <Navigation size={14} /> GPS: {formData.gps.lat.toFixed(4)}, {formData.gps.lng.toFixed(4)} (تلقائي)
                 </button>
              </div>
            </div>
          </section>

          {/* القسم 2: بيانات الحادث */}
          <section>
            <SectionTitle number={2} icon={<AlertCircle size={20}/>}>بيانات الحادث</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2 relative" ref={typeDropdownRef}>
                <label className="text-xs font-black text-slate-500 mr-2">نوع الحادث *</label>
                <div onClick={() => setIsTypeOpen(!isTypeOpen)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 flex items-center justify-between cursor-pointer">
                  <span className="font-bold">{formData.incidentType || 'اختر النوع...'}</span>
                  <ChevronDown size={18} className="text-slate-400" />
                </div>
                {isTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border shadow-2xl z-[200] rounded-2xl overflow-hidden">
                    <div className="p-3 border-b flex items-center gap-2">
                      <Search size={14} className="text-slate-400" />
                      <input placeholder="بحث..." className="flex-1 outline-none font-bold text-sm" value={typeSearch} onChange={e => setTypeSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredIncidentTypes.map(t => (
                        <div key={t} className="p-4 hover:bg-emerald-50 font-bold text-sm cursor-pointer" onClick={() => { setFormData({...formData, incidentType: t}); setIsTypeOpen(false); }}>{t}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2">سبب الحادث</label>
                <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.incidentCause} onChange={e => setFormData({...formData, incidentCause: e.target.value})}>
                  {INCIDENT_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2">حالة الطريق</label>
                <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.roadCondition} onChange={e => setFormData({...formData, roadCondition: e.target.value})}>
                  {ROAD_CONDITIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 mr-2">حالة الطقس</label>
                <select className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.weatherCondition} onChange={e => setFormData({...formData, weatherCondition: e.target.value})}>
                  {WEATHER_CONDITIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black text-slate-500 mr-2">وصف الحادث *</label>
               <textarea placeholder="وصف مختصر للواقعة" className="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 font-bold text-sm resize-none" value={formData.incidentDescription} onChange={e => setFormData({...formData, incidentDescription: e.target.value})}></textarea>
            </div>
          </section>

          {/* القسم 3: بيانات المركبات */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <SectionTitle number={3} icon={<Car size={20}/>}>بيانات المركبة</SectionTitle>
              <button onClick={addVehicle} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] flex items-center gap-2"><Plus size={14}/> إضافة مركبة</button>
            </div>
            {formData.vehicles.map((v, i) => (
              <div key={v.id} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                 <button onClick={() => removeVehicle(v.id)} className="absolute top-2 left-2 text-red-300 hover:text-red-500"><Trash size={14}/></button>
                 <input placeholder="رقم اللوحة" className="h-12 border rounded-xl px-4 font-bold text-xs" value={v.plateNumber} onChange={e => { const n = [...formData.vehicles]; n[i].plateNumber = e.target.value; setFormData({...formData, vehicles: n}); }} />
                 <input placeholder="النوع" className="h-12 border rounded-xl px-4 font-bold text-xs" value={v.type} onChange={e => { const n = [...formData.vehicles]; n[i].type = e.target.value; setFormData({...formData, vehicles: n}); }} />
                 <input placeholder="جهة الترخيص" className="h-12 border rounded-xl px-4 font-bold text-xs" value={v.licenseAuthority} onChange={e => { const n = [...formData.vehicles]; n[i].licenseAuthority = e.target.value; setFormData({...formData, vehicles: n}); }} />
              </div>
            ))}
          </section>

          {/* القسم 4: بيانات السائق */}
          <section>
            <SectionTitle number={4} icon={<UserIcon size={20}/>}>بيانات السائق</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="الاسم الكامل" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.driver.name} onChange={e => setFormData({...formData, driver: {...formData.driver, name: e.target.value}})} />
              <input placeholder="رقم الرخصة" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.driver.licenseNumber} onChange={e => setFormData({...formData, driver: {...formData.driver, licenseNumber: e.target.value}})} />
              <input placeholder="نوع الرخصة" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.driver.licenseType} onChange={e => setFormData({...formData, driver: {...formData.driver, licenseType: e.target.value}})} />
              <input placeholder="حالة السائق" className="h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 font-bold" value={formData.driver.condition} onChange={e => setFormData({...formData, driver: {...formData.driver, condition: e.target.value}})} />
            </div>
          </section>

          {/* القسم 5: المصابون */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <SectionTitle number={5} icon={<Users size={20}/>}>المصابون / المتوفون</SectionTitle>
              <button onClick={addVictim} className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] flex items-center gap-2"><Plus size={14}/> إضافة حالة</button>
            </div>
            <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50"><tr><th className="p-4">الاسم</th><th className="p-4">العمر</th><th className="p-4">الإصابة</th><th className="p-4">النقل</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {formData.victims.map((v, idx) => (
                    <tr key={v.id} className="border-t">
                      <td className="p-2"><input className="w-full font-bold" value={v.name} onChange={e => { const next = [...formData.victims]; next[idx].name = e.target.value; setFormData({...formData, victims: next}); }} /></td>
                      <td className="p-2"><input className="w-full font-bold" value={v.age} onChange={e => { const next = [...formData.victims]; next[idx].age = e.target.value; setFormData({...formData, victims: next}); }} /></td>
                      <td className="p-2"><input className="w-full font-bold" value={v.injuryType} onChange={e => { const next = [...formData.victims]; next[idx].injuryType = e.target.value; setFormData({...formData, victims: next}); }} /></td>
                      <td className="p-2"><input className="w-full font-bold" value={v.transportDestination} onChange={e => { const next = [...formData.victims]; next[idx].transportDestination = e.target.value; setFormData({...formData, victims: next}); }} /></td>
                      <td className="p-2"><button onClick={() => removeVictim(v.id)} className="text-red-300"><Trash size={14}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* القسم 6: بيانات شرطي المرور */}
          <section>
            <SectionTitle number={6} icon={<Shield size={20}/>}>بيانات شرطي المرور</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
               <div className="space-y-1"><p className="text-[10px] font-black text-emerald-600">الاسم</p><p className="font-bold text-slate-800">{formData.officer.name}</p></div>
               <div className="space-y-1"><p className="text-[10px] font-black text-emerald-600">التوقيع</p><p className="italic text-slate-400">توقيع إلكتروني معتمد</p></div>
            </div>
          </section>

          {/* القسم 7: اعتماد المشرف */}
          {canEditSupervisor && (
            <section>
              <SectionTitle number={7} icon={<Briefcase size={20}/>}>اعتماد المشرف</SectionTitle>
              <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-4">
                 <textarea placeholder="ملاحظات المشرف" className="w-full h-24 bg-white border rounded-2xl p-4 font-bold text-sm" value={formData.supervisor.notes} onChange={e => setFormData({...formData, supervisor: {...formData.supervisor, notes: e.target.value}})}></textarea>
                 <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="approve" 
                      checked={formData.supervisor.technicalReportApproved} 
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setFormData({
                          ...formData, 
                          status: isChecked ? IncidentStatus.APPROVED : (formData.status === IncidentStatus.APPROVED ? IncidentStatus.PENDING_APPROVAL : formData.status),
                          supervisor: {
                            ...formData.supervisor, 
                            technicalReportApproved: isChecked, 
                            approvalDate: isChecked ? new Date().toISOString() : ''
                          }
                        });
                      }} 
                    />
                    <label htmlFor="approve" className="text-sm font-black text-blue-800">اعتماد البيانات وصحة الإجراءات الميدانية</label>
                 </div>
              </div>
            </section>
          )}

          {/* القسم 8: التحقيق */}
          {canEditInvestigation && (
            <section>
              <SectionTitle number={8} icon={<Scale size={20}/>}>التحقيق</SectionTitle>
              <div className="bg-purple-50 p-8 rounded-[2.5rem] border border-purple-100 space-y-6">
                 <input placeholder="اسم المحقق" className="w-full h-14 bg-white border rounded-2xl px-4 font-bold" value={formData.investigation.investigatorName} onChange={e => setFormData({...formData, investigation: {...formData.investigation, investigatorName: e.target.value}})} />
                 <textarea placeholder="ملخص التحقيق" className="w-full h-24 bg-white border rounded-2xl p-4 font-bold text-sm" value={formData.investigation.summary} onChange={e => setFormData({...formData, investigation: {...formData.investigation, summary: e.target.value}})}></textarea>
                 <input placeholder="تحديد المسؤولية" className="w-full h-14 bg-white border rounded-2xl px-4 font-bold" value={formData.investigation.responsibility} onChange={e => setFormData({...formData, investigation: {...formData.investigation, responsibility: e.target.value}})} />
              </div>
            </section>
          )}

          {/* القسم 9: المرفقات */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <SectionTitle number={9} icon={<ImageIcon size={20}/>}>المرفقات</SectionTitle>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] flex items-center gap-2"><Camera size={14}/> تصوير ميداني</button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} capture="environment" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              {formData.attachments.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border">
                  <img src={img} className="w-full h-full object-cover" />
                  <button onClick={() => removeAttachment(idx)} className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full"><Trash size={10}/></button>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* الخاتمة والطباعة */}
        <div className="p-10 border-t bg-slate-50 text-center space-y-4">
           <p className="text-[10px] font-black text-slate-400">هذا المستند تم إنشاؤه إلكترونياً وهو صالح للاستخدام الرسمي</p>
           <div className="flex justify-center gap-4">
              <div className="w-20 h-20 bg-white border flex items-center justify-center p-2 rounded-xl shadow-inner">
                 <div className="bg-slate-900 w-full h-full rounded opacity-10 flex items-center justify-center text-[8px] font-black">QR CODE</div>
              </div>
           </div>
        </div>
      </div>

      {/* شريط الإجراءات السفلي */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-6 flex gap-3 z-[150] shadow-2xl items-center justify-center">
        <button onClick={handleSave} disabled={isSubmitting} className="h-14 px-8 bg-[#062c1e] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50">
          {isSubmitting ? <Loader2 className="animate-spin"/> : <Save size={18}/>} حفظ البلاغ
        </button>
        <button onClick={() => generateOfficialPDF(formData)} className="h-14 px-6 bg-slate-100 text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 border transition-all"><Printer size={18}/> طباعة أورنيك 8</button>
        <button onClick={onCancel} className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100"><X size={20}/></button>
      </div>

    </div>
  );
};

export default IncidentForm;