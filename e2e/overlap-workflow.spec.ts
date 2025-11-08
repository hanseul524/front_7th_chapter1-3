import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 일정 겹침 처리 워크플로우 E2E 테스트
 * 일정 간 시간 겹침 검증 및 경고 처리
 */

test.describe('일정 겹침 처리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 로딩 완료 대기
    await page.waitForTimeout(500);
  });

  test('겹치는 일정 추가 시 경고 메시지가 표시되어야 함', async ({ page }) => {
    // Given: 첫 번째 일정 생성
    await page.locator('#title').fill('회의 A');
    await page.locator('#date').fill('2025-11-20');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의 A')).toBeVisible({ timeout: 10000 });

    await page.locator('#title').fill('회의 B');
    await page.locator('#date').fill('2025-11-20');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('다음 일정과 겹칩니다:')).toBeVisible();

    await expect(page.getByRole('button', { name: /취소/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /계속|확인/i })).toBeVisible();
  });

  test('시작 시간이 겹치는 일정을 감지해야 함', async ({ page }) => {
    //  첫 번째 일정 (14:00 - 16:00)
    await page.locator('#title').fill('프로젝트 미팅');
    await page.locator('#date').fill('2025-11-21');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('16:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByTestId('event-list').getByText('프로젝트 미팅')).toBeVisible({
      timeout: 10000,
    });

    // 두 번째 일정 (15:00 - 17:00)
    await page.locator('#title').fill('클라이언트 미팅');
    await page.locator('#date').fill('2025-11-21');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('17:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('종료 시간이 겹치는 일정을 감지해야 함', async ({ page }) => {
    // 첫 번째 일정 (15:00 - 17:00)
    await page.locator('#title').fill('개발 회의');
    await page.locator('#date').fill('2025-11-22');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('17:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByTestId('event-list').getByText('개발 회의')).toBeVisible({
      timeout: 10000,
    });

    // 두 번째 일정 (13:00 - 16:00)
    await page.locator('#title').fill('디자인 리뷰');
    await page.locator('#date').fill('2025-11-22');
    await page.locator('#start-time').fill('13:00');
    await page.locator('#end-time').fill('16:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('완전히 포함되는 일정을 감지해야 함', async ({ page }) => {
    // 긴 일정 (10:00 - 18:00)
    await page.locator('#title').fill('워크샵');
    await page.locator('#date').fill('2025-11-23');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('18:00');
    await page.getByTestId('event-submit-button').click();

    await expect(page.getByTestId('event-list').getByText('워크샵')).toBeVisible({
      timeout: 10000,
    });

    // 중간에 짧은 일정 추가 (14:00 - 15:00)
    await page.locator('#title').fill('점심 약속');
    await page.locator('#date').fill('2025-11-23');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 표시
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('다른 날짜의 같은 시간대는 겹침으로 감지하지 않아야 함', async ({ page }) => {
    // 11월 24일 일정
    await page.locator('#title').fill('월요일 회의');
    await page.locator('#date').fill('2025-11-24');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('월요일 회의')).toBeVisible({ timeout: 10000 });

    // 11월 25일 같은 시간대 일정
    await page.locator('#title').fill('화요일 회의');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고가 표시되지 않고 정상 추가
    await expect(eventList.getByText('화요일 회의')).toBeVisible({ timeout: 10000 });
    // 겹침 경고가 없는지 확인
    await expect(page.getByText(/일정이 겹칩니다|겹치는 일정/i)).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('겹침 경고 후에도 일정을 강제로 추가할 수 있어야 함', async ({ page }) => {
    // 첫 번째 일정
    await page.locator('#title').fill('중요 회의');
    await page.locator('#date').fill('2025-11-26');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요 회의')).toBeVisible({ timeout: 10000 });

    // 겹치는 시간대에 일정 추가
    await page.locator('#title').fill('긴급 회의');
    await page.locator('#date').fill('2025-11-26');
    await page.locator('#start-time').fill('14:30');
    await page.locator('#end-time').fill('15:30');
    await page.getByTestId('event-submit-button').click();

    // 겹침 다이얼로그가 나타나면 "계속 진행" 클릭
    const continueButton = page.getByRole('button', { name: /계속|확인|추가/i });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
    }

    await expect(eventList.getByText('중요 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('긴급 회의')).toBeVisible({ timeout: 10000 });
  });

  test('연속된 일정은 겹침으로 처리하지 않아야 함', async ({ page }) => {
    // 첫 번째 일정 (09:00 - 10:00)
    await page.locator('#title').fill('아침 미팅');
    await page.locator('#date').fill('2025-11-27');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('아침 미팅')).toBeVisible({ timeout: 10000 });

    // 바로 이어지는 일정 (10:00 - 11:00)
    await page.locator('#title').fill('팀 스탠드업');
    await page.locator('#date').fill('2025-11-27');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 없이 정상 추가
    await expect(eventList.getByText('팀 스탠드업')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/일정이 겹칩니다|겹치는 일정/i)).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('여러 일정과 겹칠 경우 모두 표시해야 함', async ({ page }) => {
    // 여러 일정 생성
    const events = [
      { title: '회의 1', time: '10:00-11:00' },
      { title: '회의 2', time: '11:00-12:00' },
      { title: '회의 3', time: '13:00-14:00' },
    ];

    for (const event of events) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill('2025-11-28');
      const [start, end] = event.time.split('-');
      await page.locator('#start-time').fill(start);
      await page.locator('#end-time').fill(end);
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    // 모든 시간을 포괄하는 긴 일정 추가 (09:00 - 15:00)
    await page.locator('#title').fill('전체 워크샵');
    await page.locator('#date').fill('2025-11-28');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 표시
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });

  test('일정 수정 시에도 겹침을 검사해야 함', async ({ page }) => {
    // Given: 두 개의 일정 생성
    await page.locator('#title').fill('오전 회의');
    await page.locator('#date').fill('2025-11-29');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');
    await page.getByTestId('event-submit-button').click();

    await page.waitForTimeout(300);

    await page.locator('#title').fill('오후 회의');
    await page.locator('#date').fill('2025-11-29');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('오전 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('오후 회의')).toBeVisible({ timeout: 10000 });

    // When: 오후 회의 시간을 오전 시간으로 수정
    const editButtons = await page.getByRole('button', { name: 'Edit event' }).all();
    await editButtons[1].click();

    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible({ timeout: 10000 });

    await page.locator('#start-time').fill('09:30');
    await page.locator('#end-time').fill('10:30');
    await page.getByTestId('event-submit-button').click();

    // Then: 겹침 경고 표시
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });
});
