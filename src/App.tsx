import React, { useState, useEffect } from 'react';
import { Athlete, Performance, AttendanceRecord, SportsScienceAnalysis, DRFLog } from './types';
import { DjangoSQLiteConsole } from './components/DjangoSQLiteConsole';
import { SpreadsheetImportExport } from './components/SpreadsheetImportExport';
import { AthleteDetails } from './components/AthleteDetails';
import {
  Users, Plus, Award, TrendingUp, Search, Layers, RefreshCw,
  FileSpreadsheet, Trash2, ChevronRight, Check, Activity, Shield, LogOut, Info, AlertCircle
} from 'lucide-react';

export default function App() {
  // Database States
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [logs, setLogs] = useState<DRFLog[]>([]);
  
  // Selection & UI controls
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeAnalysis, setActiveAnalysis] = useState<SportsScienceAnalysis | null>(null);

  // Loading indicator states
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingAthlete, setIsAddingAthlete] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // New Athlete form state
  const [newAthName, setNewAthName] = useState('');
  const [newAthGender, setNewAthGender] = useState<'Male' | 'Female'>('Male');
  const [newAthDOB, setNewAthDOB] = useState('1998-01-01');
  const [newAthProvince, setNewAthProvince] = useState('AGN');
  const [newAthClub, setNewAthClub] = useState('Tuks Athletics Club');
  const [newAthCategory, setNewAthCategory] = useState<'Track' | 'Field' | 'Cross Country' | 'Road Running'>('Track');
  const [newAthPrimaryEvent, setNewAthPrimaryEvent] = useState('100m');
  const [newAthCoach, setNewAthCoach] = useState('Werner Prinsloo');
  const [newAthNotes, setNewAthNotes] = useState('');

  // Fetch full data from Express REST Django Rest Emulator APIs
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const athRes = await fetch('/api/v1/athletes');
      const athData = await athRes.json();
      setAthletes(athData);

      const perfRes = await fetch('/api/v1/performances');
      const perfData = await perfRes.json();
      setPerformances(perfData);

      const attRes = await fetch('/api/v1/attendance');
      const attData = await attRes.json();
      setAttendance(attData);

      const logsRes = await fetch('/api/v1/logs');
      const logsData = await logsRes.json();
      setLogs(logsData);

      // Auto select the first athlete if none selected or if previous selection disappeared
      if (athData.length > 0) {
        if (!selectedAthleteId || !athData.some((a: Athlete) => a.id === selectedAthleteId)) {
          setSelectedAthleteId(athData[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch API payloads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger loading analysis when athlete selection changes
  const fetchSelectedAthleteAnalysis = async (athleteId: string) => {
    if (!athleteId) return;
    try {
      const res = await fetch(`/api/v1/analyze/${athleteId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveAnalysis(data);
      } else {
        setActiveAnalysis(null);
      }
    } catch (error) {
      setActiveAnalysis(null);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedAthleteId) {
      fetchSelectedAthleteAnalysis(selectedAthleteId);
    } else {
      setActiveAnalysis(null);
    }
  }, [selectedAthleteId]);

  // Create Athlete REST API invocation
  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthName) return;

    try {
      const res = await fetch('/api/v1/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAthName,
          gender: newAthGender,
          dateOfBirth: newAthDOB,
          province: newAthProvince,
          club: newAthClub,
          category: newAthCategory,
          primaryEvent: newAthPrimaryEvent,
          coach: newAthCoach,
          notes: newAthNotes
        })
      });

      if (res.ok) {
        const created = await res.json();
        setAthletes(prev => [...prev, created]);
        setSelectedAthleteId(created.id);
        setIsAddingAthlete(false);
        // Clear inputs
        setNewAthName('');
        setNewAthNotes('');
        // Refresh logs
        const logsRes = await fetch('/api/v1/logs');
        setLogs(await logsRes.json());
      }
    } catch (err) {
      console.error('Error creating athlete:', err);
    }
  };

  // Delete Athlete
  const handleDeleteAthlete = async (id: string) => {
    if (!confirm('Are you sure you want to completely remove this athlete from SQLite3 database? All performances and attendance records will be deleted.')) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/athletes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAthletes(prev => prev.filter(a => a.id !== id));
        if (selectedAthleteId === id) {
          setSelectedAthleteId('');
        }
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting athlete:', err);
    }
  };

  // Add Performance Result
  const handleAddPerformance = async (perfData: {
    eventName: string;
    performanceDisplay: string;
    competitionName: string;
    location: string;
    date: string;
    windReading?: string;
  }) => {
    if (!selectedAthleteId) return;
    try {
      const res = await fetch('/api/v1/performances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId: selectedAthleteId,
          ...perfData,
          windReading: perfData.windReading ? parseFloat(perfData.windReading) : undefined
        })
      });

      if (res.ok) {
        const created = await res.json();
        setPerformances(prev => [...prev, created]);
        // Refresh logs and athlete attributes (best performance standard calculations)
        fetchAllData();
      }
    } catch (err) {
      console.error('Error adding performance logs:', err);
    }
  };

  // Delete Performance Result
  const handleDeletePerformance = async (perfId: string) => {
    try {
      const res = await fetch(`/api/v1/performances/${perfId}`, { method: 'DELETE' });
      if (res.ok) {
        setPerformances(prev => prev.filter(p => p.id !== perfId));
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting performance:', err);
    }
  };

  // Add Attendance Sheet Log
  const handleAddAttendance = async (attData: {
    date: string;
    status: 'Present' | 'Absent' | 'Excused' | 'Injured';
    sessionType: string;
    notes?: string;
  }) => {
    if (!selectedAthleteId) return;
    try {
      const res = await fetch('/api/v1/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId: selectedAthleteId,
          ...attData
        })
      });

      if (res.ok) {
        const payload = await res.json();
        setAttendance(prev => [...prev, payload.attendance]);
        
        // update singular athlete attributes instantly in list
        setAthletes(prev => prev.map(a => a.id === selectedAthleteId ? payload.athlete : a));
        fetchAllData();
      }
    } catch (err) {
      console.error('Error logging attendance:', err);
    }
  };

  // Trigger Sports Science AI Analysis
  const handleTriggerAnalysis = async () => {
    if (!selectedAthleteId) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/v1/analyze/${selectedAthleteId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveAnalysis(data);
        
        // refresh transaction log
        const logsRes = await fetch('/api/v1/logs');
        setLogs(await logsRes.json());
      }
    } catch (error) {
      console.error('AI analytical computation triggered failure:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Spreadsheet CSV import handler
  const handleImportCSV = async (csvText: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/v1/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvText })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchAllData();
        return { success: true, message: data.message };
      } else {
        const errData = await res.json();
        return { success: false, message: errData.error || 'Failed to parse CSV spreadsheet data.' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Network error importing spreadsheet.' };
    }
  };

  // Spreadsheet export handler
  const handleExportCSV = () => {
    window.open('/api/v1/export', '_blank');
  };

  // Filter athletes matching filters and search input
  const filteredAthletes = athletes.filter(athlete => {
    const matchesFilter = categoryFilter === 'All' || athlete.category === categoryFilter;
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          athlete.primaryEvent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          athlete.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          athlete.province.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);
  const selectedAthletePerformances = performances.filter(p => p.athleteId === selectedAthleteId);
  const selectedAthleteAttendance = attendance.filter(a => a.athleteId === selectedAthleteId);

  return (
    <div className="bg-slate-50 min-h-screen font-sans flex flex-col text-slate-800">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold font-display shadow-md shadow-emerald-600/10">
            ASA
          </div>
          <div>
            <h1 className="font-display font-black text-slate-900 tracking-tight text-base uppercase">South African Athletics</h1>
            <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase font-mono mt-0.5">Elite Sports Science & Performance Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            title="Reload SQLite3 data from Server"
            className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload DB
          </button>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">Dr. Viwe Teko, PhD</div>
            <div className="text-[10px] text-slate-400 font-medium">Head Performance Analyst • AGN</div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Top Info Banner */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6 justify-between select-none">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-display font-medium text-slate-100 tracking-tight text-base sm:text-lg">
              Athletics South Africa (ASA) National Standards Analyzer
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Identify physical readiness and tactical preparation metrics. Compare live track segments and jumping leaps in real-time against actual Olympic/National selection levels, with automated quantitative sports medicine training scripts.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-400 tracking-tight">{athletes.length}</div>
              <div className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">Athletes In SQLite</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-emerald-400 tracking-tight">{performances.length}</div>
              <div className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">Metrics Tracked</div>
            </div>
          </div>
        </div>

        {/* Grid Panel Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Athletes List & Controls / Custom Add (5 columns) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-slate-600" />
                  <h2 className="font-display font-bold text-slate-800 text-sm">Athletes Database Registry</h2>
                </div>
                <button
                  onClick={() => setIsAddingAthlete(!isAddingAthlete)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-md shadow-emerald-500/10 font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingAthlete ? 'Cancel Setup' : 'New Profile'}
                </button>
              </div>

              {/* Add Athlete Foldout Form */}
              {isAddingAthlete && (
                <form onSubmit={handleCreateAthlete} className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Setup New Athlete Record</h3>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold block">Full Name</label>
                    <input
                      type="text"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white shadow-inner"
                      placeholder="e.g. Shaun Maswanganyi"
                      value={newAthName}
                      onChange={(e) => setNewAthName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Gender</label>
                      <select
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        value={newAthGender}
                        onChange={(e) => setNewAthGender(e.target.value as any)}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        value={newAthDOB}
                        onChange={(e) => setNewAthDOB(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Province Association</label>
                      <select
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        value={newAthProvince}
                        onChange={(e) => setNewAthProvince(e.target.value)}
                      >
                        <option value="AGN">AGN (Athletics Gauteng North)</option>
                        <option value="WPA">WPA (Western Province Athletics)</option>
                        <option value="EPA">EPA (Eastern Province Athletics)</option>
                        <option value="KZN">KZN (KwaZulu-Natal Athletics)</option>
                        <option value="CATA">CATA (Central Gauteng Athletics)</option>
                        <option value="LIMA">LIMA (Limpopo Athletics)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Athletic Club</label>
                      <input
                        type="text"
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        placeholder="e.g. Tuks AC"
                        value={newAthClub}
                        onChange={(e) => setNewAthClub(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Discipline Class</label>
                      <select
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        value={newAthCategory}
                        onChange={(e) => setNewAthCategory(e.target.value as any)}
                      >
                        <option value="Track">Track Sprints/Runs</option>
                        <option value="Field">Field Jumps/Throws</option>
                        <option value="Road Running">Road Running</option>
                        <option value="Cross Country">Cross Country</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block">Primary Event Area</label>
                      <select
                        className="w-full text-xs p-1.5 border border-slate-200 rounded"
                        value={newAthPrimaryEvent}
                        onChange={(e) => setNewAthPrimaryEvent(e.target.value)}
                      >
                        <option value="100m">100m</option>
                        <option value="200m">200m</option>
                        <option value="400m">400m</option>
                        <option value="800m">800m</option>
                        <option value="1500m">1500m</option>
                        <option value="5000m">5000m</option>
                        <option value="10000m">10000m</option>
                        <option value="110m Hurdles">110m Hurdles (M)</option>
                        <option value="100m Hurdles">100m Hurdles (F)</option>
                        <option value="400m Hurdles">400m Hurdles</option>
                        <option value="Long Jump">Long Jump</option>
                        <option value="High Jump">High Jump</option>
                        <option value="Shot Put">Shot Put</option>
                        <option value="10km Road">10km Road</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold block">Assign Coach</label>
                    <input
                      type="text"
                      className="w-full text-xs p-1.5 border border-slate-200 rounded"
                      value={newAthCoach}
                      onChange={(e) => setNewAthCoach(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold block">Initial Physical Profile Notes</label>
                    <textarea
                      className="w-full text-xs p-1.5 border border-slate-200 rounded h-14"
                      placeholder="Hamstring stiffness recovery cycle..."
                      value={newAthNotes}
                      onChange={(e) => setNewAthNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow transition"
                  >
                    Insert Relational Athlete Profile
                  </button>
                </form>
              )}

              {/* Filters and Search Search Input */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    placeholder="Search athletes by name, club, primary event..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Categories filtering bar */}
                <div className="flex flex-wrap gap-1 border-t pt-2.5">
                  {['All', 'Track', 'Field', 'Road Running', 'Cross Country'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold transition ${
                        categoryFilter === cat
                          ? 'bg-slate-800 text-slate-100 border border-slate-800'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-150'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Athletes Cards listing */}
              {loading ? (
                <div className="text-center py-10 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  Loading SQLite3 relation databases...
                </div>
              ) : filteredAthletes.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-450 italic border border-dashed rounded-lg">
                  No matches found in database.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredAthletes.map((athlete) => {
                    const isSelected = athlete.id === selectedAthleteId;
                    return (
                      <div
                        key={athlete.id}
                        onClick={() => setSelectedAthleteId(athlete.id)}
                        className={`group p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all duration-155 ${
                          isSelected
                            ? 'bg-emerald-55/70 border-emerald-400/80 shadow-sm'
                            : 'bg-slate-50/40 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-display text-slate-900 text-xs font-bold leading-none ${isSelected ? 'text-emerald-950 font-extrabold' : ''}`}>
                              {athlete.name}
                            </h3>
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-mono uppercase font-bold select-none">
                              {athlete.province}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>{athlete.primaryEvent}</span>
                            <span>•</span>
                            <span>{athlete.club}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Attendance</div>
                            <div className={`text-xs font-bold font-mono ${athlete.attendanceRate >= 90 ? 'text-emerald-600' : 'text-slate-700'}`}>
                              {athlete.attendanceRate}%
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAthlete(athlete.id);
                            }}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete Athlete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sprites Quick Tips */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-600">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 select-none">
                <span className="font-semibold text-slate-800 font-display">ASA Performance Guidelines for Selection</span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Track events measure dynamic speed decline (under 100m/200m). Selection algorithms assess both strict qualifying markers and training consistency as physiological adaptation parameters.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Athlete Details & Diagnostics / prescription logs (7 columns) */}
          <div className="lg:col-span-7 h-full">
            {selectedAthlete ? (
              <AthleteDetails
                athlete={selectedAthlete}
                performances={selectedAthletePerformances}
                attendance={selectedAthleteAttendance}
                analysis={activeAnalysis}
                onAddPerformance={handleAddPerformance}
                onAddAttendance={handleAddAttendance}
                onTriggerAnalysis={handleTriggerAnalysis}
                onDeletePerformance={handleDeletePerformance}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-xl p-16 text-center shadow-sm select-none flex flex-col justify-center items-center h-[520px] space-y-3">
                <Activity className="w-12 h-12 text-slate-300 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-slate-800 text-base">Select Athlete for Performance Profile</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Review specific speed-endurance statistics, compute exact metric deltas vs. selection criteria, and execute training routines.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spreadsheet Sync Segment */}
        <SpreadsheetImportExport
          onImportCSV={handleImportCSV}
          onExportCSV={handleExportCSV}
        />

        {/* DRF SQLite relational logs */}
        <DjangoSQLiteConsole
          logs={logs}
          onRefresh={fetchAllData}
        />

      </main>

      {/* Footer Block */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-mono">SQLite3 DB ENGINE V2.4 • DJANGO MODELSERIALIZERS ROUTING</p>
          <p className="font-sans">© {new Date().getFullYear()} Sports Sciences Department, South African Athletics (ASA)</p>
          <div className="text-[10px] text-slate-650 italic">
            * Standardized to international WA criteria and Pretoria Regional hypoxic adjustment values
          </div>
        </div>
      </footer>
    </div>
  );
}
