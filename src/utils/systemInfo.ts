export function getSystemInfo() {
  const userAgent = navigator.userAgent;
  let os = "Unknown";
  let browser = "Unknown";
  let version = "Unknown";

  // Detect OS
  if (userAgent.indexOf("Win") !== -1) os = "Windows";
  else if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
  else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
  else if (userAgent.indexOf("Android") !== -1) os = "Android";
  else if (/iPhone|iPad|iPod/.test(userAgent)) os = "iOS";

  // Detect Browser - Order matters! Check specific browsers before Chrome
  // since many are Chromium-based and include "Chrome" in user agent
  if (userAgent.indexOf("Edg/") !== -1) {
    // Chromium-based Edge
    browser = "Edge";
    version = userAgent.match(/Edg\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("OPR/") !== -1 || userAgent.indexOf("Opera/") !== -1) {
    browser = "Opera";
    version = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Brave") !== -1) {
    browser = "Brave";
    version = userAgent.match(/Brave\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Vivaldi") !== -1) {
    browser = "Vivaldi";
    version = userAgent.match(/Vivaldi\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Arc/") !== -1) {
    browser = "Arc";
    version = userAgent.match(/Arc\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Chrome") !== -1) {
    browser = "Chrome";
    version = userAgent.match(/Chrome\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    browser = "Firefox";
    version = userAgent.match(/Firefox\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Safari") !== -1) {
    browser = "Safari";
    version = userAgent.match(/Version\/([\d.]+)/)?.[1] || "";
  } else if (userAgent.indexOf("Edge/") !== -1) {
    // Legacy Edge
    browser = "Edge (Legacy)";
    version = userAgent.match(/Edge\/([\d.]+)/)?.[1] || "";
  }

  return { os, browser, version };
}