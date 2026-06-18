import React, { useState, useEffect } from 'react';
import { DRFLog } from '../types';
import { Terminal, Database, Code, RefreshCw, Layers } from 'lucide-react';

interface Props {
  logs: DRFLog[];
  onRefresh: () => void;
}

export const DjangoSQLiteConsole: React.FC<Props> = ({ logs, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'request_logs' | 'sqlite_schema' | 'django_serializers'>('request_logs');
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<'athletes' | 'performances' | 'attendance'>('athletes');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[480px] flex flex-col font-mono text-xs text-slate-300">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-display font-bold text-slate-100 tracking-wide text-sm">
            Django REST Framework + SQLite3 SQL Monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition duration-200"
            title="Refresh database logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <span className="bg-emerald-950/50 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-tight">
            SQLite3: Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-950/60 px-2 pt-2 border-b border-slate-800 flex gap-1">
        <button
          onClick={() => setActiveTab('request_logs')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 ${
            activeTab === 'request_logs'
              ? 'bg-slate-900 text-slate-100 border-t border-x border-slate-800 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3 h-3 text-cyan-400" />
          DRF Request / SQL Log ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('sqlite_schema')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 ${
            activeTab === 'sqlite_schema'
              ? 'bg-slate-900 text-slate-100 border-t border-x border-slate-800 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3 h-3 text-orange-400" />
          SQLite3 Schema Tables
        </button>
        <button
          onClick={() => setActiveTab('django_serializers')}
          className={`px-3 py-1.5 rounded-t-lg transition-all duration-200 flex items-center gap-1.5 ${
            activeTab === 'django_serializers'
              ? 'bg-slate-900 text-slate-100 border-t border-x border-slate-800 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3 h-3 text-purple-400" />
          Django REST Serializers
        </button>
      </div>

      {/* Body Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40">
        {activeTab === 'request_logs' ? (
          logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500">
              No HTTP API requests processed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/60 shadow-md">
                  {/* Log Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-3 py-2 border-b border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                        log.method === 'DELETE' ? 'bg-rose-950 text-rose-400 border border-rose-900' :
                        log.method === 'PUT' || log.method === 'PATCH' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                        'bg-blue-950 text-blue-400 border border-blue-900'
                      }`}>
                        {log.method}
                      </span>
                      <span className="text-slate-400 font-semibold text-[11px] select-all">{log.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Status: <strong className={log.statusCode < 300 ? 'text-emerald-400' : 'text-rose-400'}>{log.statusCode}</strong></span>
                      <span>•</span>
                      <span>{log.payloadSize}</span>
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-850">
                    {/* Django DRF Equivalent Panel */}
                    <div className="p-3">
                      <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1.5 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" />
                        Django REST Framework Handler
                      </div>
                      <pre className="text-slate-400 overflow-x-auto p-2 bg-slate-900/60 border border-slate-850 rounded leading-relaxed whitespace-pre-wrap max-h-36">
                        <code>{log.djangoCode}</code>
                      </pre>
                    </div>

                    {/* SQLite3 Translated SQL Panel */}
                    <div className="p-3">
                      <div className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mb-1.5 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        SQLite3 Internal SQL Translation
                      </div>
                      <pre className="text-slate-200 overflow-x-auto p-2 bg-slate-900/60 border border-slate-850 rounded leading-relaxed whitespace-pre-wrap max-h-36 font-semibold">
                        <code className="text-amber-300">{log.sqlQuery}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'sqlite_schema' ? (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              {(['athletes', 'performances', 'attendance'] as const).map((table) => (
                <button
                  key={table}
                  onClick={() => setSelectedSchemaTable(table)}
                  className={`px-3 py-1 rounded transition text-xs font-semibold ${
                    selectedSchemaTable === table
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {table === 'athletes' ? 'athletes_athlete' : table === 'performances' ? 'performances_performance' : 'attendance_attendance'}
                </button>
              ))}
            </div>

            <div className="border border-slate-800 rounded bg-slate-900/50 p-3 overflow-x-auto">
              {(() => {
                if (selectedSchemaTable === 'athletes') {
                  return (
                    <div>
                      <div className="text-amber-400 font-semibold mb-2">CREATE TABLE "athletes_athlete" (</div>
                      <div className="pl-4 space-y-1 text-slate-400">
                        <div>"id" varchar(64) PRIMARY KEY,</div>
                        <div>"name" varchar(255) NOT NULL,</div>
                        <div>"gender" varchar(10) NOT NULL CHECK(gender IN ('Male', 'Female')),</div>
                        <div>"dob" date,</div>
                        <div>"province" varchar(10) DEFAULT 'AGN',</div>
                        <div>"club" varchar(255),</div>
                        <div>"category" varchar(50) NOT NULL,</div>
                        <div>"primary_event" varchar(255) NOT NULL,</div>
                        <div>"coach" varchar(255),</div>
                        <div>"attendance_rate" real DEFAULT 100.0,</div>
                        <div>"notes" text,</div>
                        <div>"created_at" datetime NOT NULL</div>
                      </div>
                      <div className="text-amber-400 font-semibold mt-2">);</div>
                    </div>
                  );
                } else if (selectedSchemaTable === 'performances') {
                  return (
                    <div>
                      <div className="text-amber-400 font-semibold mb-2">CREATE TABLE "performances_performance" (</div>
                      <div className="pl-4 space-y-1 text-slate-400">
                        <div>"id" varchar(64) PRIMARY KEY,</div>
                        <div>"athlete_id" varchar(64) REFERENCES "athletes_athlete"("id") ON DELETE CASCADE,</div>
                        <div>"event_name" varchar(255) NOT NULL,</div>
                        <div>"value" real NOT NULL, /* float quantitative represent s or m */</div>
                        <div>"display" varchar(50) NOT NULL,</div>
                        <div>"competition" varchar(255),</div>
                        <div>"location" varchar(255),</div>
                        <div>"date" date NOT NULL,</div>
                        <div>"wind" real,</div>
                        <div>"is_standard_met" boolean NOT NULL DEFAULT 0,</div>
                        <div>"delta_to_standard" real NOT NULL,</div>
                        <div>"created_at" datetime NOT NULL</div>
                      </div>
                      <div className="text-amber-400 font-semibold mt-2">);</div>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <div className="text-amber-400 font-semibold mb-2">CREATE TABLE "attendance_attendance" (</div>
                      <div className="pl-4 space-y-1 text-slate-400">
                        <div>"id" varchar(64) PRIMARY KEY,</div>
                        <div>"athlete_id" varchar(64) REFERENCES "athletes_athlete"("id") ON DELETE CASCADE,</div>
                        <div>"date" date NOT NULL,</div>
                        <div>"status" varchar(20) CHECK(status IN ('Present', 'Absent', 'Excused', 'Injured')),</div>
                        <div>"session_type" varchar(255),</div>
                        <div>"notes" text</div>
                      </div>
                      <div className="text-amber-400 font-semibold mt-2">);</div>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="text-[10px] text-slate-500 font-sans italic flex items-center gap-1">
              <span>* sqlite3 is mounted directly under `/sqlite3_db.json` and supports full relational cascades on Athlete updates</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-slate-400 mb-2 leading-relaxed font-sans">
              Django Rest Framework utilizes automatic serializers parsing. Heres a breakdown of the Active Athlete ModelSerializer:
            </div>
            <div className="border border-slate-800 rounded bg-slate-900/50 p-3 overflow-x-auto font-mono text-purple-300">
              <span className="text-slate-400"># sports_academy/athletes/serializers.py</span><br />
              <span className="text-purple-400">from</span> rest_framework <span className="text-purple-400">import</span> serializers<br />
              <span className="text-purple-400">from</span> .models <span className="text-purple-400">import</span> Athlete, Performance, Attendance<br /><br />
              <span className="text-blue-400">class</span> <span className="text-emerald-400">AthleteSerializer</span>(serializers.ModelSerializer):<br />
              <span className="pl-4">attendance_rate = serializers.FloatField(read_only=True)</span><br />
              <span className="pl-4 font-semibold text-cyan-400">class</span> <span className="text-emerald-400">Meta</span>:<br />
              <span className="pl-8">model = Athlete</span><br />
              <span className="pl-8">fields = '__all__'</span><br /><br />
              <span className="text-blue-400">class</span> <span className="text-emerald-400">PerformanceSerializer</span>(serializers.ModelSerializer):<br />
              <span className="pl-4 font-semibold text-cyan-400">class</span> <span className="text-emerald-400">Meta</span>:<br />
              <span className="pl-8">model = Performance</span><br />
              <span className="pl-8">fields = ['id', 'athlete', 'event_name', 'value', 'display', 'is_standard_met', 'delta_to_standard', 'date', 'wind']</span><br /><br />
              <span className="text-blue-400">class</span> <span className="text-emerald-400">AttendanceSerializer</span>(serializers.ModelSerializer):<br />
              <span className="pl-4 font-semibold text-cyan-400">class</span> <span className="text-emerald-400">Meta</span>:<br />
              <span className="pl-8">model = Attendance</span><br />
              <span className="pl-8">fields = '__all__'</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
