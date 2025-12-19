
export enum UserRole {
  ADMIN = 'مدير النظام',
  OFFICER = 'شرطي مرور',
  SUPERVISOR = 'مشرف مرور',
  INVESTIGATOR = 'محقق حوادث'
}

export enum IncidentStatus {
  DRAFT = 'مسودة',
  SIGNED = 'موقع ميدانياً',
  PENDING_APPROVAL = 'قيد الاعتماد',
  APPROVED = 'معتمد من المشرف',
  UNDER_INVESTIGATION = 'قيد التحقيق',
  INVESTIGATED = 'مكتمل التحقيق',
  CLOSED = 'مغلق نهائياً'
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  color: string;
  licenseAuthority: string;
  damages: string;
}

export interface Victim {
  id: string;
  name: string;
  age: string;
  injuryType: string;
  transportDestination: string;
}

export interface Ornik8Data {
  id: string;
  ornikNumber: string;
  date: string;
  time: string;
  state: string;
  localArea: string;
  location: string;
  gps: {
    lat: number;
    lng: number;
  };
  incidentType: string;
  incidentCause: string;
  roadCondition: string;
  weatherCondition: string;
  incidentDescription: string;
  vehicles: Vehicle[];
  driver: {
    name: string;
    licenseNumber: string;
    licenseType: string;
    issueAuthority: string;
    condition: string;
  };
  victims: Victim[];
  officer: {
    name: string;
    militaryId: string;
    unit: string;
    signature?: string;
    date: string;
  };
  supervisor: {
    name: string;
    notes: string;
    signature?: string;
    approvalDate: string;
  };
  investigation: {
    investigatorName: string;
    summary: string;
    responsibility: string;
    signature?: string;
    closingDate: string;
  };
  attachments: string[];
  status: IncidentStatus;
  createdAt: string;
  updatedAt?: string;
  isSynced?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  tableName: string;
  recordId: string;
  timestamp: string;
}
