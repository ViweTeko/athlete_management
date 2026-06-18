import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface Props {
  onImportCSV: (csvText: string) => Promise<{ success: boolean; message: string }>;
  onExportCSV: () => void;
}

export const SpreadsheetImportExport: React.FC<Props> = ({ onImportCSV, onExportCSV }) => {
  const [csvInput, setCsvInput] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Elite SA Athlethes sample spreadsheets mapping
  const sampleCSV = `Name,Gender,Category,Event,Dob,Province,Club,Coach
Shaun Maswanganyi,Male,Track,100m,2001-02-01,AGN,Varsity College AC,Carl Lewis
Prudence Sekgodiso,Female,Track,800m,2002-01-05,AGN,Tuks Athletics Club,Samuel Sepeng
Caster Semenya,Female,Track,800m,1991-01-07,LIMA,Boxer AC,Jean Verster
Jovan van Vuuren,Male,Field,Long Jump,1996-05-13,AGN,Tuks Athletics,Jenny Kingwill
Elroy Gelant,Male,Road Running,10km Road,1986-08-25,WPA,Boxer AC,Jean Verster`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) {
      setStatus({ type: 'error', message: 'Spreadsheet values are empty.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const result = await onImportCSV(csvInput);
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setCsvInput('');
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to parser bulk upload.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSample = () => {
    setCsvInput(sampleCSV);
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-display font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            Centralized Spreadsheet Data Importer & Exporter
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk migrate offline spreadsheet logs into SQLite3 relational database
          </p>
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition duration-200"
          title="Download entire athletes registry as a CSV file"
        >
          <Download className="w-3.5 h-3.5" />
          Export Spreadsheet (.csv)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              Spreadsheet Template Guidance
            </div>
            <p>
              Your spreadsheet columns must align with the parameters:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li><strong>Name</strong> (Full athlete name)</li>
              <li><strong>Gender</strong> (Male or Female)</li>
              <li><strong>Category</strong> (Track, Field, Road Running, Cross Country)</li>
              <li><strong>Event</strong> (Primary event, e.g., 100m, 800m, Long Jump, etc.)</li>
              <li><strong>Other columns</strong> (Optional: DOB, Province, Club, Coach)</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={loadSample}
            className="w-full text-center py-2 px-3 border border-dashed border-slate-350 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 font-semibold text-xs rounded-lg transition duration-200"
          >
            Load Sample Athletics Spreadsheet
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative">
            <textarea
              className="w-full h-44 font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
              placeholder="Paste raw comma-separated spreadsheet data here (CSV). For example:&#10;Name,Gender,Category,Event,Dob,Province,Club,Coach&#10;Akani Simbine,Male,Track,100m,1993-09-21,AGN,Tuks AC,Werner Prinsloo"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />
            <span className="absolute bottom-2.5 right-2.5 font-sans font-medium text-[10px] text-slate-400 bg-white/95 px-1.5 py-0.5 rounded border border-slate-100">
              CSV Format
            </span>
          </div>

          {status.type === 'success' && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>{status.message}</div>
            </div>
          )}

          {status.type === 'error' && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div>{status.message}</div>
            </div>
          )}

          <div className="flex justify-end mt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition hover:shadow duration-200 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isSubmitting ? 'Importing...' : 'Upload & Sync Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
