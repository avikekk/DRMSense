import type { OperatingSystem, SystemInfo } from '../types/drm';

/**
 * iPadOS 13+ ships a desktop Safari user agent — identical to macOS, with
 * `navigator.platform` reporting "MacIntel". The only reliable discriminator
 * is touch: Macs report `maxTouchPoints` of 0 (or 1), iPads report 5.
 *
 * This matters here because macOS and iPadOS have genuinely different DRM
 * characteristics, so conflating them mislabels FairPlay results.
 */
function isIPadOS(userAgent: string): boolean {
  if (/iPad/i.test(userAgent)) return true;

  return (
    /Macintosh|MacIntel/i.test(userAgent) &&
    typeof navigator !== 'undefined' &&
    navigator.maxTouchPoints > 1
  );
}

function detectOS(userAgent: string): OperatingSystem {
  // Order is load-bearing: Android UAs contain "Linux", iOS UAs contain "Mac",
  // and ChromeOS UAs contain "Linux" too. General checks must come last.
  if (/Android/i.test(userAgent)) return 'Android';
  if (/CrOS/i.test(userAgent)) return 'ChromeOS';
  if (isIPadOS(userAgent)) return 'iPadOS';
  if (/iPhone|iPod/i.test(userAgent)) return 'iOS';
  if (/Windows|Win32|Win64/i.test(userAgent)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Linux|X11/i.test(userAgent)) return 'Linux';
  return 'Unknown';
}

function detectOSVersion(userAgent: string, os: OperatingSystem): string {
  const patterns: Partial<Record<OperatingSystem, RegExp>> = {
    Android: /Android (\d+(?:\.\d+)?)/,
    // Apple reports underscores: "iPhone OS 17_5", "Mac OS X 10_15_7".
    iOS: /OS (\d+[._]\d+)/,
    iPadOS: /OS (\d+[._]\d+)/,
    macOS: /Mac OS X (\d+[._]\d+)/,
    Windows: /Windows NT (\d+\.\d+)/,
    ChromeOS: /CrOS \S+ (\d+(?:\.\d+)*)/,
  };

  const pattern = patterns[os];
  if (!pattern) return 'Unknown';

  const raw = userAgent.match(pattern)?.[1];
  if (!raw) return 'Unknown';

  const version = raw.replace(/_/g, '.');

  // Windows NT numbers are not the marketing name users recognise.
  if (os === 'Windows') {
    if (version === '10.0') return '10 / 11';
    if (version === '6.3') return '8.1';
    if (version === '6.2') return '8';
    if (version === '6.1') return '7';
  }

  // Safari on modern macOS freezes the UA at 10.15.7, so it is not truthful.
  if (os === 'macOS' && version.startsWith('10.15')) return '10.15+ (UA capped)';

  return version;
}

/**
 * Browser detection, ordered most-specific-first.
 *
 * Nearly every engine impersonates its predecessors: Edge UAs contain both
 * "Chrome" and "Safari", Chrome UAs contain "Safari". A general match placed
 * early makes every specific branch below it unreachable.
 */
function detectBrowser(userAgent: string): { browser: string; version: string } {
  const candidates: Array<{ browser: string; pattern: RegExp }> = [
    // Chromium Edge reports "Edg/"; only legacy EdgeHTML used "Edge/".
    { browser: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+(?:\.\d+)?)/ },
    { browser: 'Opera', pattern: /(?:OPR|Opera)\/(\d+(?:\.\d+)?)/ },
    { browser: 'Samsung Internet', pattern: /SamsungBrowser\/(\d+(?:\.\d+)?)/ },
    { browser: 'Firefox', pattern: /(?:Firefox|FxiOS)\/(\d+(?:\.\d+)?)/ },
    { browser: 'Chrome', pattern: /(?:Chrome|CriOS|Chromium)\/(\d+(?:\.\d+)?)/ },
    { browser: 'Safari', pattern: /Version\/(\d+(?:\.\d+)?).*Safari/ },
  ];

  for (const { browser, pattern } of candidates) {
    const match = userAgent.match(pattern);
    if (match) return { browser, version: match[1] };
  }

  // Safari without a Version/ token (older WebViews).
  if (/Safari/i.test(userAgent)) return { browser: 'Safari', version: 'Unknown' };

  return { browser: 'Unknown', version: 'Unknown' };
}

export function getSystemInfo(): SystemInfo {
  const userAgent = navigator.userAgent;
  const os = detectOS(userAgent);
  const { browser, version } = detectBrowser(userAgent);

  return {
    os,
    osVersion: detectOSVersion(userAgent, os),
    browser,
    version,
    mobile: os === 'Android' || os === 'iOS' || os === 'iPadOS' || /Mobile/i.test(userAgent),
  };
}
