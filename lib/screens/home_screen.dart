import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/incident_model.dart';
import '../services/app_state.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة التحكم الرئيسية'),
        centerTitle: true,
        backgroundColor: Colors.blue,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Center(
              child: Text(
                currentUser?.name ?? 'مستخدم',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              color: Colors.blue.withOpacity(0.1),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'أهلاً وسهلاً',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${currentUser?.name ?? "مستخدم"} - ${currentUser?.role.toString().split('.').last ?? ""}',
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (currentUser?.role == UserRole.trafficOfficer ||
                      currentUser?.role == UserRole.admin)
                    _buildMenuButton(
                      context,
                      'تسجيل حادث جديد',
                      Icons.add_circle_outline,
                      Colors.green,
                      () => Navigator.of(context).pushNamed('/new_incident'),
                    ),
                  if (currentUser?.role == UserRole.trafficOfficer ||
                      currentUser?.role == UserRole.supervisor ||
                      currentUser?.role == UserRole.admin)
                    _buildMenuButton(
                      context,
                      'الحوادث المعلقة',
                      Icons.pending_actions,
                      Colors.orange,
                      () => Navigator.of(context).pushNamed('/incidents_list', arguments: IncidentStatus.submitted),
                    ),
                  if (currentUser?.role == UserRole.supervisor ||
                      currentUser?.role == UserRole.admin)
                    _buildMenuButton(
                      context,
                      'الاعتماد والمراجعة',
                      Icons.check_circle_outline,
                      Colors.blue,
                      () => Navigator.of(context).pushNamed('/incidents_list', arguments: IncidentStatus.approved),
                    ),
                  if (currentUser?.role == UserRole.investigator ||
                      currentUser?.role == UserRole.admin)
                    _buildMenuButton(
                      context,
                      'التحقيقات',
                      Icons.assessment,
                      Colors.purple,
                      () => Navigator.of(context).pushNamed('/incidents_list', arguments: IncidentStatus.underInvestigation),
                    ),
                  _buildMenuButton(
                    context,
                    'كل الحوادث',
                    Icons.list,
                    Colors.indigo,
                    () => Navigator.of(context).pushNamed('/all_incidents'),
                  ),
                  _buildMenuButton(
                    context,
                    'الأرشيف',
                    Icons.archive,
                    Colors.teal,
                    () => Navigator.of(context).pushNamed('/archive'),
                  ),
                  _buildMenuButton(
                    context,
                    'الإحصائيات والتقارير',
                    Icons.bar_chart,
                    Colors.red,
                    () => Navigator.of(context).pushNamed('/reports'),
                  ),
                  _buildMenuButton(
                    context,
                    'الإعدادات',
                    Icons.settings,
                    Colors.grey,
                    () => Navigator.of(context).pushNamed('/settings'),
                  ),
                  const SizedBox(height: 16),
                  _buildMenuButton(
                    context,
                    'تسجيل الخروج',
                    Icons.logout,
                    Colors.redAccent,
                    () {
                      ref.read(currentUserProvider.notifier).state = null;
                      Navigator.of(context).pushReplacementNamed('/login');
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuButton(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: color, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(icon, color: color, size: 28),
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: color,
                    ),
                  ),
                ),
                Icon(Icons.arrow_forward, color: color),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
