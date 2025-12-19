import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import 'dart:typed_data';
import '../models/incident_model.dart';

class PDFService {
  static Future<Uint8List> generateIncidentPDF(Incident incident) async {
    final pdf = pw.Document();
    final arabicFont = await PdfGoogleFonts.cairoRegular();
    final arabicFontBold = await PdfGoogleFonts.cairoBold();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(20),
        textDirection: pw.TextDirection.rtl,
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: [
              _buildHeader(arabicFont, arabicFontBold),
              pw.SizedBox(height: 20),
              _buildSection1(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection2(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection3(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection4(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection5(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection6(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection7(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 15),
              _buildSection8(incident, arabicFont, arabicFontBold),
              pw.SizedBox(height: 20),
              _buildFooter(incident, arabicFont),
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildHeader(pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Text(
          'جمهورية السودان',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: boldFont, fontSize: 14),
        ),
        pw.Text(
          'وزارة الداخلية',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: boldFont, fontSize: 14),
        ),
        pw.Text(
          'شرطة المرور',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: boldFont, fontSize: 14),
        ),
        pw.SizedBox(height: 10),
        pw.Text(
          'نموذج أورنيك (8) - حوادث المرور الإلكترونية',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: boldFont, fontSize: 16),
        ),
      ],
    );
  }

  static pw.Widget _buildSection1(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الأول: بيانات البلاغ',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        _buildFieldRow('رقم الأورنيك:', incident.ornickNumber, font),
        _buildFieldRow('التاريخ:', DateFormat('dd/MM/yyyy').format(incident.incidentDate), font),
        _buildFieldRow('الوقت:', DateFormat('HH:mm').format(incident.incidentDate), font),
        _buildFieldRow('الولاية:', incident.state ?? 'غير محدد', font),
        _buildFieldRow('المحلية:', incident.locality, font),
        _buildFieldRow('موقع الحادث:', incident.incidentLocation, font),
        if (incident.latitude != null && incident.longitude != null)
          _buildFieldRow('GPS:', '${incident.latitude?.toStringAsFixed(6)}, ${incident.longitude?.toStringAsFixed(6)}', font),
      ],
    );
  }

  static pw.Widget _buildSection2(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الثاني: بيانات الحادث',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        _buildFieldRow('نوع الحادث:', incident.incidentType, font),
        _buildFieldRow('سبب الحادث:', incident.incidentCause, font),
        _buildFieldRow('حالة الطريق:', incident.roadCondition, font),
        _buildFieldRow('حالة الطقس:', incident.weatherCondition, font),
        _buildFieldRow('وصف الحادث:', incident.incidentDescription, font),
      ],
    );
  }

  static pw.Widget _buildSection3(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الثالث: بيانات المركبات',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        if (incident.vehicles.isEmpty)
          pw.Text('لا توجد مركبات مسجلة', style: pw.TextStyle(font: font))
        else
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: incident.vehicles.map((vehicle) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Divider(),
                  _buildFieldRow('رقم اللوحة:', vehicle.plateNumber, font),
                  _buildFieldRow('نوع المركبة:', vehicle.vehicleType, font),
                  _buildFieldRow('اللون:', vehicle.color, font),
                  _buildFieldRow('جهة الترخيص:', vehicle.licensingAuthority, font),
                  _buildFieldRow('الأضرار:', vehicle.damages, font),
                ],
              );
            }).toList(),
          ),
      ],
    );
  }

  static pw.Widget _buildSection4(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الرابع: بيانات السائقين',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        if (incident.drivers.isEmpty)
          pw.Text('لا يوجد سائقون مسجلون', style: pw.TextStyle(font: font))
        else
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: incident.drivers.map((driver) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Divider(),
                  _buildFieldRow('الاسم:', driver.name, font),
                  _buildFieldRow('رقم الرخصة:', driver.licenseNumber, font),
                  _buildFieldRow('نوع الرخصة:', driver.licenseType, font),
                  _buildFieldRow('جهة الإصدار:', driver.issuingAuthority, font),
                  _buildFieldRow('حالة السائق:', driver.driverCondition, font),
                ],
              );
            }).toList(),
          ),
      ],
    );
  }

  static pw.Widget _buildSection5(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الخامس: المصابون والمتوفون',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        if (incident.injuries.isEmpty)
          pw.Text('لا توجد إصابات مسجلة', style: pw.TextStyle(font: font))
        else
          pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.end,
            children: incident.injuries.map((injury) {
              return pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Divider(),
                  _buildFieldRow('الاسم:', injury.name, font),
                  _buildFieldRow('العمر:', injury.age.toString(), font),
                  _buildFieldRow('نوع الإصابة:', injury.injuryType, font),
                  _buildFieldRow('جهة النقل:', injury.transportMethod, font),
                ],
              );
            }).toList(),
          ),
      ],
    );
  }

  static pw.Widget _buildSection6(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم السادس: بيانات شرطي المرور',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        _buildFieldRow('الاسم:', incident.officerName ?? 'لم يتم التوقيع بعد', font),
        _buildFieldRow('الرقم العسكري:', incident.officerMilitaryNumber ?? '', font),
        _buildFieldRow('الوحدة:', incident.officerUnit ?? '', font),
        if (incident.officerSignatureDate != null)
          _buildFieldRow('تاريخ التوقيع:', DateFormat('dd/MM/yyyy').format(incident.officerSignatureDate!), font),
      ],
    );
  }

  static pw.Widget _buildSection7(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم السابع: اعتماد المشرف',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        _buildFieldRow('الاسم:', incident.supervisorName ?? 'لم يتم الاعتماد بعد', font),
        _buildFieldRow('الملاحظات:', incident.supervisorNotes ?? '', font),
        if (incident.supervisorApprovalDate != null)
          _buildFieldRow('تاريخ الاعتماد:', DateFormat('dd/MM/yyyy').format(incident.supervisorApprovalDate!), font),
      ],
    );
  }

  static pw.Widget _buildSection8(Incident incident, pw.Font font, pw.Font boldFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.end,
      children: [
        pw.Text(
          'القسم الثامن: التحقيق',
          style: pw.TextStyle(font: boldFont, fontSize: 12, decoration: pw.TextDecoration.underline),
        ),
        pw.SizedBox(height: 8),
        _buildFieldRow('اسم المحقق:', incident.investigatorName ?? 'قيد التحقيق', font),
        _buildFieldRow('ملخص التحقيق:', incident.investigationSummary ?? '', font),
        _buildFieldRow('تحديد المسؤولية:', incident.responsibility ?? '', font),
        if (incident.investigationClosureDate != null)
          _buildFieldRow('تاريخ الإغلاق:', DateFormat('dd/MM/yyyy').format(incident.investigationClosureDate!), font),
      ],
    );
  }

  static pw.Widget _buildFooter(Incident incident, pw.Font font) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.center,
      children: [
        pw.Divider(),
        pw.SizedBox(height: 10),
        pw.Text(
          'هذا المستند تم إنشاؤه إلكترونياً وهو صالح للاستخدام الرسمي',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: font, fontSize: 10),
        ),
        pw.Text(
          'تاريخ الطباعة: ${DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())}',
          textAlign: pw.TextAlign.center,
          style: pw.TextStyle(font: font, fontSize: 10),
        ),
      ],
    );
  }

  static pw.Widget _buildFieldRow(String label, String value, pw.Font font) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 4),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(
            label,
            style: pw.TextStyle(font: font, fontSize: 11),
          ),
          pw.Text(
            value,
            style: pw.TextStyle(font: font, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
