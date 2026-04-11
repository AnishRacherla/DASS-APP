// Backend server configuration
// Change to your computer's local IP for Expo Go testing
// Use 'ifconfig' or 'ip addr' to find your LAN IP

// DEVELOPMENT - Local testing (replace with your IP):
const API_BASE_URL = 'http://172.25.80.189:5001';

// PRODUCTION - Use your deployed backend URL:
// const API_BASE_URL = 'https://YOUR_APP_NAME.onrender.com';

// Global axios timeout (ms) — prevents app from freezing if backend is down
const API_TIMEOUT = 8000;

export { API_BASE_URL, API_TIMEOUT };
