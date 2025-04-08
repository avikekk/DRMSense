import React, { useEffect, useState } from 'react';
import { Shield, Download } from 'lucide-react';
import { detectDRMSupport } from './utils/drmDetector';
import { getSystemInfo } from './utils/systemInfo';
import { DRMCard } from './components/DRMCard';
import { SystemInfoCard } from './components/SystemInfoCard';
import { ThemeToggle } from './components/ThemeToggle';
import type { DRMSystemInfo, SystemInfo } from './types/drm';

function App() {
  const [drmSystems, setDrmSystems] = useState<DRMSystemInfo[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: '', browser: '', version: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkDRM() {
      try {
        const results = await detectDRMSupport();
        setDrmSystems(results);
        setSystemInfo(getSystemInfo());
      } catch (error) {
        console.error('Error detecting DRM support:', error);
      } finally {
        setLoading(false);
      }
    }

    checkDRM();
  }, []);

  const handleExport = () => {
    const data = {
      systemInfo,
      drmSystems,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drm-capabilities.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 font-medium"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : (
          <>
            <SystemInfoCard info={systemInfo} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drmSystems.map((system) => (
                <DRMCard key={system.name} system={system} />
              ))}
            </div>
          </>
        )}

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Note: This tool uses the Encrypted Media Extensions (EME) API to detect DRM support.</p>
          <p>Results may vary depending on your browser and system configuration.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
