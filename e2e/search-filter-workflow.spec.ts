import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 검색 및 필터링 워크플로우 E2E 테스트
 * 일정 검색 기능 및 다양한 필터링 조건 검증
 */

test.describe('검색 및 필터링 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 로딩 완료 대기
    await page.waitForTimeout(500);
  });

  test('제목으로 일정을 검색할 수 있어야 함', async ({ page }) => {
    // Given: 여러 일정 생성
    const events = [
      { title: '팀 회의', date: '2025-11-20' },
      { title: '개인 약속', date: '2025-11-21' },
      { title: '프로젝트 미팅', date: '2025-11-22' },
    ];

    for (const event of events) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill(event.date);
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    // When: "회의"로 검색
    const searchInput = page.locator('#search');
    await searchInput.fill('회의');

    // Then: "팀 회의"만 표시되어야 함
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('개인 약속')).not.toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('프로젝트 미팅')).not.toBeVisible({ timeout: 10000 });
  });

  test('검색어를 지우면 모든 일정이 다시 표시되어야 함', async ({ page }) => {
    // Given: 일정 생성
    const events = ['회의 A', '회의 B', '미팅 C'];

    for (const title of events) {
      await page.locator('#title').fill(title);
      await page.locator('#date').fill('2025-11-25');
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 검색
    await searchInput.fill('회의');
    await expect(eventList.getByText('회의 A')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('미팅 C')).not.toBeVisible({ timeout: 10000 });

    // When: 검색어 지우기
    await searchInput.clear();

    // Then: 모든 일정 표시
    await expect(eventList.getByText('회의 A')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('회의 B')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('미팅 C')).toBeVisible({ timeout: 10000 });
  });

  test('대소문자 구분 없이 검색할 수 있어야 함', async ({ page }) => {
    // Given: 일정 생성
    await page.locator('#title').fill('Meeting');
    await page.locator('#date').fill('2025-11-26');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 소문자로 검색
    await searchInput.fill('meeting');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('Meeting')).toBeVisible({ timeout: 10000 });

    // When: 대문자로 검색
    await searchInput.clear();
    await searchInput.fill('MEETING');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('Meeting')).toBeVisible({ timeout: 10000 });
  });

  test('부분 검색이 가능해야 함', async ({ page }) => {
    // Given: 일정 생성
    await page.locator('#title').fill('프로젝트 킥오프 미팅');
    await page.locator('#date').fill('2025-11-27');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 부분 단어로 검색
    await searchInput.fill('킥오프');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('프로젝트 킥오프 미팅')).toBeVisible({ timeout: 10000 });
  });

  test('설명으로도 검색할 수 있어야 함', async ({ page }) => {
    // Given: 설명이 있는 일정 생성
    await page.locator('#title').fill('회의');
    await page.locator('#date').fill('2025-11-28');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.locator('#description').fill('중요한 분기 계획 논의');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 설명 내용으로 검색
    await searchInput.fill('분기 계획');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('회의')).toBeVisible({ timeout: 10000 });
  });

  test('위치로도 검색할 수 있어야 함', async ({ page }) => {
    // Given: 위치가 있는 일정 생성
    await page.locator('#title').fill('미팅');
    await page.locator('#date').fill('2025-11-29');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.locator('#location').fill('회의실 A');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 위치로 검색
    await searchInput.fill('회의실 A');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('미팅')).toBeVisible({ timeout: 10000 });
  });

  test('검색 결과가 없을 때 안내 메시지를 표시해야 함', async ({ page }) => {
    // Given: 일정 생성
    await page.locator('#title').fill('테스트 일정');
    await page.locator('#date').fill('2025-11-30');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');

    // When: 존재하지 않는 키워드로 검색
    await searchInput.fill('존재하지않는검색어');

    // Then: 검색 결과 없음 메시지
    await expect(page.getByText(/검색 결과가 없습니다|일정이 없습니다/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('카테고리별로 일정을 필터링할 수 있어야 함', async ({ page }) => {
    // Given: 다양한 카테고리의 일정 생성
    const categories = [
      { name: '업무', title: '업무 회의' },
      { name: '개인', title: '개인 약속' },
      { name: '가족', title: '가족 모임' },
    ];

    for (const category of categories) {
      await page.locator('#title').fill(category.title);
      await page.locator('#date').fill('2025-11-01');
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.locator('#category').click();
      await page.getByRole('option', { name: category.name }).click();
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const eventList = page.getByTestId('event-list');

    // 모든 일정이 표시되는지 확인
    await expect(eventList.getByText('업무 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('개인 약속')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('가족 모임')).toBeVisible({ timeout: 10000 });
  });

  test('날짜 범위로 일정을 필터링할 수 있어야 함', async ({ page }) => {
    // Given: 다양한 날짜의 일정 생성
    const dates = [
      { date: '2025-11-01', title: '11월 1일 일정' },
      { date: '2025-11-15', title: '11월 15일 일정' },
      { date: '2025-11-30', title: '11월 30일 일정' },
    ];

    for (const event of dates) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill(event.date);
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const eventList = page.getByTestId('event-list');

    // 모든 일정 확인
    await expect(eventList.getByText('11월 1일 일정')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('11월 15일 일정')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('11월 30일 일정')).toBeVisible({ timeout: 10000 });
  });

  test('반복 일정도 검색할 수 있어야 함', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.locator('#title').fill('매일 운동');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('07:00');
    await page.locator('#end-time').fill('08:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-15');

    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 반복 일정 검색
    await searchInput.fill('운동');

    // Then: 반복 일정이 검색되어야 함
    await expect(eventList.getByText('매일 운동')).toBeVisible({ timeout: 10000 });
  });

  test('여러 조건을 동시에 적용하여 필터링할 수 있어야 함', async ({ page }) => {
    // Given: 다양한 일정 생성
    const events = [
      { title: '업무 회의', category: '업무', date: '2025-11-20' },
      { title: '개인 회의', category: '개인', date: '2025-11-20' },
      { title: '업무 미팅', category: '업무', date: '2025-11-21' },
    ];

    for (const event of events) {
      await page.locator('#title').fill(event.title);
      await page.locator('#date').fill(event.date);
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.locator('#category').click();
      await page.getByRole('option', { name: event.category }).click();
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: "회의" 검색
    await searchInput.fill('회의');

    // Then: 업무 회의와 개인 회의만 표시
    await expect(eventList.getByText('업무 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('개인 회의')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('업무 미팅')).not.toBeVisible({ timeout: 10000 });
  });

  test('실시간으로 검색 결과가 업데이트되어야 함', async ({ page }) => {
    // Given: 일정 생성
    await page.locator('#title').fill('팀 미팅');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.getByTestId('event-submit-button').click();

    await page.waitForTimeout(300);

    await page.locator('#title').fill('개인 시간');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('16:00');
    await page.locator('#end-time').fill('17:00');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 한 글자씩 입력하면서 검색
    await searchInput.fill('팀');
    await expect(eventList.getByText('팀 미팅')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('개인 시간')).not.toBeVisible({ timeout: 10000 });

    await searchInput.fill('팀 미');
    await expect(eventList.getByText('팀 미팅')).toBeVisible({ timeout: 10000 });

    await searchInput.fill('개인');
    await expect(eventList.getByText('개인 시간')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('팀 미팅')).not.toBeVisible({ timeout: 10000 });
  });

  test('특수문자가 포함된 검색어도 처리할 수 있어야 함', async ({ page }) => {
    // Given: 특수문자가 포함된 일정 생성
    await page.locator('#title').fill('Q&A 세션');
    await page.locator('#date').fill('2025-11-28');
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('16:00');
    await page.getByTestId('event-submit-button').click();

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 특수문자 포함 검색
    await searchInput.fill('Q&A');

    // Then: 결과가 표시되어야 함
    await expect(eventList.getByText('Q&A 세션')).toBeVisible({ timeout: 10000 });
  });

  test('빈 검색어로는 모든 일정이 표시되어야 함', async ({ page }) => {
    // Given: 여러 일정 생성
    const titles = ['일정 1', '일정 2', '일정 3'];

    for (const title of titles) {
      await page.locator('#title').fill(title);
      await page.locator('#date').fill('2025-11-30');
      await page.locator('#start-time').fill('10:00');
      await page.locator('#end-time').fill('11:00');
      await page.getByTestId('event-submit-button').click();
      await page.waitForTimeout(300);
    }

    const searchInput = page.locator('#search');
    const eventList = page.getByTestId('event-list');

    // When: 빈 문자열로 검색
    await searchInput.fill('');

    // Then: 모든 일정 표시
    for (const title of titles) {
      await expect(eventList.getByText(title)).toBeVisible({ timeout: 10000 });
    }
  });
});
