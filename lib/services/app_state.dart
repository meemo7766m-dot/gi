import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/incident_model.dart';
import '../database/database_service.dart';

final databaseProvider = Provider((ref) => DatabaseService());

final currentUserProvider = StateProvider<User?>((ref) => null);

final currentIncidentProvider = StateProvider<Incident?>((ref) => null);

final incidentsProvider = FutureProvider((ref) async {
  final db = ref.watch(databaseProvider);
  return await db.getAllIncidents();
});

final incidentsByStatusProvider = FutureProvider.family((ref, IncidentStatus status) async {
  final db = ref.watch(databaseProvider);
  return await db.getIncidentsByStatus(status);
});

final connectivityProvider = StreamProvider((ref) {
  return Connectivity().onConnectivityChanged.map((result) {
    return result.contains(ConnectivityResult.none) ? false : true;
  });
});

final draftIncidentsProvider = FutureProvider((ref) async {
  final db = ref.watch(databaseProvider);
  return await db.getIncidentsByStatus(IncidentStatus.draft);
});

final submittedIncidentsProvider = FutureProvider((ref) async {
  final db = ref.watch(databaseProvider);
  return await db.getIncidentsByStatus(IncidentStatus.submitted);
});

final approvedIncidentsProvider = FutureProvider((ref) async {
  final db = ref.watch(databaseProvider);
  return await db.getIncidentsByStatus(IncidentStatus.approved);
});

final closedIncidentsProvider = FutureProvider((ref) async {
  final db = ref.watch(databaseProvider);
  return await db.getIncidentsByStatus(IncidentStatus.closed);
});
