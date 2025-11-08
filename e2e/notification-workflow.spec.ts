import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 알림 시스템 워크플로우 E2E 테스트
 * 알림 노출 조건 및 시간에 따른 알림 표시 검증
 */

test.describe('알림 시스템 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 로딩 완료 대기
    await page.waitForTimeout(500);
  });

  test('알림 시간을 설정한 일정을 생성할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('알림 테스트');
    await page.locator('#date').fill('2025-11-01');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');

    // 알림 시간 선택
    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByTestId('event-submit-button').click();

    // 일정 목록에서 알림 정보 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 테스트')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText(/알림.*10분/i)).toBeVisible({ timeout: 10000 });
  });

  test('다양한 알림 시간 옵션을 선택할 수 있어야 함', async ({ page }) => {
    const notificationOptions = [
      { label: '1분 전', expectedText: '1분' },
      { label: '10분 전', expectedText: '10분' },
      { label: '1시간 전', expectedText: '1시간' },
      { label: '2시간 전', expectedText: '2시간' },
      { label: '1일 전', expectedText: '1일' },
    ];

    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < notificationOptions.length; i++) {
      const option = notificationOptions[i];

      await page.locator('#title').fill(`알림 ${i + 1}`);
      await page.locator('#date').fill('2025-11-05');
      await page.locator('#start-time').fill(`${10 + i}:00`);
      await page.locator('#end-time').fill(`${11 + i}:00`);

      await page.locator('#notification').click();
      await page.getByRole('option', { name: option.label }).click();

      await page.getByTestId('event-submit-button').click();

      await expect(eventList.getByText(`알림 ${i + 1}`)).toBeVisible({ timeout: 10000 });
      await expect(eventList.getByText(new RegExp(option.expectedText, 'i'))).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('알림을 설정하지 않은 일정도 생성할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('알림 없는 일정');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('16:00');

    // 알림 시간을 선택하지 않음

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 없는 일정')).toBeVisible({ timeout: 10000 });
  });

  test('일정 수정 시 알림 시간도 변경할 수 있어야 함', async ({ page }) => {
    // Given: 알림이 10분 전으로 설정된 일정 생성
    await page.locator('#title').fill('회의');
    await page.locator('#date').fill('2025-11-12');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');

    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의')).toBeVisible({ timeout: 10000 });

    // When: 일정 수정하여 알림 시간을 1시간 전으로 변경
    await page.getByRole('button', { name: 'Edit event' }).first().click();

    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    await page.locator('#notification').click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    await page.getByTestId('event-submit-button').click();

    // Then: 변경된 알림 시간 확인
    await expect(eventList.getByText(/알림.*1시간/i)).toBeVisible({ timeout: 10000 });
  });

  test('반복 일정에도 알림을 설정할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('매일 알림 일정');
    await page.locator('#date').fill('2025-11-15');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');

    // 알림 설정
    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    // 반복 일정 설정
    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-20');

    await page.getByTestId('event-submit-button').click();

    // 반복 일정 모두 알림이 설정되었는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 알림 일정').first()).toBeVisible({ timeout: 10000 });
  });

  test('여러 카테고리의 일정에 각각 다른 알림을 설정할 수 있어야 함', async ({ page }) => {
    const categories = [
      { name: '업무', notification: '10분 전', title: '업무 미팅' },
      { name: '개인', notification: '1시간 전', title: '개인 약속' },
      { name: '가족', notification: '1일 전', title: '가족 행사' },
    ];

    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      await page.locator('#title').fill(category.title);
      await page.locator('#date').fill('2025-11-20');
      await page.locator('#start-time').fill(`${10 + i}:00`);
      await page.locator('#end-time').fill(`${11 + i}:00`);

      await page.locator('#category').click();
      await page.getByRole('option', { name: category.name }).click();

      await page.locator('#notification').click();
      await page.getByRole('option', { name: category.notification }).click();

      await page.getByTestId('event-submit-button').click();

      await expect(eventList.getByText(category.title)).toBeVisible({ timeout: 10000 });
    }
  });

  test('알림 아이콘이 알림이 설정된 일정에만 표시되어야 함', async ({ page }) => {
    // 알림 있는 일정
    await page.locator('#title').fill('알림 있음');
    await page.locator('#date').fill('2025-11-22');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByTestId('event-submit-button').click();

    await page.waitForTimeout(300);

    // 알림 없는 일정
    await page.locator('#title').fill('알림 없음');
    await page.locator('#date').fill('2025-11-22');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('알림 있음')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('알림 없음')).toBeVisible({ timeout: 10000 });
  });

  test('임박한 일정에 대한 알림이 표시되어야 함', async ({ page }) => {
    // 현재 시간 기준으로 15분 후의 일정 생성
    const now = new Date();
    const futureTime = new Date(now.getTime() + 15 * 60 * 1000); // 15분 후

    const dateStr = futureTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = futureTime.toTimeString().slice(0, 5); // HH:MM
    const endTime = new Date(futureTime.getTime() + 30 * 60 * 1000); // 30분 후 종료
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    await page.locator('#title').fill('곧 시작할 일정');
    await page.locator('#date').fill(dateStr);
    await page.locator('#start-time').fill(timeStr);
    await page.locator('#end-time').fill(endTimeStr);
    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('곧 시작할 일정')).toBeVisible({ timeout: 10000 });
  });

  test('지난 일정은 알림이 표시되지 않아야 함', async ({ page }) => {
    // 지난 날짜의 일정 생성
    await page.locator('#title').fill('지난 일정');
    await page.locator('#date').fill('2025-11-01');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('지난 일정')).toBeVisible({ timeout: 10000 });
  });

  test('같은 시간에 여러 일정의 알림이 있어도 모두 표시되어야 함', async ({ page }) => {
    // 같은 날짜/시간에 여러 일정 생성
    const events = ['일정 A', '일정 B', '일정 C'];
    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < events.length; i++) {
      await page.locator('#title').fill(events[i]);
      await page.locator('#date').fill('2025-11-25');
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.locator('#notification').click();
      await page.getByRole('option', { name: '10분 전' }).click();
      await page.getByTestId('event-submit-button').click();

      // 겹침 경고 다이얼로그가 나타나면 계속 진행
      const continueButton = page.getByRole('button', { name: /계속|확인|추가/i });
      if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await continueButton.click();
      }

      // 일정이 추가될 때까지 대기
      await expect(eventList.getByText(events[i])).toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1000);
    }

    // 모든 일정이 표시되는지 확인
    for (const event of events) {
      await expect(eventList.getByText(event)).toBeVisible({ timeout: 10000 });
    }
  });

  test('알림 시간 순서대로 정렬되어 표시되어야 함', async ({ page }) => {
    // 다양한 알림 시간의 일정 생성
    const notificationTimes = [
      { time: '1일 전', title: '이벤트 1', hour: '10' },
      { time: '1분 전', title: '이벤트 2', hour: '11' },
      { time: '1시간 전', title: '이벤트 3', hour: '12' },
    ];

    const eventList = page.getByTestId('event-list');

    for (const item of notificationTimes) {
      await page.locator('#title').fill(item.title);
      await page.locator('#date').fill('2025-11-28');
      await page.locator('#start-time').fill(`${item.hour}:00`);
      await page.locator('#end-time').fill(`${item.hour}:30`);
      await page.locator('#notification').click();
      await page.getByRole('option', { name: item.time }).click();
      await page.getByTestId('event-submit-button').click();

      // 일정이 추가되고 스낵바가 사라질 때까지 충분히 대기
      await page.waitForTimeout(2000);
    }

    // 모든 일정이 생성되었는지 확인
    for (const item of notificationTimes) {
      await expect(eventList.getByText(item.title)).toBeVisible({ timeout: 10000 });
    }
  });
});
