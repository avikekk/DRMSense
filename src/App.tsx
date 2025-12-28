import React, { useEffect, useState } from 'react';
import { Shield, Download } from 'lucide-react';
import { detectMediaAndDRM } from './utils/drmDetector';
import { getSystemInfo } from './utils/systemInfo';
import { DRMCard } from './components/DRMCard';
import { SystemInfoCard } from './components/SystemInfoCard';
import { MediaCapabilitiesCard } from './components/MediaCapabilitiesCard';
import { ThemeToggle } from './components/ThemeToggle';
import type { DRMSystemInfo, SystemInfo, DetailedMediaCapabilities } from './types/drm';

function App() {
  const [drmSystems, setDrmSystems] = useState<DRMSystemInfo[]>([]);
  const [mediaCapabilities, setMediaCapabilities] = useState<DetailedMediaCapabilities | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: '', browser: '', version: '' });
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'media' | 'drm'>('media');

  useEffect(() => {
    async function checkDRM() {
      try {
        const { drmSystems, mediaCapabilities } = await detectMediaAndDRM();
        setDrmSystems(drmSystems);
        setMediaCapabilities(mediaCapabilities);
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
      mediaCapabilities,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drm-media-capabilities.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors font-sans">
      <ThemeToggle />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">DRMSense</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4 text-lg">
            Check your browser's Digital Rights Management (DRM) capabilities and extensive media codec support.
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

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-dark-700">
              <button
                onClick={() => setActiveTab('media')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'media'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                Media Capabilities
              </button>
              <button
                onClick={() => setActiveTab('drm')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'drm'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                DRM Info
              </button>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'media' && mediaCapabilities && (
                <div className="animate-fade-in">
                  <MediaCapabilitiesCard capabilities={mediaCapabilities} />
                </div>
              )}

              {activeTab === 'drm' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {drmSystems.map((system) => (
                    <DRMCard key={system.name} system={system} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Note: This tool uses the Encrypted Media Extensions (EME) and Media Capabilities APIs.</p>
          <p>Results may vary depending on your browser, operating system, and hardware configuration.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
