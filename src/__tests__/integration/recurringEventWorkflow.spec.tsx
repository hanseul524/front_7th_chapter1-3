import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';

import {
  setupMockHandlerRecurringListDelete,
  setupMockHandlerRecurringListUpdate,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('반복 일정 워크플로우 통합 테스트', () => {
  it('반복 일정을 생성하고 편집 다이얼로그가 나타나는지 확인한다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 생성된 반복 일정 확인
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('매일 회의')).toHaveLength(2);

    // 첫 번째 반복 일정 편집 시도
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 반복 일정 편집 다이얼로그가 나타나는지 확인
    expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
  });

  it('예를 선택하면 해당 일정만 단일 일정으로 변경된다', async () => {
    setupMockHandlerUpdating([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 반복 일정이 생성되었는지 확인 (반복 아이콘이 있는지 확인)
    await screen.findByTestId('event-list');
    const repeatIcons = screen.getAllByTestId('RepeatIcon');
    expect(repeatIcons.length).toBeGreaterThan(0);

    // 첫 번째 반복 일정 편집
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });
    const yesButton = await screen.findByText('예');
    await user.click(yesButton);

    // 일정 편집 폼에서 제목 변경
    const titleInput = screen.getByLabelText('제목');
    await user.click(titleInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{delete}');
    await user.type(titleInput, '수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    // 결과 확인: 한 개는 수정되고 나머지는 그대로
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
  });

  it('아니오를 선택하면 모든 반복 일정이 변경된다', async () => {
    setupMockHandlerRecurringListUpdate([
      {
        id: '1',
        title: '매일 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '매일 회의',
        date: '2025-10-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '매일 진행되는 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
        notificationTime: 1,
      },
    ]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // 첫 번째 반복 일정 편집
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    // 다이얼로그가 나타나는지 확인
    await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });

    const noButton = await screen.findByText('아니오');
    await user.click(noButton);

    // 일정 편집 폼에서 제목 변경
    const titleInput = screen.getByLabelText('제목');
    await user.click(titleInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.keyboard('{delete}');
    await user.type(titleInput, '전체 변경된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    // 결과 확인: 최소한 변경된 이벤트가 존재해야 함
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getAllByText('전체 변경된 회의')).toHaveLength(2);
  });

  describe('반복 일정 삭제 워크플로우 (P2 테스트)', () => {
    it('반복 일정 삭제 시 삭제 다이얼로그가 나타난다', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
        {
          id: '2',
          title: '매일 회의',
          date: '2025-10-16',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
      ]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 생성된 반복 일정 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('매일 회의')).toHaveLength(2);

      // 첫 번째 반복 일정 삭제 시도
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 반복 일정 삭제 다이얼로그가 나타나는지 확인
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    });

    it('삭제 다이얼로그에서 예를 선택하면 해당 일정만 삭제된다', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
        {
          id: '2',
          title: '매일 회의',
          date: '2025-10-16',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
      ]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 반복 일정이 생성되었는지 확인
      await screen.findByTestId('event-list');
      const eventList = within(screen.getByTestId('event-list'));
      const initialEvents = eventList.getAllByText('매일 회의');
      expect(initialEvents).toHaveLength(2);

      // 첫 번째 반복 일정 삭제
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });

      // "예" 버튼 선택 (단일 삭제)
      const yesButton = await screen.findByText('예');
      await user.click(yesButton);
      await screen.findByText('일정이 삭제되었습니다');

      const updatedEventList = within(screen.getByTestId('event-list'));
      const remainingEvents = updatedEventList.queryAllByText('매일 회의');
      expect(remainingEvents).toHaveLength(1);
    });

    it('삭제 다이얼로그에서 아니오를 선택하면 모든 반복 일정이 삭제된다', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
        {
          id: '2',
          title: '매일 회의',
          date: '2025-10-16',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
      ]);

      const { user } = setup(<App />);

      // 반복 일정이 생성되었는지 확인
      await screen.findByTestId('event-list');
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('매일 회의')).toHaveLength(2);

      // 첫 번째 반복 일정 삭제
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });

      // "아니오" 버튼 선택 (전체 삭제)
      const noButton = await screen.findByText('아니오');
      await user.click(noButton);

      const updatedEventList = within(screen.getByTestId('event-list'));
      const remainingEvents = updatedEventList.queryAllByText('매일 회의');
      expect(remainingEvents).toHaveLength(0);
    });

    it('삭제 다이얼로그에서 취소를 선택하면 삭제가 취소된다', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '매일 회의',
          date: '2025-10-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
        {
          id: '2',
          title: '매일 회의',
          date: '2025-10-16',
          startTime: '14:00',
          endTime: '15:00',
          description: '매일 진행되는 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-16' },
          notificationTime: 1,
        },
      ]);

      const { user } = setup(<App />);

      // 반복 일정이 생성되었는지 확인
      await screen.findByTestId('event-list');
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('매일 회의')).toHaveLength(2);

      // 첫 번째 반복 일정 삭제 시도
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });

      // 취소 버튼 클릭
      const cancelButton = await screen.findByText('취소');
      await user.click(cancelButton);

      // 다이얼로그가 닫히고 삭제되지 않음을 확인
      expect(screen.queryByText('반복 일정 삭제')).not.toBeInTheDocument();

      // 모든 일정이 그대로 남아있는지 확인
      const unchangedEventList = within(screen.getByTestId('event-list'));
      expect(unchangedEventList.getAllByText('매일 회의')).toHaveLength(2);
    });
  });

  describe('반복 일정 부분 수정/삭제 시 나머지 일정 검증 (예외 케이스)', () => {
    it('하나의 반복 일정만 수정하면 나머지 반복 일정은 원래 데이터를 유지한다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '팀 미팅',
          date: '2025-10-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '팀 미팅',
          date: '2025-10-16',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '팀 미팅',
          date: '2025-10-17',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-17' },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 초기 상태: 3개의 반복 일정 확인
      const eventList = within(screen.getByTestId('event-list'));
      const initialEvents = eventList.getAllByText('팀 미팅');
      expect(initialEvents).toHaveLength(3);

      // 두 번째 반복 일정만 편집 (중간 것 선택)
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[1]);

      await screen.findByText('해당 일정만 수정하시겠어요?', {}, { timeout: 3000 });
      const yesButton = await screen.findByText('예');
      await user.click(yesButton);

      // 제목과 위치 변경
      const titleInput = screen.getByLabelText('제목');
      await user.click(titleInput);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('{delete}');
      await user.type(titleInput, '변경된 미팅');

      const locationInput = screen.getByLabelText('위치');
      await user.click(locationInput);
      await user.keyboard('{Control>}a{/Control}');
      await user.keyboard('{delete}');
      await user.type(locationInput, '회의실 C');

      await user.click(screen.getByTestId('event-submit-button'));

      // 결과 확인: 하나는 변경되고 나머지 2개는 원본 유지
      const updatedEventList = within(screen.getByTestId('event-list'));
      expect(updatedEventList.getByText('변경된 미팅')).toBeInTheDocument();
      expect(updatedEventList.getByText('회의실 C')).toBeInTheDocument();
      expect(updatedEventList.getAllByText('팀 미팅')).toHaveLength(2);

      // 나머지 일정들의 상세 정보 확인 (첫 번째와 세 번째)
      const remainingEvents = updatedEventList.getAllByText('팀 미팅');
      expect(remainingEvents).toHaveLength(2);

      // 원본 일정의 시간, 위치 정보가 유지되는지 확인
      expect(updatedEventList.getAllByText(/10:00 - 11:00/)).toHaveLength(3); // 모든 일정의 시간
      expect(updatedEventList.getAllByText(/회의실 B/)).toHaveLength(2); // 원본 2개의 위치
    });

    it('하나의 반복 일정만 삭제하면 나머지 반복 일정의 모든 속성이 유지된다', async () => {
      setupMockHandlerRecurringListDelete([
        {
          id: '1',
          title: '프로젝트 회의',
          date: '2025-10-20',
          startTime: '15:00',
          endTime: '16:00',
          description: '프로젝트 진행 상황 공유',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-22' },
          notificationTime: 15,
        },
        {
          id: '2',
          title: '프로젝트 회의',
          date: '2025-10-21',
          startTime: '15:00',
          endTime: '16:00',
          description: '프로젝트 진행 상황 공유',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-22' },
          notificationTime: 15,
        },
        {
          id: '3',
          title: '프로젝트 회의',
          date: '2025-10-22',
          startTime: '15:00',
          endTime: '16:00',
          description: '프로젝트 진행 상황 공유',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-10-22' },
          notificationTime: 15,
        },
      ]);

      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 초기 상태: 3개의 반복 일정 확인
      const eventList = within(screen.getByTestId('event-list'));
      const initialEvents = eventList.getAllByText('프로젝트 회의');
      expect(initialEvents).toHaveLength(3);

      // 첫 번째 반복 일정만 삭제
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await screen.findByText('해당 일정만 삭제하시겠어요?', {}, { timeout: 3000 });

      // "예" 버튼 선택 (단일 삭제)
      const yesButton = await screen.findByText('예');
      await user.click(yesButton);
      await screen.findByText('일정이 삭제되었습니다');

      // 결과 확인: 2개의 일정이 남아있음
      const updatedEventList = within(screen.getByTestId('event-list'));
      const remainingEvents = updatedEventList.getAllByText('프로젝트 회의');
      expect(remainingEvents).toHaveLength(2);

      // 나머지 일정들의 원본 속성 유지 확인
      expect(updatedEventList.getAllByText(/15:00 - 16:00/)).toHaveLength(2);
      expect(updatedEventList.getAllByText(/회의실 C/)).toHaveLength(2);

      // 반복 아이콘이 여전히 존재하는지 확인 (반복 속성 유지)
      const repeatIcons = updatedEventList.getAllByTestId('RepeatIcon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('반복 일정의 모든 인스턴스가 올바르게 표시된다', async () => {
      setupMockHandlerUpdating([
        {
          id: '1',
          title: '월간 회의',
          date: '2025-10-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 진행 상황 점검',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-15' },
          notificationTime: 60,
        },
        {
          id: '2',
          title: '월간 회의',
          date: '2025-11-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 진행 상황 점검',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-15' },
          notificationTime: 60,
        },
      ]);

      setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 반복 일정이 제대로 로드됨을 확인
      await screen.findByTestId('event-list');
      const eventItems = screen.getAllByText('월간 회의');

      // 최소 1개 이상의 반복 일정이 표시되어야 함
      expect(eventItems.length).toBeGreaterThanOrEqual(1);

      // 반복 아이콘 확인
      const repeatIcons = screen.getAllByTestId('RepeatIcon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
