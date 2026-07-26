import { useState } from 'react';
import { useCapabilityDetection } from './hooks/useCapabilityDetection';
import { buildExportPayload, downloadJson, exportFilename } from './utils/exportData';
import { DRMCard } from './components/DRMCard';
import { EmptyState } from './components/EmptyState';
import { ExportButton } from './components/ExportButton';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MediaCapabilitiesCard } from './components/MediaCapabilitiesCard';
import { PageHeader } from './components/PageHeader';
import { SystemInfoCard } from './components/SystemInfoCard';
import { TabBar, type Tab } from './components/TabBar';
import { ThemeToggle } from './components/ThemeToggle';

type TabId = 'drm' | 'media';

const TABS: readonly Tab<TabId>[] = [
  { id: 'drm', label: 'DRM Info' },
  { id: 'media', label: 'Media Info' },
];

function App() {
  const { drmSystems, mediaCapabilities, systemInfo, loading } = useCapabilityDetection();
  const [activeTab, setActiveTab] = useState<TabId>('drm');

  const supportedDrmSystems = drmSystems.filter((system) => system.supported);

  const handleExport = () => {
    const payload = buildExportPayload(systemInfo, drmSystems, mediaCapabilities);
    downloadJson(payload, exportFilename(payload.exportedAt));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors font-sans">
      <ThemeToggle />
      <ExportButton onExport={handleExport} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <PageHeader />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <SystemInfoCard info={systemInfo} />
            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

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
                    <EmptyState />
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Note: This tool uses the Encrypted Media Extensions (EME) and Media Capabilities
            APIs.
          </p>
          <p>
            Results may vary depending on your browser, operating system, and hardware
            configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
