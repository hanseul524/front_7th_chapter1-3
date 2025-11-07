import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import EventListPanel from './EventListPanel';
import { Event } from '../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 미팅',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
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
    title: '점심 약속',
    date: '2024-11-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 60,
  },
  {
    id: '3',
    title: '매일 운동',
    date: '2024-11-15',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장 운동',
    location: '헬스장',
    category: '개인',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 120,
  },
  {
    id: '4',
    title: '주간 회의',
    date: '2024-11-18',
    startTime: '14:00',
    endTime: '15:00',
    description: '매주 월요일 회의',
    location: '회의실 B',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-12-31',
    },
    notificationTime: 10,
  },
];

const meta: Meta<typeof EventListPanel> = {
  title: 'Components/EventListPanel',
  component: EventListPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSearchChange: fn(),
    onEditEvent: fn(),
    onDeleteEvent: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태
export const Default: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents,
    notifiedEvents: [],
  },
};

// 검색어 입력 상태
export const WithSearchTerm: Story = {
  args: {
    searchTerm: '미팅',
    filteredEvents: mockEvents.filter((event) => event.title.includes('미팅')),
    notifiedEvents: [],
  },
};

// 알림이 있는 이벤트
export const WithNotifications: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents,
    notifiedEvents: ['1', '3'],
  },
};

// 검색 결과 없음
export const NoResults: Story = {
  args: {
    searchTerm: '존재하지 않는 일정',
    filteredEvents: [],
    notifiedEvents: [],
  },
};

// 빈 목록
export const Empty: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [],
    notifiedEvents: [],
  },
};

// 반복 일정만
export const OnlyRepeatingEvents: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents.filter((event) => event.repeat.type !== 'none'),
    notifiedEvents: [],
  },
};
