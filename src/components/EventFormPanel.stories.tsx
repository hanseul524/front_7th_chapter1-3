import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import EventFormPanel from './EventFormPanel';

// Mock handlers
const meta: Meta<typeof EventFormPanel> = {
  title: 'Components/EventFormPanel',
  component: EventFormPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 일정 추가 모드
export const AddMode: Story = {
  args: {
    editingEvent: null,
    title: '',
    setTitle: fn(),
    date: '2024-11-15',
    setDate: fn(),
    startTime: '09:00',
    endTime: '10:00',
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    startTimeError: null,
    endTimeError: null,
    description: '',
    setDescription: fn(),
    location: '',
    setLocation: fn(),
    category: '업무',
    setCategory: fn(),
    isRepeating: false,
    setIsRepeating: fn(),
    repeatType: 'none',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '',
    setRepeatEndDate: fn(),
    notificationTime: 10,
    setNotificationTime: fn(),
  },
};

// 일정 추가 모드 (필드 채워진 상태)
export const AddModeWithData: Story = {
  args: {
    editingEvent: null,
    title: '팀 미팅',
    setTitle: fn(),
    date: '2024-11-15',
    setDate: fn(),
    startTime: '14:00',
    endTime: '15:30',
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    startTimeError: null,
    endTimeError: null,
    description: '주간 업무 회의',
    setDescription: fn(),
    location: '회의실 A',
    setLocation: fn(),
    category: '업무',
    setCategory: fn(),
    isRepeating: false,
    setIsRepeating: fn(),
    repeatType: 'none',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '',
    setRepeatEndDate: fn(),
    notificationTime: 10,
    setNotificationTime: fn(),
  },
};

// 반복 일정 추가 모드
export const RepeatingEvent: Story = {
  args: {
    editingEvent: null,
    title: '매일 운동',
    setTitle: fn(),
    date: '2024-11-15',
    setDate: fn(),
    startTime: '07:00',
    endTime: '08:00',
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    startTimeError: null,
    endTimeError: null,
    description: '아침 조깅',
    setDescription: fn(),
    location: '공원',
    setLocation: fn(),
    category: '개인',
    setCategory: fn(),
    isRepeating: true,
    setIsRepeating: fn(),
    repeatType: 'daily',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '2024-12-31',
    setRepeatEndDate: fn(),
    notificationTime: 60,
    setNotificationTime: fn(),
  },
};

// 일정 수정 모드
export const EditMode: Story = {
  args: {
    editingEvent: {
      id: '1',
      title: '기존 미팅',
      date: '2024-11-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정할 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    },
    title: '기존 미팅',
    setTitle: fn(),
    date: '2024-11-15',
    setDate: fn(),
    startTime: '10:00',
    endTime: '11:00',
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    startTimeError: null,
    endTimeError: null,
    description: '수정할 미팅',
    setDescription: fn(),
    location: '회의실 B',
    setLocation: fn(),
    category: '업무',
    setCategory: fn(),
    isRepeating: false,
    setIsRepeating: fn(),
    repeatType: 'none',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '',
    setRepeatEndDate: fn(),
    notificationTime: 10,
    setNotificationTime: fn(),
  },
};

// 시간 에러 상태
export const WithTimeError: Story = {
  args: {
    editingEvent: null,
    title: '잘못된 시간',
    setTitle: fn(),
    date: '2024-11-15',
    setDate: fn(),
    startTime: '10:00',
    endTime: '09:00',
    handleStartTimeChange: fn(),
    handleEndTimeChange: fn(),
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    description: '',
    setDescription: fn(),
    location: '',
    setLocation: fn(),
    category: '업무',
    setCategory: fn(),
    isRepeating: false,
    setIsRepeating: fn(),
    repeatType: 'none',
    setRepeatType: fn(),
    repeatInterval: 1,
    setRepeatInterval: fn(),
    repeatEndDate: '',
    setRepeatEndDate: fn(),
    notificationTime: 10,
    setNotificationTime: fn(),
  },
};
