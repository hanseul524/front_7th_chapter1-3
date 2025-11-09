import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import WeekView from './WeekView';
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
    date: '2024-11-16',
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
];

const meta: Meta<typeof WeekView> = {
  title: 'Components/Calendar/WeekView',
  component: WeekView,
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

// 기본 주간 뷰
export const Default: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {},
  },
};

// 빈 주간 뷰
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

// 주말 포함 주간 뷰
export const WithWeekend: Story = {
  args: {
    currentDate: new Date('2024-11-16'), // 토요일
    filteredEvents: [
      {
        id: '5',
        title: '주말 모임',
        date: '2024-11-16',
        startTime: '14:00',
        endTime: '17:00',
        description: '친구들과',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
      {
        id: '6',
        title: '가족 외식',
        date: '2024-11-17',
        startTime: '18:00',
        endTime: '20:00',
        description: '저녁',
        location: '식당',
        category: '가족',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ],
    notifiedEvents: [],
    holidays: {},
  },
};

// 공휴일이 있는 주
export const WithHolidays: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: mockEvents,
    notifiedEvents: [],
    holidays: {
      '2024-11-15': '광복절',
      '2024-11-17': '일요일',
    },
  },
};

// 하루에 많은 일정
export const BusyDay: Story = {
  args: {
    currentDate: new Date('2024-11-15'),
    filteredEvents: [
      {
        id: '1',
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
        id: '2',
        title: '프로젝트 논의',
        date: '2024-11-15',
        startTime: '10:30',
        endTime: '12:00',
        description: '프로젝트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '점심 약속',
        date: '2024-11-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '4',
        title: '오후 회의',
        date: '2024-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '오후',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '5',
        title: '운동',
        date: '2024-11-15',
        startTime: '18:00',
        endTime: '19:00',
        description: '운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ],
    notifiedEvents: ['1', '3'],
    holidays: {},
  },
};

