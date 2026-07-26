import type { ContainerSupport } from '../types/drm';
import { CONTAINERS, type ContainerProbe } from '../constants/containers';

/**
 * Container detection across the three APIs that answer the question
 * differently.
 *
 * None of these are part of Media Capabilities — they predate it and remain
 * the only way to ask about a container independent of a full decode config.
 */

/** MediaSource is absent in Workers and older Safari; ManagedMediaSource is the Safari 17+ form. */
function mseSupports(type: string): boolean {
  const MSE =
    typeof MediaSource !== 'undefined'
      ? MediaSource
      : (globalThis as { ManagedMediaSource?: typeof MediaSource }).ManagedMediaSource;

  try {
    return MSE?.isTypeSupported(type) ?? false;
  } catch {
    return false;
  }
}

/** canPlayType returns 'probably', 'maybe', or '' — the empty string means no. */
function progressiveSupports(type: string): string {
  try {
    const element = type.startsWith('audio/')
      ? document.createElement('audio')
      : document.createElement('video');
    return element.canPlayType(type) || '';
  } catch {
    return '';
  }
}

function recordingSupports(type: string): boolean {
  try {
    return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type);
  } catch {
    return false;
  }
}

function probeContainer(container: ContainerProbe): ContainerSupport {
  return {
    name: container.name,
    extensions: container.extensions,
    mediaSource: container.mse ? mseSupports(container.mse) : false,
    progressive: container.progressive ? progressiveSupports(container.progressive) : '',
    recording: container.record ? recordingSupports(container.record) : false,
  };
}

export function detectContainers(): ContainerSupport[] {
  return CONTAINERS.map(probeContainer);
}
