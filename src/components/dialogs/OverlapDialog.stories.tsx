import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import OverlapDialog from './OverlapDialog';
import { Event } from '../../types';

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '기존 미팅',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '11:30',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 논의',
    date: '2024-11-15',
    startTime: '10:30',
    endTime: '12:00',
    description: '프로젝트 계획 논의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  },
];

const meta: Meta<typeof OverlapDialog> = {
  title: 'Components/Dialogs/OverlapDialog',
  component: OverlapDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 열린 상태
export const Open: Story = {
  args: {
    open: true,
    overlappingEvents: mockOverlappingEvents,
  },
};

// 닫힌 상태
export const Closed: Story = {
  args: {
    open: false,
    overlappingEvents: mockOverlappingEvents,
  },
};

// 단일 겹치는 일정
export const SingleOverlap: Story = {
  args: {
    open: true,
    overlappingEvents: [mockOverlappingEvents[0]],
  },
};

// 여러 겹치는 일정
export const MultipleOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      ...mockOverlappingEvents,
      {
        id: '3',
        title: '점심 약속',
        date: '2024-11-15',
        startTime: '11:00',
        endTime: '12:30',
        description: '팀 점심',
        location: '식당',
        category: '개인',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 30,
      },
    ],
  },
};

// ===== 3. 다이얼로그 시각적 회귀 테스트 =====

// 매우 많은 겹침
export const ManyOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      ...mockOverlappingEvents,
      {
        id: '3',
        title: '점심 약속',
        date: '2024-11-15',
        startTime: '11:00',
        endTime: '12:30',
        description: '팀 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '4',
        title: '추가 미팅',
        date: '2024-11-15',
        startTime: '10:45',
        endTime: '11:15',
        description: '긴급 미팅',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '5',
        title: '또 다른 일정',
        date: '2024-11-15',
        startTime: '11:30',
        endTime: '12:00',
        description: '중요',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

// 긴 제목 겹침
export const LongTitleOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이 일정은 제목이 너무 길어서 UI에서 어떻게 표시되는지 테스트하기 위한 것입니다',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:30',
        description: '긴 제목 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '또 다른 매우 긴 제목의 일정으로 UI 렌더링을 확인합니다',
        date: '2024-11-15',
        startTime: '10:30',
        endTime: '12:00',
        description: '긴 제목 테스트 2',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  },
};

// 반복 일정 겹침
export const RepeatingEventOverlaps: Story = {
  args: {
    open: true,
    overlappingEvents: [
      {
        id: '1',
        title: '매일 운동',
        date: '2024-11-15',
        startTime: '07:00',
        endTime: '08:00',
        description: '조깅',
        location: '공원',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
        notificationTime: 60,
      },
      {
        id: '2',
        title: '아침 미팅',
        date: '2024-11-15',
        startTime: '07:30',
        endTime: '08:30',
        description: '주간 회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 10,
      },
    ],
  },
};
