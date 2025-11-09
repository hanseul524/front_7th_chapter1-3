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

// ===== 2. 일정 상태별 시각적 표현 =====

// 카테고리별 일정
export const CategoryBusiness: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents.filter((event) => event.category === '업무'),
    notifiedEvents: [],
  },
};

export const CategoryPersonal: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents.filter((event) => event.category === '개인'),
    notifiedEvents: [],
  },
};

export const MixedCategories: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      ...mockEvents,
      {
        id: '5',
        title: '가족 모임',
        date: '2024-11-15',
        startTime: '18:00',
        endTime: '21:00',
        description: '저녁 식사',
        location: '집',
        category: '가족',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
      {
        id: '6',
        title: '기타 일정',
        date: '2024-11-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '기타',
        location: '어딘가',
        category: '기타',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

// 반복 타입별
export const DailyRepeat: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '매일 아침 운동',
        date: '2024-11-15',
        startTime: '07:00',
        endTime: '08:00',
        description: '조깅',
        location: '공원',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: '2024-12-31' },
        notificationTime: 60,
      },
    ],
    notifiedEvents: [],
  },
};

export const WeeklyRepeat: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-11-18',
        startTime: '14:00',
        endTime: '15:00',
        description: '매주 월요일',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

export const MonthlyRepeat: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '월간 보고',
        date: '2024-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '월초 보고',
        location: '회의실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: [],
  },
};

// 알림 시간별
export const NotificationVariations: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '1분 전 알림',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '긴급',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '10분 전 알림',
        date: '2024-11-15',
        startTime: '11:00',
        endTime: '12:00',
        description: '일반',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '1일 전 알림',
        date: '2024-11-16',
        startTime: '14:00',
        endTime: '15:00',
        description: '중요 미팅',
        location: '본사',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: [],
  },
};

// 알림 활성화 상태
export const AllEventsNotified: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents,
    notifiedEvents: mockEvents.map((e) => e.id),
  },
};

export const PartialNotifications: Story = {
  args: {
    searchTerm: '',
    filteredEvents: mockEvents,
    notifiedEvents: ['1', '3'], // 일부만 알림
  },
};

// ===== 5. 텍스트 길이에 따른 처리 =====

// 짧은 제목
export const ShortTitles: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '짧음',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '짧은 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '미팅',
        date: '2024-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '간단',
        location: 'A',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

// 긴 제목
export const LongTitles: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title:
          '매우 긴 제목을 가진 일정입니다. 이 일정은 제목이 너무 길어서 UI에서 어떻게 표시되는지 테스트하기 위한 것입니다',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '긴 제목 테스트',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title:
          '또 다른 매우 긴 제목의 일정으로 UI 렌더링 및 텍스트 오버플로우 처리를 확인하기 위한 시각적 회귀 테스트용 일정',
        date: '2024-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '긴 제목 테스트 2',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

// 긴 설명
export const LongDescriptions: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '상세 일정',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '매우 긴 설명입니다. '.repeat(50),
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};

// 긴 위치
export const LongLocations: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '원거리 미팅',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '먼 곳',
        location:
          '대한민국 서울특별시 강남구 테헤란로 123번길 45, 매우 긴 이름을 가진 빌딩 4층 회의실 A호',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '해외 미팅',
        date: '2024-11-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '화상 회의',
        location:
          'United States of America, California, San Francisco, Market Street 123, Building 456, Floor 7, Conference Room Alpha',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ],
    notifiedEvents: [],
  },
};

// 모든 필드가 긴 경우
export const AllFieldsLong: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '매우 긴 제목을 가진 일정입니다. 모든 필드가 길어서 UI 렌더링을 테스트합니다.',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description:
          '매우 상세하고 긴 설명입니다. 이 일정은 모든 정보가 상세하게 작성되어 있어서 UI에서 어떻게 표시되는지 확인하기 위한 테스트용 일정입니다. '.repeat(
            20
          ),
        location:
          '대한민국 서울특별시 강남구 테헤란로 123번길 45, 매우 긴 이름을 가진 빌딩의 4층에 위치한 대형 회의실 A호',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2024-12-31' },
        notificationTime: 1440,
      },
    ],
    notifiedEvents: [],
  },
};

// 혼합 길이
export const MixedLengths: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '짧음',
        date: '2024-11-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '짧은 설명',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매우 긴 제목의 일정으로 다른 일정들과 비교했을 때 어떻게 보이는지 테스트',
        date: '2024-11-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '보통 길이의 설명입니다',
        location: '회의실 B',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '중간 길이 제목',
        date: '2024-11-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매우 긴 설명을 가진 일정입니다. '.repeat(30),
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
    ],
    notifiedEvents: [],
  },
};

// 특수 문자 포함
export const WithSpecialCharacters: Story = {
  args: {
    searchTerm: '',
    filteredEvents: [
      {
        id: '1',
        title: '🎉 축하 파티 🎊',
        date: '2024-11-15',
        startTime: '18:00',
        endTime: '21:00',
        description: '✨ 프로젝트 완료 기념 파티 ✨',
        location: '🏢 회사 옥상',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
      {
        id: '2',
        title: '회의 (중요) [긴급]',
        date: '2024-11-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '※ 필수 참석 ※',
        location: '회의실 (A)',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: [],
  },
};
