import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import MonthView from './MonthView';
import { Event } from '../../types';

// Mock 일정 데이터
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
    repeat: { type: 'none', interval: 0 },
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
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '3',
    title: '매일 운동',
    date: '2024-11-15',
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
    notificationTime: 120,
  },
  {
    id: '4',
    title: '주간 회의',
    date: '2024-11-18',
    startTime: '14:00',
    endTime: '15:00',
    description: '매주 월요일',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '가족 모임',
    date: '2024-11-20',
    startTime: '18:00',
    endTime: '21:00',
    description: '저녁 식사',
    location: '집',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

const meta: Meta<typeof MonthView> = {
  title: 'Components/Calendar/MonthView',
  component: MonthView,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      delay: 300,
      pauseAnimationAtEnd: true,
    },
  },
  tags: ['autodocs'],
  args: {
    onDragEnd: fn(),
    onDragMove: fn(),
    onClickEvent: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 월간 뷰
export const Default: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {
      '2024-11-15': '광복절',
    },
  },
};

// 빈 캘린더
export const Empty: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: [],
    notifiedEvents: [],
    holidays: {},
  },
};

// 알림이 있는 일정
export const WithNotifications: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents,
    notifiedEvents: ['1', '3'],
    holidays: {},
  },
};

// 반복 일정만
export const OnlyRepeatingEvents: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents.filter((e) => e.repeat.type !== 'none'),
    notifiedEvents: [],
    holidays: {},
  },
};

// 공휴일이 많은 달
export const WithManyHolidays: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {
      '2024-11-01': '개천절',
      '2024-11-09': '한글날',
      '2024-11-15': '광복절',
      '2024-11-25': '크리스마스',
    },
  },
};

// 일정이 많은 날
export const BusyDay: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: [
      ...mockEvents,
      {
        id: '6',
        title: '아침 미팅',
        date: '2024-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '아침',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '7',
        title: '오후 미팅',
        date: '2024-11-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '오후',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '8',
        title: '저녁 약속',
        date: '2024-11-15',
        startTime: '19:00',
        endTime: '20:00',
        description: '저녁',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ],
    notifiedEvents: [],
    holidays: {},
  },
};
