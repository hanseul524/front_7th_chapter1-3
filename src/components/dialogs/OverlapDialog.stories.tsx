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
