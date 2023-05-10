import { CapacitorConfig } from '@capacitor/cli';

// TODO: find a better way to turn live reloading on/off via cli or env var:
// /** If true then live reloading is turned on. */
// const LIVE_RELOAD = process.argv.includes('-lr') || process.argv.includes('--live-reloading');

// const server: CapacitorConfig['server'] = { 
//   url: 'http://10.0.2.2:5173',
//   cleartext: true,
// };
const server: CapacitorConfig['server'] = undefined;

const config: CapacitorConfig = {
  appId: 'com.danoaky.spacetraders',
  appName: 'Space Traders',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

if (server) console.log(`🔴🔥 Running capactitor with live-reload at "${server?.url}"`);

export default config;
