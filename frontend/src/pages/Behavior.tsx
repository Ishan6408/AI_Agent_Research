import { useRef, useState } from 'react';
import BehaviourAnalysis from '../components/analytics/BehaviourAnalysis';
import type { BehaviourAnalysisRef } from '../components/analytics/BehaviourAnalysis';
import { Download, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Behavior() {
  const analysisRef = useRef<BehaviourAnalysisRef>(null);

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  const handleSync = async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    try {
      if (analysisRef.current) {
        await analysisRef.current.fetchData();
      }
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleExport = async () => {
    if (exportStatus === 'exporting') return;
    if (analysisRef.current && !analysisRef.current.hasData) {
      return; // gracefully handle empty
    }

    setExportStatus('exporting');
    try {
      const blob = await api.downloadCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'behavioral_logs.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (err: any) {
      console.error(err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-full text-text-main gap-6 max-w-6xl mx-auto w-full pb-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Behavioral Logs</h1>
          <p className="text-text-muted max-w-2xl text-sm leading-relaxed">
            Evaluation of synthetic agent deception and honesty preservation across the dataset.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button 
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface-alt hover:bg-secondary text-brand-primary px-4 py-2 rounded-md text-sm font-medium transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncStatus === 'syncing' ? <Loader2 size={16} className="animate-spin" /> : 
             syncStatus === 'success' ? <Check size={16} className="text-green-500" /> :
             syncStatus === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
             <RefreshCw size={16} />}
            {syncStatus === 'syncing' ? 'Syncing...' : 
             syncStatus === 'success' ? 'Synced' :
             syncStatus === 'error' ? 'Failed' :
             'Sync Data'}
          </button>
          <button 
            onClick={handleExport}
            disabled={exportStatus === 'exporting'}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportStatus === 'exporting' ? <Loader2 size={16} className="animate-spin" /> : 
             exportStatus === 'success' ? <Check size={16} /> :
             exportStatus === 'error' ? <AlertCircle size={16} /> :
             <Download size={16} />}
            {exportStatus === 'exporting' ? 'Exporting...' : 
             exportStatus === 'success' ? 'Exported' :
             exportStatus === 'error' ? 'Failed' :
             'Export Data'}
          </button>
        </div>
      </header>
      
      <div className="w-full">
        <BehaviourAnalysis ref={analysisRef} />
      </div>
    </div>
  );
}
