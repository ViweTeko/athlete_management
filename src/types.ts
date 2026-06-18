export interface Athlete {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  province: string; // e.g., AGN, WPA, EPA, KZN, CATA
  club: string;
  category: 'Track' | 'Field' | 'Cross Country' | 'Road Running';
  primaryEvent: string;
  coach: string;
  attendanceRate: number; // 0 - 100 %
  trainingSessionsAttended: number;
  trainingSessionsTotal: number;
  notes?: string;
  createdAt: string;
}

export interface Performance {
  id: string;
  athleteId: string;
  eventName: string;
  performanceValue: number; // seconds for track/road, meters for field
  performanceDisplay: string; // e.g., "10.23s", "2:04.12", "8.12m"
  competitionName: string;
  location: string;
  date: string;
  windReading?: number; // wind support in m/s for short sprints/jumps
  isNationalStandardMet: boolean;
  deltaToStandard: number; // positive or negative athlete_val - std_val
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  athleteId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Excused' | 'Injured';
  sessionType: string;
  notes?: string;
}

export interface NationalStandard {
  eventName: string;
  gender: 'Male' | 'Female';
  standardValue: number; // seconds or meters
  standardDisplay: string;
  unit: 's' | 'm';
}

export interface SportsScienceAnalysis {
  athleteId: string;
  diagnostic: string;
  prescription: string;
  analyzedAt: string;
}

export interface DRFLog {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  djangoCode: string;
  sqlQuery: string;
  timestamp: string;
  statusCode: number;
  payloadSize: string;
}
