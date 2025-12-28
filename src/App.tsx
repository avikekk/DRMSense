import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'drm' | 'media'>('drm');

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

  const supportedDrmSystems = drmSystems.filter(system => system.supported);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors font-sans">
      <ThemeToggle />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 glow-icon" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">DRMSense</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xl">
            Check your browser's Digital Rights Management (DRM) capabilities and extensive media codec support.
          </p>
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
                onClick={() => setActiveTab('drm')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'drm'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                DRM Info
              </button>
              <button
                onClick={() => setActiveTab('media')}
                className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'media'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                Media Info
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
                  {supportedDrmSystems.length > 0 ? (
                    supportedDrmSystems.map((system) => (
                      <DRMCard key={system.name} system={system} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-100 dark:border-dark-700">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active DRM systems detected</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Your browser doesn't appear to support the standard DRM systems (Widevine, PlayReady, FairPlay) checked by this tool.
                      </p>
                    </div>
                  )}
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
