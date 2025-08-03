// ✅ UPDATED ENVIRONMENT CONFIGURATION - WITH FIREBASE FUNCTIONS
// File: src/config/environment.js

// 🌍 UNIVERSAL: Auto-detect environment and configure accordingly
class UniversalEnvironmentConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getEnvironmentConfig();
  }

  // 🔍 SMART: Detect current environment
  detectEnvironment() {
    const hostname = window.location.hostname;
    const href = window.location.href;
    
    // Production website
    if (hostname === 'thereturnoofattention.com') {
      return 'production';
    }
    
    // Cloud Shell development
    if (hostname.includes('cloudshell.dev')) {
      return 'cloudshell';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    
    // Firebase hosting preview
    if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) {
      return 'staging';
    }
    
    // Default fallback
    return 'development';
  }

  // ⚙️ CONFIGURATION: Environment-specific settings
  getEnvironmentConfig() {
    const baseConfig = {
      // Feature flags
      features: {
        analytics: true,
        debugging: false,
        adminPanel: true,
        realTimeValidation: false
      },
      
      // API settings
      api: {
        timeout: 10000,
        retries: 3
      }
    };

    const environmentConfigs = {
      production: {
        ...baseConfig,
        adminServerUrl: 'https://us-central1-return-of-attention-app.cloudfunctions.net/adminApi',
        features: {
          ...baseConfig.features,
          debugging: false,
          adminPanel: true, // ✅ ENABLED: Now we have Firebase Functions admin
          realTimeValidation: true // ✅ ENABLED: Real-time user deletion detection
        },
        api: {
          timeout: 8000,
          retries: 2
        }
      },

      staging: {
        ...baseConfig,
        adminServerUrl: 'https://us-central1-return-of-attention-app.cloudfunctions.net/adminApi',
        features: {
          ...baseConfig.features,
          debugging: true,
          adminPanel: true, // ✅ ENABLED: Firebase Functions admin
          realTimeValidation: true
        }
      },

      cloudshell: {
        ...baseConfig,
        adminServerUrl: process.env.REACT_APP_ADMIN_SERVER_URL || 'https://3001-cs-8012bd28-386d-4208-9c50-72554d95a20c.cs-asia-southeast1-palm.cloudshell.dev',
        features: {
          ...baseConfig.features,
          debugging: true,
          adminPanel: true, // ✅ Keep Cloud Shell admin for development
          realTimeValidation: false
        }
      },

      development: {
        ...baseConfig,
        adminServerUrl: 'http://localhost:3001',
        features: {
          ...baseConfig.features,
          debugging: true,
          adminPanel: true,
          realTimeValidation: false
        }
      }
    };

    return environmentConfigs[this.environment] || environmentConfigs.development;
  }

  // 🌍 PUBLIC: Get admin server URL
  getAdminServerUrl() {
    // Check environment variable first (highest priority)
    if (process.env.REACT_APP_ADMIN_SERVER_URL) {
      return process.env.REACT_APP_ADMIN_SERVER_URL;
    }
    
    return this.config.adminServerUrl;
  }

  // 🔧 PUBLIC: Check if feature is enabled
  isFeatureEnabled(featureName) {
    return this.config.features[featureName] || false;
  }

  // 📱 PUBLIC: Get API configuration
  getApiConfig() {
    return this.config.api;
  }

  // 🔍 PUBLIC: Get current environment info
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      hostname: window.location.hostname,
      adminServerUrl: this.getAdminServerUrl(),
      features: this.config.features
    };
  }

  // 🧪 PUBLIC: Test admin server connectivity
  async testAdminServer() {
    const url = this.getAdminServerUrl();
    
    if (!url) {
      return {
        available: false,
        url: null,
        error: 'Admin server not configured for this environment',
        environment: this.environment
      };
    }
    
    const config = this.getApiConfig();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      return {
        available: response.ok,
        url: url,
        status: response.status,
        environment: this.environment
      };
      
    } catch (error) {
      return {
        available: false,
        url: url,
        error: error.message,
        environment: this.environment
      };
    }
  }

  // 🔄 PUBLIC: Validate current configuration
  validateConfig() {
    const issues = [];
    
    // Check admin server URL if admin panel is enabled
    if (this.isFeatureEnabled('adminPanel') && !this.getAdminServerUrl()) {
      issues.push('Admin server URL not configured');
    }
    
    // Check environment detection
    if (this.environment === 'development' && !window.location.hostname.includes('localhost')) {
      issues.push('Environment detection may be incorrect');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      environment: this.environment,
      config: this.getEnvironmentInfo()
    };
  }
}

// 🌍 SINGLETON: Create global instance
export const environmentConfig = new UniversalEnvironmentConfig();

// 🚀 CONVENIENCE EXPORTS
export const getAdminServerUrl = () => environmentConfig.getAdminServerUrl();
export const isFeatureEnabled = (feature) => environmentConfig.isFeatureEnabled(feature);
export const getEnvironmentInfo = () => environmentConfig.getEnvironmentInfo();
export const testAdminServer = () => environmentConfig.testAdminServer();

// 🧪 DEBUG: Log environment info (only in development)
if (environmentConfig.isFeatureEnabled('debugging')) {
  console.log('🌍 Universal Environment Config:', environmentConfig.getEnvironmentInfo());
}