import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 기본 일정 관리 워크플로우 E2E 테스트
 * CRUD(Create, Read, Update, Delete) 검증
 */

test.describe('기본 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 로딩 완료 대기
    await page.waitForTimeout(500);
  });

  test('일정 생성 (Create) - 새로운 일정을 추가할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('팀 회의');
    await page.locator('#date').fill('2025-11-20');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.locator('#description').fill('주간 스프린트 회의');
    await page.locator('#location').fill('회의실 A');

    await page.locator('#category').click();
    await page.getByRole('option', { name: '업무' }).click();

    await page.locator('#notification').click();
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.getByTestId('event-submit-button').click();

    // 일정이 목록에 추가되었는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('팀 회의');

    await expect(eventList).toContainText('2025-11-20');
    await expect(eventList).toContainText('14:00');
    await expect(eventList).toContainText('15:00');
    await expect(eventList).toContainText('주간 스프린트 회의');
    await expect(eventList).toContainText('회의실 A');
    await expect(eventList).toContainText('카테고리: 업무');
  });

  test('일정 조회 (Read) - 생성된 일정이 목록에 표시되어야 함', async ({ page }) => {
    await page.locator('#title').fill('점심 약속');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('12:00');
    await page.locator('#end-time').fill('13:00');
    await page.getByTestId('event-submit-button').click();

    // 일정 목록 확인
    const eventList = page.getByTestId('event-list');

    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('2025-11-25')).toBeVisible();
    await expect(eventList.getByText('12:00 - 13:00')).toBeVisible();
  });

  test('일정 수정 (Update) - 기존 일정을 수정할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('원본 일정');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#description').fill('원본 설명');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('원본 일정')).toBeVisible();

    await page.getByRole('button', { name: 'Edit event' }).first().click();

    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    await expect(page.locator('#title')).toHaveValue('원본 일정');

    // 일정 정보 수정
    await page.locator('#title').clear();
    await page.locator('#title').fill('수정된 일정');
    await page.locator('#date').fill('2025-11-11');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:30');
    await page.locator('#description').clear();
    await page.locator('#description').fill('수정된 설명');
    await page.locator('#location').fill('회의실 B');

    await page.getByTestId('event-submit-button').click();

    const updatedEventList = page.getByTestId('event-list');
    await expect(updatedEventList.getByText('수정된 일정')).toBeVisible();
    await expect(updatedEventList.getByText('2025-11-11')).toBeVisible();
    await expect(updatedEventList.getByText('14:00 - 15:30')).toBeVisible();
    await expect(updatedEventList.getByText('수정된 설명')).toBeVisible();
    await expect(updatedEventList.getByText('회의실 B')).toBeVisible();

    await expect(updatedEventList.getByText('원본 일정')).not.toBeVisible();
  });

  test('일정 삭제 (Delete) - 일정을 삭제할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('삭제할 일정');
    await page.locator('#date').fill('2025-11-15');
    await page.locator('#start-time').fill('16:00');
    await page.locator('#end-time').fill('17:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('삭제할 일정')).toBeVisible();

    await page.getByRole('button', { name: 'Delete event' }).first().click();

    await expect(eventList.getByText('삭제할 일정')).not.toBeVisible();
  });

  test('여러 일정을 생성하고 관리할 수 있어야 함', async ({ page }) => {
    const events = [
      {
        title: '아침 미팅',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
        category: '업무',
      },
      {
        title: '점심 약속',
        date: '2025-11-20',
        startTime: '12:00',
        endTime: '13:00',
        category: '개인',
      },
      {
        title: '저녁 운동',
        date: '2025-11-20',
        startTime: '19:00',
        endTime: '20:00',
        category: '개인',
      },
    ];

    const eventList = page.getByTestId('event-list');

    for (const event of events) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill(event.date);
      await page.locator('#start-time').fill(event.startTime);
      await page.locator('#end-time').fill(event.endTime);
      await page.locator('#category').click();
      await page.getByRole('option', { name: event.category }).click();
      await page.getByTestId('event-submit-button').click();

      await expect(eventList.getByText(event.title)).toBeVisible();
    }

    await expect(eventList.getByText('아침 미팅')).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toBeVisible();
    await expect(eventList.getByText('저녁 운동')).toBeVisible();
  });

  test('필수 입력값 없이 일정을 추가할 수 없어야 함', async ({ page }) => {
    // 제목만 입력하고 제출
    await page.locator('#title').fill('불완전한 일정');
    await page.getByTestId('event-submit-button').click();

    // 알림이 나타나는지 확인
    await expect(page.getByText('필수 정보를 모두 입력해주세요.')).toBeVisible();
  });

  test('시간 유효성 검증 - 종료 시간이 시작 시간보다 빨라야 함', async ({ page }) => {
    await page.locator('#title').fill('시간 오류 테스트');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('14:00'); // 시작 시간보다 이른 종료 시간

    await page.getByTestId('event-submit-button').click();

    // 에러 메시지 또는 제출 실패
    await expect(page.getByText('시간 설정을 확인해주세요.')).toBeVisible();
  });

  test('카테고리별로 일정을 생성할 수 있어야 함', async ({ page }) => {
    const categories = ['업무', '개인', '가족', '기타'];
    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      await page.locator('#title').fill(`${category} 일정`);
      await page.locator('#date').fill('2025-11-28');
      await page.locator('#start-time').fill(`${10 + i}:00`);
      await page.locator('#end-time').fill(`${11 + i}:00`);

      await page.locator('#category').click();
      await page.getByRole('option', { name: category }).click();

      await page.getByTestId('event-submit-button').click();

      // toContainText로 더 유연하게 확인
      await expect(eventList).toContainText(`${category} 일정`, { timeout: 10000 });
    }

    // 최종 확인: 모든 카테고리가 있는지
    for (const category of categories) {
      await expect(eventList).toContainText(`카테고리: ${category}`);
    }
  });

  test('알림 시간을 다양하게 설정할 수 있어야 함', async ({ page }) => {
    const notificationOptions = [
      { label: '1분 전', value: '1분 전' },
      { label: '10분 전', value: '10분 전' },
      { label: '1시간 전', value: '1시간 전' },
      { label: '2시간 전', value: '2시간 전' },
      { label: '1일 전', value: '1일 전' },
    ];

    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < notificationOptions.length; i++) {
      const option = notificationOptions[i];

      await page.locator('#title').fill(`알림 테스트 ${i + 1}`);
      await page.locator('#date').fill('2025-11-30');
      await page.locator('#start-time').fill(`${10 + i}:00`);
      await page.locator('#end-time').fill(`${11 + i}:00`);

      await page.locator('#notification').click();
      await page.getByRole('option', { name: option.label }).click();

      await page.getByTestId('event-submit-button').click();

      await expect(eventList.getByText(`알림 테스트 ${i + 1}`)).toBeVisible();
      await expect(eventList.getByText(`알림: ${option.value}`)).toBeVisible();
    }
  });

  test('일정 수정 중 취소하면 원래 값이 유지되어야 함', async ({ page }) => {
    await page.locator('#title').fill('원본 제목');
    await page.locator('#date').fill('2025-11-05');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('원본 제목')).toBeVisible();

    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 값을 변경하지만 저장하지 않음
    await page.locator('#title').clear();
    await page.locator('#title').fill('변경된 제목');

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const reloadedEventList = page.getByTestId('event-list');
    await expect(reloadedEventList.getByText('원본 제목')).toBeVisible();
    await expect(reloadedEventList.getByText('변경된 제목')).not.toBeVisible();
  });
});
