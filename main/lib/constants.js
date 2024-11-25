import { isDev } from './env.js';
export const CONSTANTS = {
  PROJECT_CONFIG_DIR: '.metallurgy',
  PROJECT_CONFIG_FILE: 'projectData.json',
  WINDOW_CONFIG: {
    titleBarStyle: 'hidden',
    width: isDev ? 1200 : 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      // Note: preload path will be set in index.js
      preload: null
    }
  }
};