import 'package:uuid/uuid.dart';

class Incident {
  final String id;
  final String ornickNumber;
  final DateTime createdDate;
  final DateTime incidentDate;
  final String locality;
  final String incidentLocation;
  final double? latitude;
  final double? longitude;
  final String incidentType;
  final String incidentCause;
  final String roadCondition;
  final String weatherCondition;
  final String incidentDescription;
  final List<Vehicle> vehicles;
  final List<Driver> drivers;
  final List<Injury> injuries;
  final String? officerName;
  final String? officerMilitaryNumber;
  final String? officerUnit;
  final String? officerSignature;
  final DateTime? officerSignatureDate;
  final String? supervisorName;
  final String? supervisorNotes;
  final String? supervisorSignature;
  final DateTime? supervisorApprovalDate;
  final String? investigatorName;
  final String? investigationSummary;
  final String? responsibility;
  final String? investigatorSignature;
  final DateTime? investigationClosureDate;
  final List<String> attachmentPaths;
  final IncidentStatus status;
  final String? state;

  Incident({
    String? id,
    String? ornickNumber,
    DateTime? createdDate,
    required this.incidentDate,
    required this.locality,
    required this.incidentLocation,
    this.latitude,
    this.longitude,
    required this.incidentType,
    required this.incidentCause,
    required this.roadCondition,
    required this.weatherCondition,
    required this.incidentDescription,
    this.vehicles = const [],
    this.drivers = const [],
    this.injuries = const [],
    this.officerName,
    this.officerMilitaryNumber,
    this.officerUnit,
    this.officerSignature,
    this.officerSignatureDate,
    this.supervisorName,
    this.supervisorNotes,
    this.supervisorSignature,
    this.supervisorApprovalDate,
    this.investigatorName,
    this.investigationSummary,
    this.responsibility,
    this.investigatorSignature,
    this.investigationClosureDate,
    this.attachmentPaths = const [],
    this.status = IncidentStatus.draft,
    this.state,
  })  : id = id ?? const Uuid().v4(),
        ornickNumber = ornickNumber ?? _generateOrnickNumber(),
        createdDate = createdDate ?? DateTime.now();

  static String _generateOrnickNumber() {
    final now = DateTime.now();
    return 'ORN-${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}-${DateTime.now().millisecondsSinceEpoch % 10000}';
  }

  Incident copyWith({
    String? id,
    String? ornickNumber,
    DateTime? createdDate,
    DateTime? incidentDate,
    String? locality,
    String? incidentLocation,
    double? latitude,
    double? longitude,
    String? incidentType,
    String? incidentCause,
    String? roadCondition,
    String? weatherCondition,
    String? incidentDescription,
    List<Vehicle>? vehicles,
    List<Driver>? drivers,
    List<Injury>? injuries,
    String? officerName,
    String? officerMilitaryNumber,
    String? officerUnit,
    String? officerSignature,
    DateTime? officerSignatureDate,
    String? supervisorName,
    String? supervisorNotes,
    String? supervisorSignature,
    DateTime? supervisorApprovalDate,
    String? investigatorName,
    String? investigationSummary,
    String? responsibility,
    String? investigatorSignature,
    DateTime? investigationClosureDate,
    List<String>? attachmentPaths,
    IncidentStatus? status,
    String? state,
  }) {
    return Incident(
      id: id ?? this.id,
      ornickNumber: ornickNumber ?? this.ornickNumber,
      createdDate: createdDate ?? this.createdDate,
      incidentDate: incidentDate ?? this.incidentDate,
      locality: locality ?? this.locality,
      incidentLocation: incidentLocation ?? this.incidentLocation,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      incidentType: incidentType ?? this.incidentType,
      incidentCause: incidentCause ?? this.incidentCause,
      roadCondition: roadCondition ?? this.roadCondition,
      weatherCondition: weatherCondition ?? this.weatherCondition,
      incidentDescription: incidentDescription ?? this.incidentDescription,
      vehicles: vehicles ?? this.vehicles,
      drivers: drivers ?? this.drivers,
      injuries: injuries ?? this.injuries,
      officerName: officerName ?? this.officerName,
      officerMilitaryNumber: officerMilitaryNumber ?? this.officerMilitaryNumber,
      officerUnit: officerUnit ?? this.officerUnit,
      officerSignature: officerSignature ?? this.officerSignature,
      officerSignatureDate: officerSignatureDate ?? this.officerSignatureDate,
      supervisorName: supervisorName ?? this.supervisorName,
      supervisorNotes: supervisorNotes ?? this.supervisorNotes,
      supervisorSignature: supervisorSignature ?? this.supervisorSignature,
      supervisorApprovalDate: supervisorApprovalDate ?? this.supervisorApprovalDate,
      investigatorName: investigatorName ?? this.investigatorName,
      investigationSummary: investigationSummary ?? this.investigationSummary,
      responsibility: responsibility ?? this.responsibility,
      investigatorSignature: investigatorSignature ?? this.investigatorSignature,
      investigationClosureDate: investigationClosureDate ?? this.investigationClosureDate,
      attachmentPaths: attachmentPaths ?? this.attachmentPaths,
      status: status ?? this.status,
      state: state ?? this.state,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'ornickNumber': ornickNumber,
      'createdDate': createdDate.toIso8601String(),
      'incidentDate': incidentDate.toIso8601String(),
      'locality': locality,
      'incidentLocation': incidentLocation,
      'latitude': latitude,
      'longitude': longitude,
      'incidentType': incidentType,
      'incidentCause': incidentCause,
      'roadCondition': roadCondition,
      'weatherCondition': weatherCondition,
      'incidentDescription': incidentDescription,
      'vehicles': vehicles.map((v) => v.toMap()).toList(),
      'drivers': drivers.map((d) => d.toMap()).toList(),
      'injuries': injuries.map((i) => i.toMap()).toList(),
      'officerName': officerName,
      'officerMilitaryNumber': officerMilitaryNumber,
      'officerUnit': officerUnit,
      'officerSignature': officerSignature,
      'officerSignatureDate': officerSignatureDate?.toIso8601String(),
      'supervisorName': supervisorName,
      'supervisorNotes': supervisorNotes,
      'supervisorSignature': supervisorSignature,
      'supervisorApprovalDate': supervisorApprovalDate?.toIso8601String(),
      'investigatorName': investigatorName,
      'investigationSummary': investigationSummary,
      'responsibility': responsibility,
      'investigatorSignature': investigatorSignature,
      'investigationClosureDate': investigationClosureDate?.toIso8601String(),
      'attachmentPaths': attachmentPaths,
      'status': status.toString(),
      'state': state,
    };
  }

  factory Incident.fromMap(Map<String, dynamic> map) {
    return Incident(
      id: map['id'],
      ornickNumber: map['ornickNumber'],
      createdDate: DateTime.parse(map['createdDate']),
      incidentDate: DateTime.parse(map['incidentDate']),
      locality: map['locality'],
      incidentLocation: map['incidentLocation'],
      latitude: map['latitude'],
      longitude: map['longitude'],
      incidentType: map['incidentType'],
      incidentCause: map['incidentCause'],
      roadCondition: map['roadCondition'],
      weatherCondition: map['weatherCondition'],
      incidentDescription: map['incidentDescription'],
      vehicles: (map['vehicles'] as List?)?.map((v) => Vehicle.fromMap(v)).toList() ?? [],
      drivers: (map['drivers'] as List?)?.map((d) => Driver.fromMap(d)).toList() ?? [],
      injuries: (map['injuries'] as List?)?.map((i) => Injury.fromMap(i)).toList() ?? [],
      officerName: map['officerName'],
      officerMilitaryNumber: map['officerMilitaryNumber'],
      officerUnit: map['officerUnit'],
      officerSignature: map['officerSignature'],
      officerSignatureDate: map['officerSignatureDate'] != null ? DateTime.parse(map['officerSignatureDate']) : null,
      supervisorName: map['supervisorName'],
      supervisorNotes: map['supervisorNotes'],
      supervisorSignature: map['supervisorSignature'],
      supervisorApprovalDate: map['supervisorApprovalDate'] != null ? DateTime.parse(map['supervisorApprovalDate']) : null,
      investigatorName: map['investigatorName'],
      investigationSummary: map['investigationSummary'],
      responsibility: map['responsibility'],
      investigatorSignature: map['investigatorSignature'],
      investigationClosureDate: map['investigationClosureDate'] != null ? DateTime.parse(map['investigationClosureDate']) : null,
      attachmentPaths: List<String>.from(map['attachmentPaths'] ?? []),
      status: IncidentStatus.values.firstWhere(
        (e) => e.toString() == map['status'],
        orElse: () => IncidentStatus.draft,
      ),
      state: map['state'],
    );
  }
}

class Vehicle {
  final String id;
  final String plateNumber;
  final String vehicleType;
  final String color;
  final String licensingAuthority;
  final String damages;
  final String? driverName;

  Vehicle({
    String? id,
    required this.plateNumber,
    required this.vehicleType,
    required this.color,
    required this.licensingAuthority,
    required this.damages,
    this.driverName,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'plateNumber': plateNumber,
      'vehicleType': vehicleType,
      'color': color,
      'licensingAuthority': licensingAuthority,
      'damages': damages,
      'driverName': driverName,
    };
  }

  factory Vehicle.fromMap(Map<String, dynamic> map) {
    return Vehicle(
      id: map['id'],
      plateNumber: map['plateNumber'],
      vehicleType: map['vehicleType'],
      color: map['color'],
      licensingAuthority: map['licensingAuthority'],
      damages: map['damages'],
      driverName: map['driverName'],
    );
  }

  Vehicle copyWith({
    String? id,
    String? plateNumber,
    String? vehicleType,
    String? color,
    String? licensingAuthority,
    String? damages,
    String? driverName,
  }) {
    return Vehicle(
      id: id ?? this.id,
      plateNumber: plateNumber ?? this.plateNumber,
      vehicleType: vehicleType ?? this.vehicleType,
      color: color ?? this.color,
      licensingAuthority: licensingAuthority ?? this.licensingAuthority,
      damages: damages ?? this.damages,
      driverName: driverName ?? this.driverName,
    );
  }
}

class Driver {
  final String id;
  final String name;
  final String licenseNumber;
  final String licenseType;
  final String issuingAuthority;
  final String driverCondition;

  Driver({
    String? id,
    required this.name,
    required this.licenseNumber,
    required this.licenseType,
    required this.issuingAuthority,
    required this.driverCondition,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'licenseNumber': licenseNumber,
      'licenseType': licenseType,
      'issuingAuthority': issuingAuthority,
      'driverCondition': driverCondition,
    };
  }

  factory Driver.fromMap(Map<String, dynamic> map) {
    return Driver(
      id: map['id'],
      name: map['name'],
      licenseNumber: map['licenseNumber'],
      licenseType: map['licenseType'],
      issuingAuthority: map['issuingAuthority'],
      driverCondition: map['driverCondition'],
    );
  }

  Driver copyWith({
    String? id,
    String? name,
    String? licenseNumber,
    String? licenseType,
    String? issuingAuthority,
    String? driverCondition,
  }) {
    return Driver(
      id: id ?? this.id,
      name: name ?? this.name,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      licenseType: licenseType ?? this.licenseType,
      issuingAuthority: issuingAuthority ?? this.issuingAuthority,
      driverCondition: driverCondition ?? this.driverCondition,
    );
  }
}

class Injury {
  final String id;
  final String name;
  final int age;
  final String injuryType;
  final String transportMethod;

  Injury({
    String? id,
    required this.name,
    required this.age,
    required this.injuryType,
    required this.transportMethod,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'age': age,
      'injuryType': injuryType,
      'transportMethod': transportMethod,
    };
  }

  factory Injury.fromMap(Map<String, dynamic> map) {
    return Injury(
      id: map['id'],
      name: map['name'],
      age: map['age'],
      injuryType: map['injuryType'],
      transportMethod: map['transportMethod'],
    );
  }

  Injury copyWith({
    String? id,
    String? name,
    int? age,
    String? injuryType,
    String? transportMethod,
  }) {
    return Injury(
      id: id ?? this.id,
      name: name ?? this.name,
      age: age ?? this.age,
      injuryType: injuryType ?? this.injuryType,
      transportMethod: transportMethod ?? this.transportMethod,
    );
  }
}

enum IncidentStatus {
  draft,
  submitted,
  approved,
  underInvestigation,
  closed,
}

enum UserRole {
  trafficOfficer,
  supervisor,
  investigator,
  admin,
}

class User {
  final String id;
  final String name;
  final String militaryNumber;
  final UserRole role;
  final String unit;

  User({
    String? id,
    required this.name,
    required this.militaryNumber,
    required this.role,
    required this.unit,
  }) : id = id ?? const Uuid().v4();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'militaryNumber': militaryNumber,
      'role': role.toString(),
      'unit': unit,
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'],
      name: map['name'],
      militaryNumber: map['militaryNumber'],
      role: UserRole.values.firstWhere(
        (e) => e.toString() == map['role'],
        orElse: () => UserRole.trafficOfficer,
      ),
      unit: map['unit'],
    );
  }
}
