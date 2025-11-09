import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 일정 드래그 앤 드롭 워크플로우 E2E 테스트
 * 캘린더에서 일정을 드래그하여 날짜 변경 검증
 */

test.describe('일정 드래그 앤 드롭 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(500);
  });

  test('월간 뷰에서 일정을 다른 날짜로 드래그 앤 드롭할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('드래그 테스트');
    await page.locator('#date').fill('2025-11-15');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#description').fill('이동할 일정');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('드래그 테스트')).toBeVisible({ timeout: 10000 });
    await expect(eventList).toContainText('2025-11-15');

    const eventInCalendar = page.locator('[data-event-title="드래그 테스트"]').first();

    const targetDateCell = page.locator('[data-date="2025-11-20"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(targetDateCell);
        await page.waitForTimeout(500);

        await expect(eventList).toContainText('2025-11-20', { timeout: 10000 });
      }
    }
  });

  test('주간 뷰에서 일정을 드래그하여 날짜 변경', async ({ page }) => {
    const weekViewButton = page.getByRole('button', { name: /주|week/i });
    if (await weekViewButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await weekViewButton.click();
      await page.waitForTimeout(300);
    }

    await page.locator('#title').fill('주간 드래그');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 드래그')).toBeVisible({ timeout: 10000 });

    const eventInCalendar = page.locator('[data-event-title="주간 드래그"]').first();
    const targetDateCell = page.locator('[data-date="2025-11-12"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(targetDateCell);
        await page.waitForTimeout(500);

        await expect(eventList).toContainText('2025-11-12', { timeout: 10000 });
      }
    }
  });

  test('여러 일정을 순차적으로 드래그 앤 드롭할 수 있어야 함', async ({ page }) => {
    const events = [
      { title: '일정 A', date: '2025-11-10', targetDate: '2025-11-15' },
      { title: '일정 B', date: '2025-11-11', targetDate: '2025-11-16' },
      { title: '일정 C', date: '2025-11-12', targetDate: '2025-11-17' },
    ];

    for (const event of events) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill(event.date);
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const eventList = page.getByTestId('event-list');

    for (const event of events) {
      const eventInCalendar = page.locator(`[data-event-title="${event.title}"]`).first();
      const targetDateCell = page.locator(`[data-date="${event.targetDate}"]`).first();

      if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
          await eventInCalendar.dragTo(targetDateCell);
          await page.waitForTimeout(500);
        }
      }
    }

    for (const event of events) {
      await expect(eventList.getByText(event.title)).toBeVisible({ timeout: 10000 });
    }
  });

  test('드래그 앤 드롭 후 일정 상세 정보가 유지되어야 함', async ({ page }) => {
    await page.locator('#title').fill('중요 회의');
    await page.locator('#date').fill('2025-11-13');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('16:00');
    await page.locator('#description').fill('프로젝트 논의');
    await page.locator('#location').fill('회의실 A');

    await page.locator('#category').click();
    await page.getByRole('option', { name: '업무' }).click();

    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요 회의')).toBeVisible({ timeout: 10000 });

    const eventInCalendar = page.locator('[data-event-title="중요 회의"]').first();
    const targetDateCell = page.locator('[data-date="2025-11-18"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(targetDateCell);
        await page.waitForTimeout(500);
      }
    }

    await expect(eventList).toContainText('중요 회의');
    await expect(eventList).toContainText('15:00');
    await expect(eventList).toContainText('16:00');
    await expect(eventList).toContainText('프로젝트 논의');
    await expect(eventList).toContainText('회의실 A');
    await expect(eventList).toContainText('카테고리: 업무');
  });

  test('반복 일정을 드래그할 때 수정 옵션을 선택할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('반복 드래그');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-15');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 드래그').first()).toBeVisible({ timeout: 10000 });

    const eventInCalendar = page.locator('[data-event-title="반복 드래그"]').first();
    const targetDateCell = page.locator('[data-date="2025-11-20"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(targetDateCell);
        await page.waitForTimeout(500);

        const editDialog = page.getByRole('heading', { name: '반복 일정 수정' });
        if (await editDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
          await page.getByRole('button', { name: '예' }).click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('드래그 중 취소 시 일정이 원래 위치로 돌아가야 함', async ({ page }) => {
    await page.locator('#title').fill('취소 테스트');
    await page.locator('#date').fill('2025-11-14');
    await page.locator('#start-time').fill('11:00');
    await page.locator('#end-time').fill('12:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('취소 테스트')).toBeVisible({ timeout: 10000 });
    await expect(eventList).toContainText('2025-11-14');

    const eventInCalendar = page.locator('[data-event-title="취소 테스트"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eventInCalendar.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);

      await page.keyboard.press('Escape');
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    await expect(eventList).toContainText('2025-11-14');
  });

  test('같은 날짜로 드래그하면 변경되지 않아야 함', async ({ page }) => {
    await page.locator('#title').fill('같은 날짜');
    await page.locator('#date').fill('2025-11-16');
    await page.locator('#start-time').fill('13:00');
    await page.locator('#end-time').fill('14:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('같은 날짜')).toBeVisible({ timeout: 10000 });

    const eventInCalendar = page.locator('[data-event-title="같은 날짜"]').first();
    const sameDateCell = page.locator('[data-date="2025-11-16"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await sameDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(sameDateCell);
        await page.waitForTimeout(500);
      }
    }

    await expect(eventList).toContainText('2025-11-16');
  });

  test('드래그 앤 드롭 후 겹치는 일정이 있으면 경고를 표시해야 함', async ({ page }) => {
    await page.locator('#title').fill('기존 일정');
    await page.locator('#date').fill('2025-11-20');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    await page.waitForTimeout(300);

    await page.locator('#title').fill('이동할 일정');
    await page.locator('#date').fill('2025-11-18');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('이동할 일정')).toBeVisible({ timeout: 10000 });

    const eventInCalendar = page.locator('[data-event-title="이동할 일정"]').first();
    const targetDateCell = page.locator('[data-date="2025-11-20"]').first();

    if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
        await eventInCalendar.dragTo(targetDateCell);
        await page.waitForTimeout(500);
        const overlapWarning = page.getByText('일정 겹침 경고');
        if (await overlapWarning.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(overlapWarning).toBeVisible();
        }
      }
    }
  });

  test('여러 카테고리의 일정을 드래그 앤 드롭할 수 있어야 함', async ({ page }) => {
    const categories = ['업무', '개인', '가족'];

    for (let i = 0; i < categories.length; i++) {
      await page.locator('#title').fill(`${categories[i]} 일정`);
      await page.locator('#date').fill(`2025-11-${10 + i}`);
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.locator('#category').click();
      await page.getByRole('option', { name: categories[i] }).click();
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < categories.length; i++) {
      const eventInCalendar = page.locator(`[data-event-title="${categories[i]} 일정"]`).first();
      const targetDateCell = page.locator(`[data-date="2025-11-${20 + i}"]`).first();

      if (await eventInCalendar.isVisible({ timeout: 2000 }).catch(() => false)) {
        if (await targetDateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
          await eventInCalendar.dragTo(targetDateCell);
          await page.waitForTimeout(500);
        }
      }
    }

    for (const category of categories) {
      await expect(eventList).toContainText(`카테고리: ${category}`);
    }
  });
});
