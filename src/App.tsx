import { useEffect, useState, useCallback } from 'react';
import { Shield, Download } from 'lucide-react';
import { detectDRMSupport } from './utils/drmDetector';
import { getSystemInfo } from './utils/systemInfo';
import { DRMCard } from './components/DRMCard';
import { SystemInfoCard } from './components/SystemInfoCard';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { DRMSystemInfo, SystemInfo } from './types/drm';

function App() {
  const [drmSystems, setDrmSystems] = useState<DRMSystemInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: '', browser: '', version: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDRM() {
      try {
        setError(null);
        const results = await detectDRMSupport();
        setDrmSystems(results);
        setSystemInfo(getSystemInfo());
      } catch (err) {
        console.error('Error detecting DRM support:', err);
        setError('Failed to detect DRM capabilities. Please ensure your browser supports the Encrypted Media Extensions (EME) API.');
      } finally {
        setLoading(false);
      }
    }

    checkDRM();
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      systemInfo,
      drmSystems,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drm-capabilities-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [systemInfo, drmSystems]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors font-sans">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">DRMSense</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4 text-lg">
            Check your browser's Digital Rights Management (DRM) capabilities, including support for
            Widevine, PlayReady, FairPlay, and supported video resolutions.
          </p>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900"
            aria-label="Export DRM capabilities as JSON"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12" role="status" aria-label="Loading DRM capabilities">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Detecting DRM capabilities...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6" role="alert">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Error Detecting DRM</h3>
                <p className="text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors dark:bg-red-500 dark:hover:bg-red-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <SystemInfoCard info={systemInfo} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drmSystems.map((system) => (
                <DRMCard key={system.name} system={system} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Note: This tool uses the Encrypted Media Extensions (EME) API to detect DRM support.</p>
          <p>Results may vary depending on your browser and system configuration.</p>
        </div>
      </div>
    </div>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
