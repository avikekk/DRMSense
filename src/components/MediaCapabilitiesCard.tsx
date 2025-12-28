import React from 'react';
import { DetailedMediaCapabilities } from '../types/drm';
import { Film, Music, Monitor, Check, X, Battery, Gauge } from 'lucide-react';

interface MediaCapabilitiesCardProps {
    capabilities: DetailedMediaCapabilities;
}

export function MediaCapabilitiesCard({ capabilities }: MediaCapabilitiesCardProps) {
    return (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-dark-700 col-span-full">


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Video Codecs Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-dark-700">
                        <Film className="w-5 h-5 text-cyan-500" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Video Codecs</h3>
                    </div>
                    <div className="space-y-3">
                        {capabilities.videoCodecs.map((codec) => (
                            <div key={codec.name} className="flex flex-col text-sm animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{codec.name}</span>
                                    {codec.supported ? (
                                        <span className="flex items-center text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                            <Check className="w-3 h-3 mr-1" /> Supported
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                            <X className="w-3 h-3 mr-1" /> Unsupported
                                        </span>
                                    )}
                                </div>
                                {codec.supported && (
                                    <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        {codec.smooth && (
                                            <span className="flex items-center" title="Smooth playback likely">
                                                <Gauge className="w-3 h-3 mr-1" /> Smooth
                                            </span>
                                        )}
                                        {codec.powerEfficient && (
                                            <span className="flex items-center" title="Power efficient (Hardware decoding)">
                                                <Battery className="w-3 h-3 mr-1" /> Efficient
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audio Codecs Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-dark-700">
                        <Music className="w-5 h-5 text-pink-500" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Audio Codecs</h3>
                    </div>
                    <div className="space-y-2">
                        {capabilities.audioCodecs.map((codec) => (
                            <div key={codec.name} className="flex justify-between items-center text-sm animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <span className="text-gray-700 dark:text-gray-300">{codec.name}</span>
                                {codec.supported ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Display & HDR Section */}
                <div className="space-y-6">

                    {/* Display Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-dark-700">
                            <Monitor className="w-5 h-5 text-amber-500" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Display</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <span className="text-gray-600 dark:text-gray-400">Resolution</span>
                                <span className="text-gray-900 dark:text-white font-medium">{capabilities.display.screen.width} x {capabilities.display.screen.height}</span>
                            </div>
                            <div className="flex justify-between animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <span className="text-gray-600 dark:text-gray-400">Color Depth</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {capabilities.display.screen.colorDepth}-bit
                                    <span className="text-gray-500 font-normal ml-1">
                                        ({Math.round(capabilities.display.screen.colorDepth / 3)}-bit/channel)
                                    </span>
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <p>Gamut Support:</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={capabilities.display.colorGamut.sRGB ? "text-green-600 dark:text-green-400" : "text-gray-400"}>sRGB</span>
                                    <span className="text-gray-300">|</span>
                                    <span className={capabilities.display.colorGamut.p3 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>P3</span>
                                    <span className="text-gray-300">|</span>
                                    <span className={capabilities.display.colorGamut.rec2020 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>Rec.2020</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HDR Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-dark-700">
                            <h3 className="font-medium text-gray-900 dark:text-white">HDR Capabilities</h3>
                        </div>
                        <div className="space-y-2">
                            {capabilities.display.hdr.formats.map((hdr) => (
                                <div key={hdr.name} className="flex justify-between items-center text-sm animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                    <span className="text-gray-700 dark:text-gray-300" title={hdr.description}>{hdr.name}</span>
                                    {hdr.supported ? (
                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                            Supported
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Unsupported</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
