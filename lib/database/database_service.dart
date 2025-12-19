import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:uuid/uuid.dart';
import '../models/incident_model.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  static Database? _database;

  factory DatabaseService() {
    return _instance;
  }

  DatabaseService._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, 'traffic_incidents.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDb,
    );
  }

  Future<void> _createDb(Database db, int version) async {
    await db.execute('''
      CREATE TABLE incidents (
        id TEXT PRIMARY KEY,
        ornickNumber TEXT UNIQUE,
        createdDate TEXT,
        incidentDate TEXT,
        locality TEXT,
        incidentLocation TEXT,
        latitude REAL,
        longitude REAL,
        incidentType TEXT,
        incidentCause TEXT,
        roadCondition TEXT,
        weatherCondition TEXT,
        incidentDescription TEXT,
        officerName TEXT,
        officerMilitaryNumber TEXT,
        officerUnit TEXT,
        officerSignature TEXT,
        officerSignatureDate TEXT,
        supervisorName TEXT,
        supervisorNotes TEXT,
        supervisorSignature TEXT,
        supervisorApprovalDate TEXT,
        investigatorName TEXT,
        investigationSummary TEXT,
        responsibility TEXT,
        investigatorSignature TEXT,
        investigationClosureDate TEXT,
        attachmentPaths TEXT,
        status TEXT,
        state TEXT,
        syncStatus TEXT DEFAULT 'pending'
      )
    ''');

    await db.execute('''
      CREATE TABLE vehicles (
        id TEXT PRIMARY KEY,
        incidentId TEXT NOT NULL,
        plateNumber TEXT,
        vehicleType TEXT,
        color TEXT,
        licensingAuthority TEXT,
        damages TEXT,
        driverName TEXT,
        FOREIGN KEY(incidentId) REFERENCES incidents(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE drivers (
        id TEXT PRIMARY KEY,
        incidentId TEXT NOT NULL,
        name TEXT,
        licenseNumber TEXT,
        licenseType TEXT,
        issuingAuthority TEXT,
        driverCondition TEXT,
        FOREIGN KEY(incidentId) REFERENCES incidents(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE injuries (
        id TEXT PRIMARY KEY,
        incidentId TEXT NOT NULL,
        name TEXT,
        age INTEGER,
        injuryType TEXT,
        transportMethod TEXT,
        FOREIGN KEY(incidentId) REFERENCES incidents(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE attachments (
        id TEXT PRIMARY KEY,
        incidentId TEXT NOT NULL,
        filePath TEXT,
        fileType TEXT,
        createdDate TEXT,
        FOREIGN KEY(incidentId) REFERENCES incidents(id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT,
        militaryNumber TEXT UNIQUE,
        role TEXT,
        unit TEXT
      )
    ''');
  }

  Future<String> addIncident(Incident incident) async {
    final db = await database;
    await db.insert('incidents', _incidentToMap(incident));
    
    for (var vehicle in incident.vehicles) {
      await db.insert('vehicles', {
        ...vehicle.toMap(),
        'incidentId': incident.id,
      });
    }
    
    for (var driver in incident.drivers) {
      await db.insert('drivers', {
        ...driver.toMap(),
        'incidentId': incident.id,
      });
    }
    
    for (var injury in incident.injuries) {
      await db.insert('injuries', {
        ...injury.toMap(),
        'incidentId': incident.id,
      });
    }
    
    return incident.id;
  }

  Future<Incident?> getIncident(String id) async {
    final db = await database;
    final result = await db.query('incidents', where: 'id = ?', whereArgs: [id]);
    
    if (result.isEmpty) return null;
    
    final incidentData = result.first;
    
    final vehicles = await db.query('vehicles', where: 'incidentId = ?', whereArgs: [id]);
    final drivers = await db.query('drivers', where: 'incidentId = ?', whereArgs: [id]);
    final injuries = await db.query('injuries', where: 'incidentId = ?', whereArgs: [id]);
    
    return Incident.fromMap({
      ...incidentData,
      'vehicles': vehicles,
      'drivers': drivers,
      'injuries': injuries,
    });
  }

  Future<List<Incident>> getAllIncidents() async {
    final db = await database;
    final result = await db.query('incidents', orderBy: 'createdDate DESC');
    
    List<Incident> incidents = [];
    for (var incidentData in result) {
      final id = incidentData['id'] as String;
      final vehicles = await db.query('vehicles', where: 'incidentId = ?', whereArgs: [id]);
      final drivers = await db.query('drivers', where: 'incidentId = ?', whereArgs: [id]);
      final injuries = await db.query('injuries', where: 'incidentId = ?', whereArgs: [id]);
      
      incidents.add(Incident.fromMap({
        ...incidentData,
        'vehicles': vehicles,
        'drivers': drivers,
        'injuries': injuries,
      }));
    }
    
    return incidents;
  }

  Future<List<Incident>> getIncidentsByStatus(IncidentStatus status) async {
    final db = await database;
    final result = await db.query(
      'incidents',
      where: 'status = ?',
      whereArgs: [status.toString()],
      orderBy: 'createdDate DESC',
    );
    
    List<Incident> incidents = [];
    for (var incidentData in result) {
      final id = incidentData['id'] as String;
      final vehicles = await db.query('vehicles', where: 'incidentId = ?', whereArgs: [id]);
      final drivers = await db.query('drivers', where: 'incidentId = ?', whereArgs: [id]);
      final injuries = await db.query('injuries', where: 'incidentId = ?', whereArgs: [id]);
      
      incidents.add(Incident.fromMap({
        ...incidentData,
        'vehicles': vehicles,
        'drivers': drivers,
        'injuries': injuries,
      }));
    }
    
    return incidents;
  }

  Future<void> updateIncident(Incident incident) async {
    final db = await database;
    
    await db.update(
      'incidents',
      _incidentToMap(incident),
      where: 'id = ?',
      whereArgs: [incident.id],
    );
    
    await db.delete('vehicles', where: 'incidentId = ?', whereArgs: [incident.id]);
    await db.delete('drivers', where: 'incidentId = ?', whereArgs: [incident.id]);
    await db.delete('injuries', where: 'incidentId = ?', whereArgs: [incident.id]);
    
    for (var vehicle in incident.vehicles) {
      await db.insert('vehicles', {
        ...vehicle.toMap(),
        'incidentId': incident.id,
      });
    }
    
    for (var driver in incident.drivers) {
      await db.insert('drivers', {
        ...driver.toMap(),
        'incidentId': incident.id,
      });
    }
    
    for (var injury in incident.injuries) {
      await db.insert('injuries', {
        ...injury.toMap(),
        'incidentId': incident.id,
      });
    }
  }

  Future<void> deleteIncident(String id) async {
    final db = await database;
    await db.delete('incidents', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> addUser(User user) async {
    final db = await database;
    await db.insert('users', user.toMap());
  }

  Future<User?> getUser(String militaryNumber) async {
    final db = await database;
    final result = await db.query(
      'users',
      where: 'militaryNumber = ?',
      whereArgs: [militaryNumber],
    );
    
    if (result.isEmpty) return null;
    return User.fromMap(result.first);
  }

  Future<void> addAttachment(String incidentId, String filePath, String fileType) async {
    final db = await database;
    await db.insert('attachments', {
      'id': const Uuid().v4(),
      'incidentId': incidentId,
      'filePath': filePath,
      'fileType': fileType,
      'createdDate': DateTime.now().toIso8601String(),
    });
  }

  Future<List<String>> getAttachments(String incidentId) async {
    final db = await database;
    final result = await db.query(
      'attachments',
      where: 'incidentId = ?',
      whereArgs: [incidentId],
    );
    
    return result.map((r) => r['filePath'] as String).toList();
  }

  Map<String, dynamic> _incidentToMap(Incident incident) {
    return {
      'id': incident.id,
      'ornickNumber': incident.ornickNumber,
      'createdDate': incident.createdDate.toIso8601String(),
      'incidentDate': incident.incidentDate.toIso8601String(),
      'locality': incident.locality,
      'incidentLocation': incident.incidentLocation,
      'latitude': incident.latitude,
      'longitude': incident.longitude,
      'incidentType': incident.incidentType,
      'incidentCause': incident.incidentCause,
      'roadCondition': incident.roadCondition,
      'weatherCondition': incident.weatherCondition,
      'incidentDescription': incident.incidentDescription,
      'officerName': incident.officerName,
      'officerMilitaryNumber': incident.officerMilitaryNumber,
      'officerUnit': incident.officerUnit,
      'officerSignature': incident.officerSignature,
      'officerSignatureDate': incident.officerSignatureDate?.toIso8601String(),
      'supervisorName': incident.supervisorName,
      'supervisorNotes': incident.supervisorNotes,
      'supervisorSignature': incident.supervisorSignature,
      'supervisorApprovalDate': incident.supervisorApprovalDate?.toIso8601String(),
      'investigatorName': incident.investigatorName,
      'investigationSummary': incident.investigationSummary,
      'responsibility': incident.responsibility,
      'investigatorSignature': incident.investigatorSignature,
      'investigationClosureDate': incident.investigationClosureDate?.toIso8601String(),
      'attachmentPaths': incident.attachmentPaths.join(','),
      'status': incident.status.toString(),
      'state': incident.state,
    };
  }
}
