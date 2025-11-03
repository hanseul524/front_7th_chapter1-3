import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // e2e 테스트 디렉토리
  testDir: './e2e',

  // 각 테스트의 타임아웃 (30초)
  timeout: 30 * 1000,

  // expect 타임아웃
  expect: {
    timeout: 5000,
  },

  // 모든 테스트를 병렬로 실행
  fullyParallel: true,

  // CI 환경에서만 실패 시 재시도
  retries: process.env.CI ? 2 : 0,

  // 워커 수 (병렬 실행 프로세스 수)
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [['html'], ['list']],

  // 공통 설정
  use: {
    // 베이스 URL (Vite 개발 서버)
    baseURL: 'http://localhost:5173',

    // 스크린샷 (실패 시에만)
    screenshot: 'only-on-failure',

    // 비디오 녹화 (실패 시에만)
    video: 'retain-on-failure',

    // 트레이스 (첫 번째 재시도 시)
    trace: 'on-first-retry',

    // 액션 타임아웃
    actionTimeout: 10 * 1000,

    // 네비게이션 타임아웃
    navigationTimeout: 30 * 1000,

    headless: false,
  },

  // 테스트 실행 전 개발 서버 자동 시작
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // 테스트할 브라우저 설정
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
