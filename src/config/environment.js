// ✅ ENVIRONMENT CONFIGURATION
// File: src/config/environment.js

// ✅ Environment detection
export const getEnvironmentInfo = () => {
  const hostname = window.location.hostname;
  const href = window.location.href;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return { environment: 'development', hostname, href };
  } else if (hostname.includes('cloudshell') || hostname.includes('cs-')) {
    return { environment: 'cloudshell', hostname, href };
  } else if (hostname === 'thereturnofattention.com') {
    return { environment: 'production', hostname, href };
  } else {
    return { environment: 'unknown', hostname, href };
  }
};

// ✅ Feature flags
export const isFeatureEnabled = (feature) => {
  const environment = getEnvironmentInfo().environment;
  
  switch (feature) {
    case 'debugging':
      return environment === 'development' || environment === 'cloudshell';
    case 'realTimeValidation':
      return environment === 'production';
    case 'emulators':
      return environment === 'development';
    default:
      return false;
  }
};

// ✅ Admin server URL based on environment
export const getAdminServerUrl = () => {
  const environment = getEnvironmentInfo().environment;
  
  if (process.env.REACT_APP_ADMIN_SERVER_URL) {
    return process.env.REACT_APP_ADMIN_SERVER_URL;
  }
  
  switch (environment) {
    case 'development':
      return 'http://localhost:3001';
    case 'cloudshell':
      return 'https://3001-cs-8012bd28-386d-4208-9c50-72554d95a20c.cs-asia-southeast1-palm.cloudshell.dev';
    case 'production':
      return 'https://thereturnofattention.com';
    default:
      return 'http://localhost:3001';
  }
};