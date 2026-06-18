import { NationalStandard } from './types';

export const ASA_STANDARDS: NationalStandard[] = [
  { eventName: '100m', gender: 'Male', standardValue: 10.15, standardDisplay: '10.15s', unit: 's' },
  { eventName: '100m', gender: 'Female', standardValue: 11.20, standardDisplay: '11.20s', unit: 's' },
  { eventName: '200m', gender: 'Male', standardValue: 20.40, standardDisplay: '20.40s', unit: 's' },
  { eventName: '200m', gender: 'Female', standardValue: 22.90, standardDisplay: '22.90s', unit: 's' },
  { eventName: '400m', gender: 'Male', standardValue: 45.30, standardDisplay: '45.30s', unit: 's' },
  { eventName: '400m', gender: 'Female', standardValue: 51.50, standardDisplay: '51.50s', unit: 's' },
  { eventName: '800m', gender: 'Male', standardValue: 105.20, standardDisplay: '1:45.20', unit: 's' },
  { eventName: '800m', gender: 'Female', standardValue: 120.50, standardDisplay: '2:00.50', unit: 's' },
  { eventName: '1500m', gender: 'Male', standardValue: 216.00, standardDisplay: '3:36.00', unit: 's' },
  { eventName: '1500m', gender: 'Female', standardValue: 247.00, standardDisplay: '4:07.00', unit: 's' },
  { eventName: '5000m', gender: 'Male', standardValue: 795.00, standardDisplay: '13:15.00', unit: 's' },
  { eventName: '5000m', gender: 'Female', standardValue: 910.00, standardDisplay: '15:10.00', unit: 's' },
  { eventName: '10000m', gender: 'Male', standardValue: 1665.00, standardDisplay: '27:45.00', unit: 's' },
  { eventName: '10000m', gender: 'Female', standardValue: 1920.00, standardDisplay: '32:00.00', unit: 's' },
  { eventName: '110m Hurdles', gender: 'Male', standardValue: 13.50, standardDisplay: '13.50s', unit: 's' },
  { eventName: '100m Hurdles', gender: 'Female', standardValue: 13.10, standardDisplay: '13.10s', unit: 's' },
  { eventName: '400m Hurdles', gender: 'Male', standardValue: 49.30, standardDisplay: '49.30s', unit: 's' },
  { eventName: '400m Hurdles', gender: 'Female', standardValue: 55.40, standardDisplay: '55.40s', unit: 's' },
  { eventName: 'Long Jump', gender: 'Male', standardValue: 8.22, standardDisplay: '8.22m', unit: 'm' },
  { eventName: 'Long Jump', gender: 'Female', standardValue: 6.75, standardDisplay: '6.75m', unit: 'm' },
  { eventName: 'High Jump', gender: 'Male', standardValue: 2.28, standardDisplay: '2.28m', unit: 'm' },
  { eventName: 'High Jump', gender: 'Female', standardValue: 1.93, standardDisplay: '1.93m', unit: 'm' },
  { eventName: 'Shot Put', gender: 'Male', standardValue: 20.85, standardDisplay: '20.85m', unit: 'm' },
  { eventName: 'Shot Put', gender: 'Female', standardValue: 18.00, standardDisplay: '18.00m', unit: 'm' },
  { eventName: '10km Road', gender: 'Male', standardValue: 1690.00, standardDisplay: '28:10', unit: 's' },
  { eventName: '10km Road', gender: 'Female', standardValue: 1950.00, standardDisplay: '32:30', unit: 's' },
];

// Convert numbers of seconds back to visual strings e.g. 118.25 -> "1:58.25"
export function formatValueToDisplay(val: number, eventName: string): string {
  const std = ASA_STANDARDS.find(s => s.eventName.toLowerCase() === eventName.toLowerCase());
  const isField = std ? std.unit === 'm' : false;

  if (isField) {
    return `${val.toFixed(2)}m`;
  }

  // Check if it's longer than a minute e.g. 800m, 1500m, 5000m, 10000m, 10km
  if (val >= 60) {
    const minutes = Math.floor(val / 60);
    const seconds = val % 60;
    const padSecs = seconds < 10 ? '0' + seconds.toFixed(2) : seconds.toFixed(2);
    // Check if it's longer than an hour
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      const padMins = remainingMins < 10 ? '0' + remainingMins : remainingMins;
      return `${hours}:${padMins}:${padSecs}`;
    }
    return `${minutes}:${padSecs}`;
  }

  return `${val.toFixed(2)}s`;
}

// Convert display performance e.g. "1:48.30" or "8.25m" or raw "10.2" to parsed value in seconds/meters
export function parseDisplayToValue(display: string): number {
  const sanitized = display.replace(/[sm]/gi, '').trim();
  if (sanitized.includes(':')) {
    const parts = sanitized.split(':');
    let total = 0;
    if (parts.length === 3) {
      // hh:mm:ss
      total += parseFloat(parts[0]) * 3600;
      total += parseFloat(parts[1]) * 60;
      total += parseFloat(parts[2]);
    } else if (parts.length === 2) {
      // mm:ss
      total += parseFloat(parts[0]) * 60;
      total += parseFloat(parts[1]);
    }
    return total;
  }
  return parseFloat(sanitized);
}

// Math calculation for standard deltas: Delta = Athlete Time/Distance - National Standard
export function calculateDelta(eventName: string, gender: 'Male' | 'Female', athleteValue: number): { delta: number, isMet: boolean } {
  const std = ASA_STANDARDS.find(
    s => s.eventName.toLowerCase() === eventName.toLowerCase() && s.gender === gender
  );

  if (!std) {
    return { delta: 0, isMet: false };
  }

  const isField = std.unit === 'm';
  const delta = athleteValue - std.standardValue;

  // Track: lower time is better (so negative delta is speed/duration saved and standard met!)
  // Field: higher distance is better (so positive delta means standard met!)
  let isMet = false;
  if (isField) {
    isMet = delta >= 0;
  } else {
    isMet = delta <= 0;
  }

  return { delta, isMet };
}
