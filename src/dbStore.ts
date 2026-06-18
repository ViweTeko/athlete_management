import fs from 'fs';
import path from 'path';
import { Athlete, Performance, AttendanceRecord, NationalStandard, DRFLog, SportsScienceAnalysis } from './types';
import {
  ASA_STANDARDS,
  formatValueToDisplay,
  parseDisplayToValue,
  calculateDelta
} from './sportsScienceUtils';

export {
  ASA_STANDARDS,
  formatValueToDisplay,
  parseDisplayToValue,
  calculateDelta
};

const DB_FILE_PATH = path.join(process.cwd(), 'sqlite3_db.json');


interface DatabaseStructure {
  athletes: Athlete[];
  performances: Performance[];
  attendance: AttendanceRecord[];
  analyses: SportsScienceAnalysis[];
  drfLogs: DRFLog[];
}

const initialAthletes: Athlete[] = [
  {
    id: 'ath_1',
    name: 'Akani Simbine',
    gender: 'Male',
    dateOfBirth: '1993-09-21',
    province: 'AGN',
    club: 'Tuks Athletics Club',
    category: 'Track',
    primaryEvent: '100m',
    coach: 'Werner Prinsloo',
    attendanceRate: 94.5,
    trainingSessionsAttended: 52,
    trainingSessionsTotal: 55,
    notes: 'South African legendary sprinters team leader. Focusing on speed endurance and block starts.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ath_2',
    name: 'Prudence Sekgodiso',
    gender: 'Female',
    dateOfBirth: '2002-01-05',
    province: 'AGN',
    club: 'Tuks Athletics Club',
    category: 'Track',
    primaryEvent: '800m',
    coach: 'Samuel Sepeng',
    attendanceRate: 88.0,
    trainingSessionsAttended: 44,
    trainingSessionsTotal: 50,
    notes: 'Incredible speed curve. Fine-tuning tactical positioning in multi-heat events.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ath_3',
    name: 'Rushwal Samaai',
    gender: 'Male',
    dateOfBirth: '1991-09-25',
    province: 'WPA',
    club: 'Nedbank RC Western Cape',
    category: 'Field',
    primaryEvent: 'Long Jump',
    coach: 'Jenny Kingwill',
    attendanceRate: 82.0,
    trainingSessionsAttended: 41,
    trainingSessionsTotal: 50,
    notes: 'Managing a minor patella tendon issue. Highly explosive load mechanics.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ath_4',
    name: 'Stephen Mokoka',
    gender: 'Male',
    dateOfBirth: '1985-01-31',
    province: 'AGN',
    club: 'Boxer Athletic Club',
    category: 'Road Running',
    primaryEvent: '10km Road',
    coach: 'Michael Seme',
    attendanceRate: 98.2,
    trainingSessionsAttended: 54,
    trainingSessionsTotal: 55,
    notes: 'Master of volume. Excellent mental toughness and altitude threshold pacing.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ath_5',
    name: 'Zenéy van der Walt',
    gender: 'Female',
    dateOfBirth: '2000-05-22',
    province: 'AGN',
    club: 'Tuks Athletics Club',
    category: 'Track',
    primaryEvent: '400m Hurdles',
    coach: 'Maritza Coetzee',
    attendanceRate: 90.9,
    trainingSessionsAttended: 50,
    trainingSessionsTotal: 55,
    notes: 'Exceptional hurdle clearance technique on strides 13 to 15.',
    createdAt: new Date().toISOString(),
  }
];

const initialPerformances: Performance[] = [
  {
    id: 'perf_1',
    athleteId: 'ath_1',
    eventName: '100m',
    performanceValue: 9.92,
    performanceDisplay: '9.92s',
    competitionName: 'ASA National Championships',
    location: 'Green Point Stadium, Cape Town',
    date: '2026-04-18',
    windReading: 1.2,
    isNationalStandardMet: true,
    deltaToStandard: -0.23, // 9.92 - 10.15 = -0.23 (faster is negative delta)
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perf_2',
    athleteId: 'ath_1',
    eventName: '100m',
    performanceValue: 10.19,
    performanceDisplay: '10.19s',
    competitionName: 'Athletics Gauteng North Leagues',
    location: 'Pilditch Stadium, Pretoria',
    date: '2026-03-07',
    windReading: -0.5,
    isNationalStandardMet: false,
    deltaToStandard: 0.04, // 10.19 - 10.15 = 0.04 (slower)
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perf_3',
    athleteId: 'ath_2',
    eventName: '800m',
    performanceValue: 118.25, // 1:58.25
    performanceDisplay: '1:58.25',
    competitionName: 'Diamond League - Doha',
    location: 'Doha, Qatar',
    date: '2026-05-10',
    isNationalStandardMet: true,
    deltaToStandard: -2.25, // 118.25 - 120.5 = -2.25s
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perf_4',
    athleteId: 'ath_3',
    eventName: 'Long Jump',
    performanceValue: 8.15,
    performanceDisplay: '8.15m',
    competitionName: 'MTN Varsity Athletics meeting',
    location: 'UJ Stadium, Johannesburg',
    date: '2026-05-02',
    windReading: 0.8,
    isNationalStandardMet: false,
    deltaToStandard: -0.07, // Jump standard is 8.22. Gap is Athlete - Standard = 8.15 - 8.22 = -0.07m (0.07m short of standard)
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perf_5',
    athleteId: 'ath_4',
    eventName: '10km Road',
    performanceValue: 1675.00, // 27:55
    performanceDisplay: '27:55',
    competitionName: 'Absa RUN YOUR CITY Durban 10K',
    location: 'Durban, KZN',
    date: '2026-06-12',
    isNationalStandardMet: true,
    deltaToStandard: -15.00, // 1675 - 1690 = -15s
    createdAt: new Date().toISOString(),
  }
];

const initialAttendance: AttendanceRecord[] = [
  { id: 'att_1', athleteId: 'ath_1', date: '2026-06-15', status: 'Present', sessionType: 'Block Starts', notes: 'Explosive and standard exit mechanics' },
  { id: 'att_2', athleteId: 'ath_1', date: '2026-06-16', status: 'Present', sessionType: 'Acceleration work', notes: '40m bullet drills' },
  { id: 'att_3', athleteId: 'ath_1', date: '2026-06-17', status: 'Present', sessionType: 'Resistance towing', notes: 'Good force output' },
  { id: 'att_4', athleteId: 'ath_2', date: '2026-06-15', status: 'Present', sessionType: 'Aerobic base', notes: '12km steady road run' },
  { id: 'att_5', athleteId: 'ath_2', date: '2026-06-16', status: 'Absent', sessionType: 'Speed endurance', notes: 'Slight fatigue precaution' },
  { id: 'att_6', athleteId: 'ath_3', date: '2026-06-15', status: 'Injured', sessionType: 'Jump approach', notes: 'Underwent physiotherapy session' },
  { id: 'att_7', athleteId: 'ath_4', date: '2026-06-15', status: 'Present', sessionType: 'Tempo runs', notes: 'Smooth 3:10/km pacing on track' },
  { id: 'att_8', athleteId: 'ath_4', date: '2026-06-16', status: 'Present', sessionType: 'Active recovery', notes: 'Gym session and stretching' }
];

export function getDatabase(): DatabaseStructure {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading SQLite3 JSON DB, fallback to initial state:', error);
  }

  // Create & save initial state
  const state: DatabaseStructure = {
    athletes: initialAthletes,
    performances: initialPerformances,
    attendance: initialAttendance,
    analyses: [],
    drfLogs: [
      {
        id: 'log_0',
        method: 'POST',
        endpoint: '/api/v1/migration/',
        djangoCode: '# django migrations\npython manage.py migrate\n# sqlite schema successfully instated',
        sqlQuery: 'CREATE TABLE IF NOT EXISTS athletes (id TEXT PRIMARY KEY, name TEXT, gender TEXT, ...);\nCREATE TABLE IF NOT EXISTS performances (id TEXT PRIMARY KEY, athleteId TEXT, ...);',
        timestamp: new Date().toISOString(),
        statusCode: 200,
        payloadSize: '2.1 KB'
      }
    ]
  };
  saveDatabase(state);
  return state;
}

export function saveDatabase(data: DatabaseStructure) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving SQLite3 database:', error);
  }
}

// DRF logs logging helper
export function logDRF(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  djangoCode: string,
  sqlQuery: string,
  statusCode: number,
  payloadSize: string
) {
  const db = getDatabase();
  const newLog: DRFLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    method,
    endpoint,
    djangoCode,
    sqlQuery,
    timestamp: new Date().toISOString(),
    statusCode,
    payloadSize
  };

  db.drfLogs.unshift(newLog);
  // Cap logs at 30
  if (db.drfLogs.length > 30) {
    db.drfLogs.pop();
  }
  saveDatabase(db);
}

