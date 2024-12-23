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
  else if (userAgent.indexOf("iOS") !== -1) os = "iOS";

  // Detect Browser
  if (userAgent.indexOf("Chrome") !== -1) {
    browser = "Chrome";
    version = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || "";
  } else if (userAgent.indexOf("Firefox") !== -1) {
    browser = "Firefox";
    version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || "";
  } else if (userAgent.indexOf("Safari") !== -1) {
    browser = "Safari";
    version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || "";
  } else if (userAgent.indexOf("Edge") !== -1) {
    browser = "Edge";
    version = userAgent.match(/Edge\/(\d+\.\d+)/)?.[1] || "";
  }

  return { os, browser, version };
}