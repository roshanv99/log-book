// Environment configuration
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get the environment variables from Expo constants
const ENV = {
  dev: {
    // Use localhost for simulators, local IP for physical devices
    apiUrl: Platform.select({
      ios: 'http://192.168.1.3:3001/api',
      android: Constants.isDevice ? 'xhttp://192.168.1.3:3001/api' : 'http://10.0.2.2:3001/api',
      default: 'http://192.168.1.3:3001/api', // Fallback to your local IP
    }),
  },
  staging: {
    apiUrl: 'http://staging-api.logbook.com/api',
  },
  prod: {
    apiUrl: 'https://api.logbook.com/api',
  }
};

// Determine which environment to use
const getEnvVars = (env = Constants.expoConfig?.extra?.ENV) => {
  if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'prod') {
    return ENV.prod;
  } else {
    return ENV.dev;
  }
};

// Export the configuration
export default getEnvVars();

// API Configuration
export const API_URL = getEnvVars().apiUrl;

// Other configuration constants
export const APP_NAME = 'LogBook';
export const APP_VERSION = '1.0.0';

// Theme configuration
export const THEME = {
  light: {
    primary: '#3D5AF1',
    secondary: '#4361EE',
    background: '#FFFFFF',
    text: '#000000',
    card: '#F5F5F5',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3D5AF1',
    background: '#000000',
    text: '#FFFFFF',
    card: '#1A1A1A',
  },
};

// Currency configuration
export const DEFAULT_CURRENCY = {
  code: 'INR',
  symbol: '₹',
};

// Date format configuration
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'; 