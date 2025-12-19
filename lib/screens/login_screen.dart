import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/incident_model.dart';
import '../database/database_service.dart';
import '../services/app_state.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final nameController = TextEditingController();
  final militaryNumberController = TextEditingController();
  final unitController = TextEditingController();
  UserRole? selectedRole;
  bool isLoading = false;

  @override
  void dispose() {
    nameController.dispose();
    militaryNumberController.dispose();
    unitController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (nameController.text.isEmpty ||
        militaryNumberController.text.isEmpty ||
        unitController.text.isEmpty ||
        selectedRole == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى ملء جميع الحقول')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final db = ref.read(databaseProvider);

      final newUser = User(
        name: nameController.text,
        militaryNumber: militaryNumberController.text,
        role: selectedRole!,
        unit: unitController.text,
      );

      await db.addUser(newUser);
      ref.read(currentUserProvider.notifier).state = newUser;

      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'نظام إدارة الحوادث المرورية',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'جمهورية السودان - وزارة الداخلية - شرطة المرور',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 40),
                  TextField(
                    controller: nameController,
                    decoration: InputDecoration(
                      labelText: 'الاسم الكامل',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      prefixIcon: const Icon(Icons.person),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                    textAlign: TextAlign.right,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: militaryNumberController,
                    decoration: InputDecoration(
                      labelText: 'الرقم العسكري',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      prefixIcon: const Icon(Icons.badge),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                    textAlign: TextAlign.right,
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: unitController,
                    decoration: InputDecoration(
                      labelText: 'الوحدة/القسم',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      prefixIcon: const Icon(Icons.location_city),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                    textAlign: TextAlign.right,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<UserRole>(
                    decoration: InputDecoration(
                      labelText: 'نوع المستخدم',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.all(16),
                    ),
                    isExpanded: true,
                    items: [
                      DropdownMenuItem(
                        value: UserRole.trafficOfficer,
                        child: const Text('شرطي المرور'),
                      ),
                      DropdownMenuItem(
                        value: UserRole.supervisor,
                        child: const Text('مشرف المرور'),
                      ),
                      DropdownMenuItem(
                        value: UserRole.investigator,
                        child: const Text('محقق الحوادث'),
                      ),
                      DropdownMenuItem(
                        value: UserRole.admin,
                        child: const Text('مسؤول النظام'),
                      ),
                    ],
                    onChanged: (value) {
                      setState(() => selectedRole = value);
                    },
                    initialValue: selectedRole,
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'دخول',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
