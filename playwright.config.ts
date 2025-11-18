import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Désactivé pour les tests multi-utilisateurs
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Un seul worker pour éviter les conflits d'état
  reporter: process.env.CI
    ? [
        ['html'],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list']
      ]
    : 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})