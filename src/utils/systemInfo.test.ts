import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSystemInfo } from './systemInfo';

function withUA(userAgent: string, maxTouchPoints = 0) {
  vi.stubGlobal('navigator', { userAgent, maxTouchPoints });
  return getSystemInfo();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const UA = {
  winChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  winEdge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.87',
  winOpera:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  iosSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iosChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  androidSamsung:
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  linuxFirefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  chromeOS:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
};

describe('operating system detection', () => {
  it.each([
    ['Windows', UA.winChrome, 0],
    ['macOS', UA.macSafari, 0],
    ['iOS', UA.iosSafari, 5],
    ['Android', UA.androidChrome, 5],
    ['Linux', UA.linuxFirefox, 0],
    ['ChromeOS', UA.chromeOS, 0],
  ])('detects %s', (expected, ua, touch) => {
    expect(withUA(ua, touch).os).toBe(expected);
  });

  // Regression: Android and iOS UAs contain "Linux" and "Mac" respectively, so
  // a general match placed first makes both branches unreachable.
  it('prefers Android over the Linux token in the same UA', () => {
    expect(UA.androidChrome).toContain('Linux');
    expect(withUA(UA.androidChrome, 5).os).toBe('Android');
  });

  it('prefers iOS over the Mac token in the same UA', () => {
    expect(UA.iosSafari).toContain('Mac OS X');
    expect(withUA(UA.iosSafari, 5).os).toBe('iOS');
  });
});

describe('iPadOS disambiguation', () => {
  // iPadOS 13+ sends a byte-identical desktop Safari UA; only touch separates them.
  it('reports iPadOS for a Mac UA with touch points', () => {
    expect(withUA(UA.macSafari, 5).os).toBe('iPadOS');
  });

  it('reports macOS for the same UA without touch points', () => {
    expect(withUA(UA.macSafari, 0).os).toBe('macOS');
  });

  it('still recognises the legacy iPad UA', () => {
    const ua =
      'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
    expect(withUA(ua, 5)).toMatchObject({ os: 'iPadOS', osVersion: '17.5' });
  });
});

describe('browser detection', () => {
  it.each([
    ['Chrome', UA.winChrome],
    ['Edge', UA.winEdge],
    ['Opera', UA.winOpera],
    ['Safari', UA.macSafari],
    ['Firefox', UA.linuxFirefox],
    ['Samsung Internet', UA.androidSamsung],
  ])('detects %s', (expected, ua) => {
    expect(withUA(ua).browser).toBe(expected);
  });

  // Regression: Chromium Edge reports "Edg/", not "Edge/", and its UA also
  // contains "Chrome" — matching Chrome first mislabels every Edge user.
  it('prefers Edge over the Chrome token in the same UA', () => {
    expect(UA.winEdge).toContain('Chrome/');
    expect(withUA(UA.winEdge)).toMatchObject({ browser: 'Edge', version: '126.0' });
  });

  it('detects iOS Chrome via the CriOS token', () => {
    expect(withUA(UA.iosChrome, 5)).toMatchObject({ os: 'iOS', browser: 'Chrome' });
  });

  it('detects Firefox on Android, whose UA omits "Linux"', () => {
    expect(withUA(UA.androidFirefox, 5)).toMatchObject({ os: 'Android', browser: 'Firefox' });
  });
});

describe('os version', () => {
  it('maps Windows NT 10.0 to its marketing name', () => {
    expect(withUA(UA.winChrome).osVersion).toBe('10 / 11');
  });

  it('flags the frozen macOS version string rather than reporting it as truth', () => {
    expect(withUA(UA.macSafari).osVersion).toContain('UA capped');
  });

  it('converts Apple underscore versions to dots', () => {
    expect(withUA(UA.iosSafari, 5).osVersion).toBe('17.5');
  });
});

describe('form factor', () => {
  it.each([
    [UA.androidChrome, 5, true],
    [UA.iosSafari, 5, true],
    [UA.winChrome, 0, false],
    [UA.linuxFirefox, 0, false],
  ])('classifies mobile correctly', (ua, touch, expected) => {
    expect(withUA(ua, touch).mobile).toBe(expected);
  });
});

it('degrades to Unknown rather than throwing on an unrecognised UA', () => {
  expect(withUA('some-random-crawler/1.0')).toMatchObject({
    os: 'Unknown',
    browser: 'Unknown',
  });
});
