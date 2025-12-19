import { Ornik8Data, IncidentStatus } from '../types';

export const generateOfficialPDF = async (data: Ornik8Data) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html dir="rtl" lang="ar">
      <head>
        <title>أورنيك (8) - ${data.ornikNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700&display=swap');
          body { font-family: 'Tajawal', sans-serif; padding: 30px; color: #333; line-height: 1.5; font-size: 14px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-family: 'Amiri', serif; font-size: 26px; font-weight: bold; margin: 10px 0; }
          .section { border: 1px solid #999; padding: 10px; margin-bottom: 15px; page-break-inside: avoid; border-radius: 4px; }
          .section-title { background: #f3f4f6; padding: 6px 12px; font-weight: bold; border-bottom: 1px solid #999; margin: -10px -10px 10px -10px; color: #111; border-top-left-radius: 4px; border-top-right-radius: 4px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .field { margin-bottom: 6px; }
          .label { font-weight: bold; color: #444; margin-left: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #999; padding: 8px; text-align: right; }
          th { background: #f9fafb; font-size: 13px; }
          .footer { margin-top: 40px; border-top: 2px solid #000; padding-top: 15px; text-align: center; font-size: 12px; }
          .attachments { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
          .attachment-img { width: 100%; height: 120px; object-fit: cover; border: 1px solid #ccc; border-radius: 4px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display:flex; justify-content: space-between; align-items: center;">
            <div style="text-align: right;">
               <div style="font-weight: bold;">جمهورية السودان</div>
               <div style="font-weight: bold;">وزارة الداخلية</div>
               <div style="font-weight: bold;">شرطة المرور</div>
            </div>
            <div class="title">أورنيك (8) حوادث المرور</div>
            <div style="text-align: left;">
               <div>رقم الأورنيك: <span style="font-family: monospace; font-weight: bold;">${data.ornikNumber}</span></div>
               <div>تاريخ البلاغ: ${data.date}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">أولاً: بيانات البلاغ والموقع</div>
          <div class="grid">
            <div class="field"><span class="label">الولاية:</span> ${data.state}</div>
            <div class="field"><span class="label">المحلية:</span> ${data.localArea}</div>
            <div class="field"><span class="label">الموقع:</span> ${data.location}</div>
            <div class="field"><span class="label">الإحداثيات (GPS):</span> ${data.gps.lat}, ${data.gps.lng}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ثانياً: تفاصيل الحادث والظروف المحيطة</div>
          <div class="grid">
            <div class="field"><span class="label">نوع الحادث:</span> ${data.incidentType}</div>
            <div class="field"><span class="label">السبب المبدئي:</span> ${data.incidentCause}</div>
            <div class="field"><span class="label">حالة الطريق:</span> ${data.roadCondition}</div>
            <div class="field"><span class="label">حالة الطقس:</span> ${data.weatherCondition}</div>
          </div>
          <div class="field" style="margin-top:10px;"><span class="label">وصف تفصيلي للحادث:</span><br/> ${data.incidentDescription}</div>
        </div>

        <div class="section">
          <div class="section-title">ثالثاً: بيانات المركبات المشتركة</div>
          <table>
            <thead>
              <tr><th>رقم اللوحة</th><th>نوع المركبة</th><th>اللون</th><th>توصيف الأضرار</th></tr>
            </thead>
            <tbody>
              ${data.vehicles.map(v => `<tr><td>${v.plateNumber}</td><td>${v.type}</td><td>${v.color}</td><td>${v.damages}</td></tr>`).join('')}
              ${data.vehicles.length === 0 ? '<tr><td colspan="4" style="text-align:center;">لا توجد مركبات مسجلة</td></tr>' : ''}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">رابعاً: بيانات السائق</div>
          <div class="grid">
             <div class="field"><span class="label">الاسم:</span> ${data.driver.name}</div>
             <div class="field"><span class="label">رقم الرخصة:</span> ${data.driver.licenseNumber}</div>
             <div class="field"><span class="label">نوع الرخصة:</span> ${data.driver.licenseType}</div>
             <div class="field"><span class="label">جهة الإصدار:</span> ${data.driver.issueAuthority}</div>
             <div class="field"><span class="label">حالة السائق:</span> ${data.driver.condition}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">خامساً: بيانات المصابين والمتوفين</div>
          <table>
            <thead>
              <tr><th>الاسم</th><th>العمر</th><th>نوع الإصابة</th><th>جهة النقل / المشفى</th></tr>
            </thead>
            <tbody>
              ${data.victims.length > 0 ? data.victims.map(v => `<tr><td>${v.name}</td><td>${v.age}</td><td>${v.injuryType}</td><td>${v.transportDestination}</td></tr>`).join('') : '<tr><td colspan="4" style="text-align:center;">لا يوجد إصابات مسجلة</td></tr>'}
            </tbody>
          </table>
        </div>

        ${data.status === IncidentStatus.CLOSED || data.investigation.summary ? `
        <div class="section" style="border: 2px solid #6b21a8;">
          <div class="section-title" style="background: #f3e8ff; border-bottom: 2px solid #6b21a8;">سادساً: نتائج التحقيق الفني</div>
          <div class="field"><span class="label">المحقق الفني:</span> ${data.investigation.investigatorName}</div>
          <div class="field"><span class="label">ملخص التحقيق:</span> ${data.investigation.summary}</div>
          <div class="field"><span class="label">المسؤولية الجنائية/المدنية:</span> ${data.investigation.responsibility}</div>
          <div class="field"><span class="label">تاريخ إغلاق الملف:</span> ${data.investigation.closingDate}</div>
        </div>
        ` : ''}

        ${data.attachments.length > 0 ? `
        <div class="section">
          <div class="section-title">سابعاً: الصور المرفقة بموقع الحادث</div>
          <div class="attachments">
            ${data.attachments.slice(0, 6).map(img => `<img src="${img}" class="attachment-img" />`).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">بيانات الضابط الميداني</div>
          <div class="grid">
            <div class="field">الاسم: ${data.officer.name}</div>
            <div class="field">الرقم العسكري: ${data.officer.militaryId}</div>
            <div class="field">التوقيع: [ختم إلكتروني]</div>
          </div>
        </div>

        <div class="footer">
          <p>هذا المستند تم إنشاؤه إلكترونياً وهو صالح للاستخدام الرسمي بموجب قانون المرور لسنة 2010</p>
          <div style="font-weight: bold; margin-top: 10px;">نظام أورنيك 8 الرقمي - الإدارة العامة للمرور</div>
          <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</p>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #006400; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Tajawal';">طباعة المستند الرسمي</button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};