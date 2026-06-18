import React, { useState } from 'react';
import { Athlete, Performance, AttendanceRecord, SportsScienceAnalysis } from '../types';
import { ASA_STANDARDS } from '../sportsScienceUtils';
import {
  User, Calendar, Shield, Award, Clipboard, ChevronRight, Activity, Clock,
  Bot, AlertCircle, Plus, Trash2, Check, TrendingDown, TrendingUp, AlertTriangle
} from 'lucide-react';

interface Props {
  athlete: Athlete;
  performances: Performance[];
  attendance: AttendanceRecord[];
  analysis: SportsScienceAnalysis | null;
  onAddPerformance: (data: { eventName: string; performanceDisplay: string; competitionName: string; location: string; date: string; windReading?: string }) => void;
  onAddAttendance: (data: { date: string; status: 'Present' | 'Absent' | 'Excused' | 'Injured'; sessionType: string; notes?: string }) => void;
  onTriggerAnalysis: () => void;
  onDeletePerformance: (id: string) => void;
  isAnalyzing: boolean;
}

export const AthleteDetails: React.FC<Props> = ({
  athlete,
  performances,
  attendance,
  analysis,
  onAddPerformance,
  onAddAttendance,
  onTriggerAnalysis,
  onDeletePerformance,
  isAnalyzing
}) => {
  const [activeTab, setActiveTab] = useState<'performances' | 'attendance' | 'sports_science'>('performances');

  // Performance Form State
  const [eventName, setEventName] = useState(athlete.primaryEvent);
  const [perfDisplay, setPerfDisplay] = useState('');
  const [competition, setCompetition] = useState('');
  const [location, setLocation] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [wind, setWind] = useState('');
  const [showAddPerf, setShowAddPerf] = useState(false);

  // Attendance Form State
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<'Present' | 'Absent' | 'Excused' | 'Injured'>('Present');
  const [attSessionType, setAttSessionType] = useState('Speed Endurance');
  const [attNotes, setAttNotes] = useState('');
  const [showAddAttendance, setShowAddAttendance] = useState(false);

  // Parse ASA Standard for this athlete
  const standard = ASA_STANDARDS.find(
    s => s.eventName.toLowerCase() === athlete.primaryEvent.toLowerCase() && s.gender === athlete.gender
  );

  const handlePerfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfDisplay) return;
    onAddPerformance({
      eventName,
      performanceDisplay: perfDisplay,
      competitionName: competition,
      location,
      date: dateStr,
      windReading: wind || undefined
    });
    setPerfDisplay('');
    setCompetition('');
    setLocation('');
    setShowAddPerf(false);
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAttendance({
      date: attDate,
      status: attStatus,
      sessionType: attSessionType,
      notes: attNotes
    });
    setAttNotes('');
    setShowAddAttendance(false);
  };

  // Convert birthdate to age
  const age = athlete.dateOfBirth
    ? new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear()
    : 'N/A';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Profile Banner */}
      <div className="bg-slate-930 text-white px-5 py-4 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-display text-lg font-bold shadow-md shadow-emerald-500/10">
              {athlete.name[0]}
            </div>
            <div>
              <h1 className="font-display font-medium text-slate-100 tracking-tight text-lg">{athlete.name}</h1>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {athlete.gender} (Age {age})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {athlete.province}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-semibold">{athlete.club}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end justify-center text-xs">
            <span className="text-slate-400">Coach Office</span>
            <span className="text-slate-200 mt-0.5 font-bold">{athlete.coach}</span>
            <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 px-1.5 py-0.5 rounded-full mt-1.5 font-mono">
              Primary Event: {athlete.primaryEvent}
            </span>
          </div>
        </div>
      </div>

      {/* Ratios Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-white">
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium">Attendance Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold ${athlete.attendanceRate >= 90 ? 'text-emerald-600' : athlete.attendanceRate >= 80 ? 'text-amber-500' : 'text-rose-500'}`}>
                {athlete.attendanceRate}%
              </span>
              <span className="text-[10px] text-slate-400">consistency</span>
            </div>
          </div>
          <Activity className="w-8 h-8 text-slate-300" />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium">ASA National Standard</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-700">
                {standard ? standard.standardDisplay : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-400">qualification limit</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-slate-300" />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-slate-500 font-medium">Best Logged Performance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-700">
                {performances.length > 0 ? performances.reduce((best, p) => {
                  const standardVal = standard ? standard.standardValue : 0;
                  const isField = standard ? standard.unit === 'm' : false;
                  if (best.id === '') return p;
                  if (isField) {
                    return p.performanceValue > best.performanceValue ? p : best;
                  } else {
                    return p.performanceValue < best.performanceValue ? p : best;
                  }
                }, { id: '', performanceValue: isField => isField ? -9999 : 9999, performanceDisplay: 'None' } as any).performanceDisplay : 'None'}
              </span>
              <span className="text-[10px] text-slate-400">personal registry</span>
            </div>
          </div>
          <Clock className="w-8 h-8 text-slate-300" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100/60 px-4 pt-3 border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('performances')}
          className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all duration-150 ${
            activeTab === 'performances'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Race/Metric Performances ({performances.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all duration-150 ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Attendance Log ({attendance.length})
        </button>
        <button
          onClick={() => setActiveTab('sports_science')}
          className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-all duration-150 flex items-center gap-1 ${
            activeTab === 'sports_science'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-500" />
          Sports Science Analytics
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {activeTab === 'performances' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-slate-700 text-sm">Race Timing & Distance Metric Logs</h3>
              <button
                onClick={() => setShowAddPerf(!showAddPerf)}
                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50 text-[11px] px-2.5 py-1.5 font-bold rounded-lg transition"
              >
                {showAddPerf ? 'Cancel' : 'Log Performance Result'}
              </button>
            </div>

            {/* Performance Form */}
            {showAddPerf && (
              <form onSubmit={handlePerfSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Competition Metric</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Event Name</label>
                    <select
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    >
                      {ASA_STANDARDS.filter(s => s.gender === athlete.gender).map(s => (
                        <option key={s.eventName} value={s.eventName}>{s.eventName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">
                      Performance (e.g. 10.21s or 8.24m)
                    </label>
                    <input
                      type="text"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white"
                      placeholder={standard?.unit === 'm' ? 'e.g. 8.12m' : 'e.g. 10.23s or 1:47.50'}
                      value={perfDisplay}
                      onChange={(e) => setPerfDisplay(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Competition Title</label>
                    <input
                      type="text"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      placeholder="e.g. AGN Club League"
                      value={competition}
                      onChange={(e) => setCompetition(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Wind Speed (m/s)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      placeholder="e.g. 1.2"
                      value={wind}
                      onChange={(e) => setWind(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Location</label>
                    <input
                      type="text"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      placeholder="e.g. Pilditch Stadium, Pretoria"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Date</label>
                    <input
                      type="date"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded transition">
                    Commit to SQLite3
                  </button>
                </div>
              </form>
            )}

            {/* Performance List */}
            {performances.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No performances logged for this athlete yet. Use the log helper above.
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* SVG Visual Progress Delta Chart */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quantitative Gap Delta over Timeline</div>
                  <div className="h-28 flex items-end justify-between border-b border-l border-slate-300 pb-1.5 pl-2 select-none relative">
                    {/* National Standard threshold line */}
                    <div className="absolute left-0 right-0 border-t border-dashed border-red-500 opacity-60 top-1/2 z-0" title="ASA Qualification Threshold">
                      <span className="absolute -top-3.5 right-2 text-[8px] font-bold text-red-500 bg-white/95 px-1 border border-red-150 rounded">ASA Target</span>
                    </div>

                    {/* Timeline Data points mapped visually */}
                    {performances.map((p, pIdx) => {
                      const deltaVal = p.deltaToStandard;
                      const standardUnit = standard ? standard.unit : 's';
                      
                      // Calculate safe percentage offsets for height display
                      let heightPct = 50; // midpoint
                      if (standardUnit === 's') {
                        // For track, faster (negative delta) is taller columns
                        heightPct = 50 - (deltaVal * 12);
                      } else {
                        // For field, larger jump (positive delta) is taller columns
                        heightPct = 50 + (deltaVal * 15);
                      }
                      
                      heightPct = Math.max(10, Math.min(95, heightPct));

                      return (
                        <div key={p.id} className="flex-1 flex flex-col items-center group relative z-10">
                          <div className={`w-3 h-3 rounded-full shadow border-2 ${p.isNationalStandardMet ? 'bg-emerald-500 border-white' : 'bg-rose-500 border-white'}`} style={{ marginBottom: `${heightPct}px` }} />
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{new Date(p.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                          
                          {/* Rich hover tooltip */}
                          <div className="absolute bottom-16 bg-slate-900 text-slate-100 text-[10px] p-2 rounded shadow-2xl invisible group-hover:visible w-36 text-center border border-slate-800 z-50">
                            <p className="font-bold">{p.performanceDisplay}</p>
                            <p className="text-slate-400 text-[9px] mt-0.5">{p.competitionName}</p>
                            <p className={`font-mono text-[9px] font-semibold mt-1 ${p.isNationalStandardMet ? 'text-emerald-400' : 'text-rose-400'}`}>
                              Delta: {p.deltaToStandard > 0 ? '+' : ''}{p.deltaToStandard.toFixed(2)}{standardUnit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 font-mono">
                    <span>* timeline logs sorted oldest to newest</span>
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Met</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Unmet</span>
                    </span>
                  </div>
                </div>

                {/* List Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 font-bold">Event Class</th>
                        <th className="p-2.5 font-bold">Value</th>
                        <th className="p-2.5 font-bold">Mathematical Delta</th>
                        <th className="p-2.5 font-bold">Competition & Base</th>
                        <th className="p-2.5 font-bold text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {performances.slice().reverse().map((p) => {
                        const standardUnit = standard ? standard.unit : 's';
                        const mathDeltaStr = p.deltaToStandard <= 0 ? `${p.deltaToStandard.toFixed(2)}${standardUnit}` : `+${p.deltaToStandard.toFixed(2)}${standardUnit}`;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-2.5 font-semibold text-slate-800">{p.eventName}</td>
                            <td className="p-2.5">
                              <span className="font-mono font-bold text-slate-700">{p.performanceDisplay}</span>
                              {p.windReading !== undefined && p.windReading !== 0 && (
                                <span className="text-[10px] text-slate-400 ml-1.5 bg-slate-100 px-1.5 py-0.5 rounded-full font-sans">
                                  w: {p.windReading > 0 ? '+' : ''}{p.windReading}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                p.isNationalStandardMet
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {p.isNationalStandardMet ? (
                                  <>
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    {mathDeltaStr} (Met Standards)
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    {mathDeltaStr} (Delta Gap)
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <div className="font-medium text-slate-700">{p.competitionName}</div>
                              <div className="text-[10px] text-slate-400">{p.location} • {new Date(p.date).toLocaleDateString()}</div>
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={() => onDeletePerformance(p.id)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition hover:bg-slate-100"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'attendance' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-slate-700 text-sm">Attendance Consistency Logger</h3>
              <button
                onClick={() => setShowAddAttendance(!showAddAttendance)}
                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50 text-[11px] px-2.5 py-1.5 font-bold rounded-lg transition"
              >
                {showAddAttendance ? 'Cancel' : 'Log Daily Track Attendance'}
              </button>
            </div>

            {/* Attendance Form */}
            {showAddAttendance && (
              <form onSubmit={handleAttendanceSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Physical Attendance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Date</label>
                    <input
                      type="date"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block font-semibold">Status Role</label>
                    <select
                      className="w-full text-xs p-1.5 border border-slate-200 rounded text-slate-700"
                      value={attStatus}
                      onChange={(e) => setAttStatus(e.target.value as any)}
                    >
                      <option value="Present">Present (Fully Engaged)</option>
                      <option value="Absent">Absent</option>
                      <option value="Excused">Excused (Taper/Study Leave)</option>
                      <option value="Injured">Injured / Rehab</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-semibold">Training Session Type / Module</label>
                  <input
                    type="text"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded"
                    placeholder="e.g. Speed Endurance (6x150m) or Plyometrics drill"
                    value={attSessionType}
                    onChange={(e) => setAttSessionType(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 block font-semibold">Sports Science Coach Notes (Adaptations)</label>
                  <input
                    type="text"
                    className="w-full text-xs p-1.5 border border-slate-200 rounded"
                    placeholder="e.g. Fluid hurdles block transitions, excellent hamstring load profile"
                    value={attNotes}
                    onChange={(e) => setAttNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded transition">
                    Submit Log to SQLite3
                  </button>
                </div>
              </form>
            )}

            {/* Attendance List */}
            {attendance.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs text-semibold">
                No attendance sheets logged yet. Log the today track attendance.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
                    <div className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Present</div>
                    <div className="text-lg font-bold text-emerald-800 mt-0.5">{attendance.filter(a => a.status === 'Present').length}</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 text-center">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Excused</div>
                    <div className="text-lg font-bold text-slate-700 mt-0.5">{attendance.filter(a => a.status === 'Excused').length}</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-center">
                    <div className="text-[9px] text-amber-700 font-bold uppercase tracking-wider">Injured</div>
                    <div className="text-lg font-bold text-amber-800 mt-0.5">{attendance.filter(a => a.status === 'Injured').length}</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-center">
                    <div className="text-[9px] text-rose-700 font-bold uppercase tracking-wider">Absent</div>
                    <div className="text-lg font-bold text-rose-800 mt-0.5">{attendance.filter(a => a.status === 'Absent').length}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {attendance.slice().reverse().map((record) => (
                    <div key={record.id} className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                            record.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            record.status === 'Absent' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            record.status === 'Injured' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-850 border border-slate-200'
                          }`}>
                            {record.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{record.sessionType}</span>
                        </div>
                        {record.notes && <p className="text-xs text-slate-500 font-sans italic">{record.notes}</p>}
                      </div>
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        {new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-display font-medium text-slate-200 text-sm">Quantitative Sports Science Engine</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">AI-powered diagnostic and prescription vs. National Standards</p>
                  </div>
                </div>
                <button
                  onClick={onTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-emerald-600/10 transition duration-200 disabled:opacity-40"
                >
                  {isAnalyzing ? 'Running Calculations...' : 'Generate AI Diagnosis'}
                </button>
              </div>

              {analysis ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      THE DIAGNOSTIC
                    </div>
                    <blockquote className="bg-slate-950/60 font-sans text-[12px] leading-relaxed p-4 border-l-4 border-emerald-500 rounded-r-lg text-slate-250 select-text">
                      {analysis.diagnostic}
                    </blockquote>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                      THE PRESCRIPTION
                    </div>
                    <blockquote className="bg-slate-950/60 font-sans text-[12px] leading-relaxed p-4 border-l-4 border-teal-400 rounded-r-lg text-slate-250 select-text">
                      {analysis.prescription}
                    </blockquote>
                  </div>

                  <div className="text-[9px] text-slate-500 text-right mt-2 font-mono">
                    Analysis compiled on: {new Date(analysis.analyzedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400">No active diagnostic recorded for {athlete.name}.</p>
                    <p className="text-[10px] text-slate-500">Tap "Generate AI Diagnosis" to analyze their qualifying times and load consistency.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
