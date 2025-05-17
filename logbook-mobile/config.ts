// Environment configuration
import Constants from 'expo-constants';

// Get the environment variables from Expo constants
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.14:3001/api',
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