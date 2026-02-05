import React from 'react';
import { DetailedMediaCapabilities } from '../types/drm';
import {
    BsFilm,
    BsMusicNoteBeamed,
    BsCheck,
    BsX,
    BsBattery,
    BsSpeedometer2,
} from 'react-icons/bs';

interface MediaCapabilitiesCardProps {
    capabilities: DetailedMediaCapabilities;
}

export function MediaCapabilitiesCard({ capabilities }: MediaCapabilitiesCardProps) {
    return (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-dark-700 col-span-full">


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Video Codecs Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-dark-700">
                        <BsFilm className="w-5 h-5 text-cyan-500" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Video Codecs</h3>
                    </div>
                    <div className="space-y-3">
                        {capabilities.videoCodecs.map((codec) => (
                            <div key={codec.name} className="flex flex-col text-sm animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{codec.name}</span>
                                    {codec.supported ? (
                                        <span className="flex items-center text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                                            <BsCheck className="w-3 h-3 mr-1" /> Supported
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                                            <BsX className="w-3 h-3 mr-1" /> Unsupported
                                        </span>
                                    )}
                                </div>
                                {codec.supported && (
                                    <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        {codec.smooth && (
                                            <span className="flex items-center" title="Smooth playback likely">
                                                <BsSpeedometer2 className="w-3 h-3 mr-1" /> Smooth
                                            </span>
                                        )}
                                        {codec.powerEfficient && (
                                            <span className="flex items-center" title="Power efficient (Hardware decoding)">
                                                <BsBattery className="w-3 h-3 mr-1" /> Efficient
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
                        <BsMusicNoteBeamed className="w-5 h-5 text-pink-500" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Audio Codecs</h3>
                    </div>
                    <div className="space-y-2">
                        {capabilities.audioCodecs.map((codec) => (
                            <div key={codec.name} className="flex justify-between items-center text-sm animate-hover p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <span className="text-gray-700 dark:text-gray-300">{codec.name}</span>
                                {codec.supported ? (
                                    <BsCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                    <BsX className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Display & HDR Section removed */}
            </div>
        </div>
    );
}
