import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'**/*.spec.js',
  timeout:60000,
  expect:{timeout:10000},
  workers:1,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  reporter:process.env.CI?'github':'list',
  use:{channel:'chrome',baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure'},
  webServer:{
    command:'npm run dev',
    url:'http://127.0.0.1:5173',
    reuseExistingServer:!process.env.CI,
    timeout:30000
  }
});
