import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../../types';

const mockRecurringEvent: Event = {
  id: '1',
  title: '매일 운동',
  date: '2024-11-15',
  startTime: '07:00',
  endTime: '08:00',
  description: '아침 조깅',
  location: '공원',
  category: '개인',
  repeat: {
    type: 'daily',
    interval: 1,
    endDate: '2024-12-31',
  },
  notificationTime: 60,
};

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/Dialogs/RecurringEventDialog',
  component: RecurringEventDialog,
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

// 편집 모드 (열림)
export const EditModeOpen: Story = {
  args: {
    open: true,
    event: mockRecurringEvent,
    mode: 'edit',
  },
};

// 삭제 모드 (열림)
export const DeleteModeOpen: Story = {
  args: {
    open: true,
    event: mockRecurringEvent,
    mode: 'delete',
  },
};

// 닫힌 상태
export const Closed: Story = {
  args: {
    open: false,
    event: mockRecurringEvent,
    mode: 'edit',
  },
};

// 주간 반복 일정 - 편집
export const WeeklyEventEdit: Story = {
  args: {
    open: true,
    event: {
      ...mockRecurringEvent,
      title: '주간 회의',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2024-12-31',
      },
    },
    mode: 'edit',
  },
};

// 월간 반복 일정 - 삭제
export const MonthlyEventDelete: Story = {
  args: {
    open: true,
    event: {
      ...mockRecurringEvent,
      title: '월간 보고',
      repeat: {
        type: 'monthly',
        interval: 1,
      },
    },
    mode: 'delete',
  },
};
