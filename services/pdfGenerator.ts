
import { Ornik8Data, IncidentStatus } from '../types';

// توليد أورنيك 8 الرسمي الشامل
export const generateOfficialPDF = async (data: Ornik8Data) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html dir="rtl" lang="ar">
      <head>
        <title>أورنيك (8) - ${data.ornikNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700&display=swap');
          body { font-family: 'Tajawal', sans-serif; padding: 20px; color: #111; line-height: 1.4; font-size: 12px; background: #fff; }
          .container { border: 2px solid #000; padding: 20px; position: relative; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .header-top { display: flex; justify-content: space-between; align-items: center; }
          .title { font-family: 'Amiri', serif; font-size: 24px; font-weight: bold; margin: 5px 0; }
          .section { border: 1px solid #000; margin-bottom: 10px; page-break-inside: avoid; }
          .section-title { background: #eee; padding: 4px 10px; font-weight: bold; border-bottom: 1px solid #000; font-size: 13px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 8px; }
          .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 8px; }
          .field { margin-bottom: 2px; }
          .label { font-weight: bold; margin-left: 5px; text-decoration: underline; }
          table { width: 100%; border-collapse: collapse; margin-top: 0; }
          th, td { border: 1px solid #000; padding: 6px; text-align: right; font-size: 11px; }
          th { background: #f2f2f2; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
          .signature-area { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 10px; margin-top: 10px; }
          .sig-box { border: 1px dashed #999; padding: 10px; text-align: center; height: 80px; }
          @media print { .no-print { display: none; } body { padding: 0; } .container { border: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div style="text-align: right;">
                 <div>جمهورية السودان</div>
                 <div>وزارة الداخلية</div>
                 <div>رئاسة شرطة المرور</div>
              </div>
              <div>
                <div class="title">أورنيك رقم (8) حوادث</div>
                <div style="font-weight: bold;">سجل الحوادث والتحقيق الميداني</div>
              </div>
              <div style="text-align: left;">
                 <div>الرقم: <strong>${data.ornikNumber}</strong></div>
                 <div>التاريخ: ${data.date}</div>
                 <div>الوقت: ${data.time}</div>
              </div>
            </div>
          </div>

          <!-- القسم 1 & 2: الموقع والظروف -->
          <div class="section">
            <div class="section-title">أولاً: بيانات البلاغ وظروف الحادث</div>
            <div class="grid">
              <div class="field"><span class="label">الولاية:</span> ${data.state}</div>
              <div class="field"><span class="label">المحلية:</span> ${data.localArea}</div>
              <div class="field"><span class="label">الموقع:</span> ${data.location}</div>
              <div class="field"><span class="label">نوع الحادث:</span> ${data.incidentType}</div>
              <div class="field"><span class="label">حالة الطريق:</span> ${data.roadCondition}</div>
              <div class="field"><span class="label">حالة الطقس:</span> ${data.weatherCondition}</div>
              <div class="field" style="grid-column: span 2;"><span class="label">سبب الحادث:</span> ${data.incidentCause}</div>
            </div>
            <div style="padding: 8px; border-top: 1px solid #000;">
              <span class="label">وصف الحادث:</span>
              <p style="margin: 5px 0;">${data.incidentDescription || 'لا يوجد وصف مضاف'}</p>
            </div>
          </div>

          <!-- القسم 3: المركبات -->
          <div class="section">
            <div class="section-title">ثانياً: بيانات المركبات المشتركة في الحادث</div>
            <table>
              <thead>
                <tr>
                  <th>رقم اللوحة</th>
                  <th>نوع المركبة</th>
                  <th>اللون</th>
                  <th>جهة الترخيص</th>
                  <th>الأضرار والملاحظات</th>
                </tr>
              </thead>
              <tbody>
                ${data.vehicles.length > 0 ? data.vehicles.map(v => `
                  <tr>
                    <td>${v.plateNumber}</td>
                    <td>${v.type}</td>
                    <td>${v.color}</td>
                    <td>${v.licenseAuthority}</td>
                    <td>${v.damages}</td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;">لا توجد مركبات مسجلة</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- القسم 4: السائق -->
          <div class="section">
            <div class="section-title">ثالثاً: بيانات السائق</div>
            <div class="grid-3">
              <div class="field"><span class="label">الاسم:</span> ${data.driver.name || '---'}</div>
              <div class="field"><span class="label">رقم الرخصة:</span> ${data.driver.licenseNumber || '---'}</div>
              <div class="field"><span class="label">نوعها:</span> ${data.driver.licenseType || '---'}</div>
              <div class="field"><span class="label">جهة الإصدار:</span> ${data.driver.issueAuthority || '---'}</div>
              <div class="field" style="grid-column: span 2;"><span class="label">حالة السائق:</span> ${data.driver.condition || 'طبيعي'}</div>
            </div>
          </div>

          <!-- القسم 5: المصابون -->
          <div class="section">
            <div class="section-title">رابعاً: كشف المصابين والمتوفين</div>
            <table>
              <thead>
                <tr>
                  <th>الاسم بالكامل</th>
                  <th>العمر</th>
                  <th>نوع الإصابة</th>
                  <th>جهة النقل / المستشفى</th>
                </tr>
              </thead>
              <tbody>
                ${data.victims.length > 0 ? data.victims.map(v => `
                  <tr>
                    <td>${v.name}</td>
                    <td>${v.age}</td>
                    <td>${v.injuryType}</td>
                    <td>${v.transportDestination}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align:center;">لا يوجد مصابين أو متوفين بحمد الله</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- القسم 10: الضمانات -->
          <div class="section">
            <div class="section-title">خامساً: بيانات الضمانات والتدابير القانونية</div>
            <table>
              <thead>
                <tr>
                  <th>اسم الضامن</th>
                  <th>الرقم الوطني</th>
                  <th>الهاتف</th>
                  <th>نوع الضمانة</th>
                </tr>
              </thead>
              <tbody>
                ${data.guarantees.length > 0 ? data.guarantees.map(g => `
                  <tr>
                    <td>${g.guarantorName}</td>
                    <td>${g.nationalId}</td>
                    <td>${g.phone}</td>
                    <td>${g.guaranteeType}</td>
                  </tr>
                `).join('') : '<tr><td colspan="4" style="text-align:center;">لا توجد ضمانات مسجلة حالياً</td></tr>'}
              </tbody>
            </table>
          </div>

          <!-- التحقيق والاعتماد -->
          <div class="section">
            <div class="section-title">سادساً: التحقيق الفني والمسؤولية</div>
            <div style="padding: 10px;">
              <div class="field"><span class="label">اسم المحقق:</span> ${data.investigation.investigatorName || 'قيد التحقيق'}</div>
              <div class="field"><span class="label">تحديد المسؤولية:</span> ${data.investigation.responsibility || 'لم تحدد بعد'}</div>
              <div class="field" style="margin-top: 5px;"><span class="label">ملخص التحقيق:</span></div>
              <p style="margin: 5px 0; border: 1px solid #eee; padding: 5px; min-height: 40px;">${data.investigation.summary || '---'}</p>
            </div>
          </div>

          <div class="signature-area">
            <div class="sig-box">
              <div style="font-weight:bold; font-size:10px;">شرطي المرور (الميدان)</div>
              <div style="margin-top:10px; font-size:11px;">${data.officer.name}</div>
              <div style="font-size:9px;">الرقم: ${data.officer.militaryId || '---'}</div>
            </div>
            <div class="sig-box">
              <div style="font-weight:bold; font-size:10px;">المحقق الفني</div>
              <div style="margin-top:10px; font-size:11px;">${data.investigation.investigatorName || '---'}</div>
            </div>
            <div class="sig-box">
              <div style="font-weight:bold; font-size:10px;">اعتماد المشرف</div>
              <div style="margin-top:10px; font-size:11px;">${data.supervisor.name || '---'}</div>
            </div>
          </div>

          <div class="footer">
            <div style="display:flex; justify-content: space-between;">
              <span>تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</span>
              <span style="font-weight:bold;">مستند رسمي إلكتروني - شرطة المرور السودانية</span>
              <span>رقم التحقق: QR-${data.id.slice(0,8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 30px; background: #065f46; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Tajawal';">إصدار وطباعة الأورنيك</button>
          <button onclick="window.close()" style="padding: 12px 30px; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-family: 'Tajawal'; margin-right: 10px;">إغلاق</button>
        </div>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

// توليد التقرير الفني لشركات التأمين
export const generateInsuranceReport = async (data: Ornik8Data) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <html dir="rtl" lang="ar">
      <head>
        <title>تقرير فني للتأمين - ${data.ornikNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;700&display=swap');
          body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #111; border: 5px double #000; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-family: 'Amiri', serif; font-size: 28px; font-weight: bold; border-bottom: 2px solid #000; display: inline-block; padding: 5px 20px; }
          .content { margin-top: 30px; line-height: 1.8; font-size: 16px; }
          .signature-box { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .stamp { border: 2px solid #000; width: 150px; height: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0.3; font-weight: bold; margin: 20px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-weight:bold;">جمهورية السودان - وزارة الداخلية</div>
          <div style="font-weight:bold;">رئاسة شرطة المرور - قسم التحقيق الفني</div>
          <br/>
          <div class="title">تقرير فني لشركات التأمين</div>
        </div>

        <div class="content">
          <p>إلى من يهمه الأمر / شركة التأمين الموقرة،</p>
          <p>بالإشارة إلى الحادث المروري رقم <strong>(${data.ornikNumber})</strong> بتاريخ <strong>(${data.date})</strong> بموقع <strong>(${data.location})</strong>.</p>
          <p><strong>أولاً: وصف المركبات المتضررة:</strong></p>
          <ul>
            ${data.vehicles.map(v => `<li>مركبة رقم (${v.plateNumber}) - نوع (${v.type}) - الأضرار: ${v.damages}</li>`).join('')}
          </ul>
          <p><strong>ثانياً: التقرير الفني للمحقق:</strong></p>
          <div style="background:#f9fafb; padding:15px; border:1px solid #ddd; min-height:100px;">
            ${data.investigation.technicalInsuranceReport || 'لا يوجد تقرير فني مسجل'}
          </div>
          <p><strong>ثالثاً: تحديد المسؤولية الفنية:</strong></p>
          <p>${data.investigation.responsibility}</p>
        </div>

        <div class="signature-box">
          <div style="text-align: center;">
            <p><strong>المحقق الفني</strong></p>
            <p>${data.investigation.investigatorName}</p>
            <p>التوقيع: .....................</p>
          </div>
          <div style="text-align: center;">
            <p><strong>اعتماد رئيس القسم (المشرف)</strong></p>
            <p>${data.supervisor.name}</p>
            <p>التوقيع: .....................</p>
          </div>
        </div>

        <div class="stamp">ختم الإدارة</div>
        <div style="text-align:center; font-size:10px; color:#666; margin-top:30px;">تم إصدار هذا التقرير آلياً عبر نظام أورنيك 8 الرقمي</div>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

// توليد التقرير اليومي للإدارة
export const generateDailySummary = async (incidents: Ornik8Data[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const today = new Date().toISOString().split('T')[0];
  const todayIncidents = incidents.filter(i => i.date === today);

  const html = `
    <html dir="rtl" lang="ar">
      <head>
        <title>التقرير اليومي لإحصائيات المرور - ${today}</title>
        <style>
          body { font-family: 'Tajawal', sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 10px; text-align: center; }
          th { background: #eee; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
          .card { border: 1px solid #000; padding: 15px; text-align: center; }
        </style>
      </head>
      <body>
        <h2>تقرير العمل اليومي - شرطة المرور</h2>
        <p>التاريخ: ${today}</p>

        <div class="summary">
          <div class="card"><strong>إجمالي البلاغات</strong><br/>${todayIncidents.length}</div>
          <div class="card"><strong>بلاغات مغلقة</strong><br/>${todayIncidents.filter(i => i.status === IncidentStatus.CLOSED).length}</div>
          <div class="card"><strong>إجمالي الضمانات</strong><br/>${todayIncidents.reduce((acc, curr) => acc + curr.guarantees.length, 0)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>رقم الأورنيك</th>
              <th>الموقع</th>
              <th>الحالة</th>
              <th>عدد المركبات</th>
              <th>الضمانات</th>
            </tr>
          </thead>
          <tbody>
            ${todayIncidents.map(i => `
              <tr>
                <td>${i.ornikNumber}</td>
                <td>${i.location}</td>
                <td>${i.status}</td>
                <td>${i.vehicles.length}</td>
                <td>${i.guarantees.length}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};
