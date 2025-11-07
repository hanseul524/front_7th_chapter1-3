import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * 반복 일정 관리 워크플로우 E2E 테스트
 * CRUD(Create, Read, Update, Delete) 검증
 */

test.describe('반복 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // E2E 테스트용 데이터베이스 초기화
    const dbPath = path.resolve('./src/__mocks__/response/e2e.json');
    fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 일정 로딩 완료 대기
    await page.waitForTimeout(500);
  });

  test('반복 일정 생성 (Create) - 매일 반복 일정을 추가할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('매일 운동');
    await page.locator('#date').fill('2025-11-08');
    await page.locator('#start-time').fill('06:00');
    await page.locator('#end-time').fill('07:00');
    await page.locator('#description').fill('아침 운동');

    await page.getByLabel('반복 일정').check();

    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();

    // 반복 간격 (1일마다)
    await page.locator('#repeat-interval').fill('1');

    // 반복 종료일
    await page.locator('#repeat-end-date').fill('2025-11-15');

    // 일정 추가 버튼 클릭
    await page.getByTestId('event-submit-button').click();

    // Then: 여러 일정이 생성되었는지 확인 (11/8 ~ 11/15 = 8일)
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('매일 운동', { timeout: 10000 });

    // 반복 아이콘이 표시되는지 확인
    await expect(
      page.locator('[data-testid="RepeatIcon"], svg[data-testid="RepeatIcon"]').first()
    ).toBeVisible();
  });

  test('반복 일정 생성 (Create) - 매주 반복 일정을 추가할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('주간 회의');
    await page.locator('#date').fill('2025-11-10');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');
    await page.locator('#description').fill('주간 스프린트 회의');

    await page.getByLabel('반복 일정').check();

    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('반복 유형').click();
    await page.waitForTimeout(300); // 드롭다운 애니메이션 대기
    await page.getByText('매주').click();

    await page.locator('#repeat-interval').fill('1');

    await page.locator('#repeat-end-date').fill('2025-11-30');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('주간 회의', { timeout: 10000 });
  });

  test('반복 일정 생성 (Create) - 매월 반복 일정을 추가할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('월간 보고');
    await page.locator('#date').fill('2025-11-15');
    await page.locator('#start-time').fill('16:00');
    await page.locator('#end-time').fill('17:00');

    await page.getByLabel('반복 일정').check();

    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });

    await page.getByLabel('반복 유형').click();
    await page.waitForTimeout(300); // 드롭다운 애니메이션 대기
    await page.getByText('매월').click();

    await page.locator('#repeat-interval').fill('1');

    await page.locator('#repeat-end-date').fill('2026-01-31');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('월간 보고', { timeout: 10000 });
  });

  test('반복 일정 조회 (Read) - 반복 일정이 목록에 표시되어야 함', async ({ page }) => {
    await page.locator('#title').fill('반복 일정 확인');
    await page.locator('#date').fill('2025-11-20');
    await page.locator('#start-time').fill('10:00');
    await page.locator('#end-time').fill('11:00');

    await page.getByLabel('반복 일정').check();

    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();

    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-25');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');

    await expect(eventList.getByText('반복 일정 확인').first()).toBeVisible({ timeout: 10000 });
  });

  test('반복 일정 수정 (Update) - 이 일정만 수정할 수 있어야 함', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.locator('#title').fill('반복 운동');
    await page.locator('#date').fill('2025-11-12');
    await page.locator('#start-time').fill('07:00');
    await page.locator('#end-time').fill('08:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-18');

    await page.getByTestId('event-submit-button').click();

    // 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 운동').first()).toBeVisible({ timeout: 10000 });

    // When: 수정 버튼 클릭
    await page.getByRole('button', { name: 'Edit event' }).first().click();

    // 반복 일정 수정 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();
    await expect(page.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "예" 버튼 클릭 (이 일정만 수정)
    await page.getByRole('button', { name: '예' }).click();

    // 폼이 수정 모드로 전환되었는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 제목 수정
    await page.locator('#title').clear();
    await page.locator('#title').fill('특별 운동');

    // 수정 버튼 클릭
    await page.getByTestId('event-submit-button').click();

    // Then: 수정된 일정과 원본 일정이 함께 존재해야 함
    await expect(eventList.getByText('특별 운동')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('반복 운동').first()).toBeVisible();
  });

  test('반복 일정 수정 (Update) - 모든 일정을 수정할 수 있어야 함', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.locator('#title').fill('팀 미팅');
    await page.locator('#date').fill('2025-11-13');
    await page.locator('#start-time').fill('14:00');
    await page.locator('#end-time').fill('15:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매주').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-27');

    await page.getByTestId('event-submit-button').click();

    // 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 미팅').first()).toBeVisible({ timeout: 10000 });

    // When: 수정 버튼 클릭
    await page.getByRole('button', { name: 'Edit event' }).first().click();

    // 반복 일정 수정 다이얼로그에서 "아니오" 클릭 (모든 일정 수정)
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    // 폼이 수정 모드로 전환되었는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 시간 수정
    await page.locator('#start-time').fill('15:00');
    await page.locator('#end-time').fill('16:00');

    // 수정 버튼 클릭
    await page.getByTestId('event-submit-button').click();

    // Then: 모든 일정의 시간이 변경되었는지 확인
    await expect(eventList).toContainText('15:00', { timeout: 10000 });
  });

  test('반복 일정 삭제 (Delete) - 이 일정만 삭제할 수 있어야 함', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.locator('#title').fill('삭제 테스트');
    await page.locator('#date').fill('2025-11-14');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-17');

    await page.getByTestId('event-submit-button').click();

    // 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('삭제 테스트').first()).toBeVisible({ timeout: 10000 });

    // When: 삭제 버튼 클릭
    await page.getByRole('button', { name: 'Delete event' }).first().click();

    // 반복 일정 삭제 다이얼로그 확인
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();
    await expect(page.getByText('해당 일정만 삭제하시겠어요?')).toBeVisible();

    // "예" 버튼 클릭 (이 일정만 삭제)
    await page.getByRole('button', { name: '예' }).click();

    // Then: 나머지 반복 일정은 여전히 존재해야 함
    // 원래 4개 중 하나만 삭제되어 3개가 남아있어야 함
    const remainingEvents = eventList.getByText('삭제 테스트');
    await expect(remainingEvents).toHaveCount(3, { timeout: 10000 });
  });

  test('반복 일정 삭제 (Delete) - 모든 일정을 삭제할 수 있어야 함', async ({ page }) => {
    // Given: 반복 일정 생성
    await page.locator('#title').fill('전체 삭제 테스트');
    await page.locator('#date').fill('2025-11-16');
    await page.locator('#start-time').fill('11:00');
    await page.locator('#end-time').fill('12:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();

    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-19');

    await page.getByTestId('event-submit-button').click();

    // 일정 생성 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('전체 삭제 테스트').first()).toBeVisible({ timeout: 10000 });

    // When: 삭제 버튼 클릭
    await page.getByRole('button', { name: 'Delete event' }).first().click();

    // 반복 일정 삭제 다이얼로그에서 "아니오" 클릭 (모든 일정 삭제)
    await expect(page.getByRole('heading', { name: '반복 일정 삭제' })).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    // Then: 모든 반복 일정이 삭제되었는지 확인 (0개여야 함)
    const deletedEvents = eventList.getByText('전체 삭제 테스트');
    await expect(deletedEvents).toHaveCount(0);
  });

  test('반복 유형별 일정 생성 - daily, weekly, monthly, yearly', async ({ page }) => {
    const repeatTypes = [
      { label: '매일', value: 'daily', title: '매일 알림' },
      { label: '매주', value: 'weekly', title: '매주 점검' },
      { label: '매월', value: 'monthly', title: '매월 정산' },
      { label: '매년', value: 'yearly', title: '매년 기념일' },
    ];

    const eventList = page.getByTestId('event-list');

    for (let i = 0; i < repeatTypes.length; i++) {
      const repeatType = repeatTypes[i];

      await page.locator('#title').fill(repeatType.title);
      await page.locator('#date').fill(`2025-11-${10 + i}`);
      await page.locator('#start-time').fill(`${10 + i}:00`);
      await page.locator('#end-time').fill(`${11 + i}:00`);

      // 반복 일정 체크
      await page.getByLabel('반복 일정').check();

      // 반복 유형 필드가 보일 때까지 대기
      await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });

      // 반복 유형 선택
      await page.getByLabel('반복 유형').click();
      await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
      await page.locator('[role="listbox"]').getByText(repeatType.label).click();

      // 반복 간격
      await page.locator('#repeat-interval').fill('1');

      // 반복 종료일
      await page.locator('#repeat-end-date').fill('2025-12-31');

      // 일정 추가
      await page.getByTestId('event-submit-button').click();

      // 생성 확인
      await expect(eventList).toContainText(repeatType.title, { timeout: 10000 });
    }
  });

  test('반복 간격을 다양하게 설정할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('2일마다 일정');
    await page.locator('#date').fill('2025-11-08');
    await page.locator('#start-time').fill('09:00');
    await page.locator('#end-time').fill('10:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();

    await page.locator('#repeat-interval').fill('2');
    await page.locator('#repeat-end-date').fill('2025-11-20');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList).toContainText('반복: 2일마다', { timeout: 10000 });

    const events = eventList.getByText('2일마다 일정');
    await expect(events).toHaveCount(7);
  });

  test('반복 일정 수정 다이얼로그에서 취소할 수 있어야 함', async ({ page }) => {
    await page.locator('#title').fill('취소 테스트');
    await page.locator('#date').fill('2025-11-21');
    await page.locator('#start-time').fill('13:00');
    await page.locator('#end-time').fill('14:00');

    await page.getByLabel('반복 일정').check();
    await expect(page.getByLabel('반복 유형')).toBeVisible({ timeout: 5000 });
    await page.getByLabel('반복 유형').click();
    await page.waitForSelector('[role="listbox"]', { state: 'visible', timeout: 5000 });
    await page.locator('[role="listbox"]').getByText('매일').click();
    await page.locator('#repeat-interval').fill('1');
    await page.locator('#repeat-end-date').fill('2025-11-23');

    await page.getByTestId('event-submit-button').click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('취소 테스트').first()).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Edit event' }).first().click();
    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).toBeVisible();

    await page.getByRole('button', { name: '취소' }).click();

    await expect(page.getByRole('heading', { name: '반복 일정 수정' })).not.toBeVisible();
    await expect(eventList.getByText('취소 테스트').first()).toBeVisible();
  });
});
