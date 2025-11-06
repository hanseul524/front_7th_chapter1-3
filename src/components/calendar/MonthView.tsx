import { DndContext, useDraggable, useDroppable, DragEndEvent, DragMoveEvent } from '@dnd-kit/core';
import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';

import { Event, RepeatType } from '../../types';
import { formatMonth, getWeeksAtMonth, formatDate, getEventsForDay } from '../../utils/dateUtils';

// 상수
const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const getRepeatTypeLabel = (type: RepeatType): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onDragEnd: (event: DragEndEvent) => void;
  onDragMove: (event: DragMoveEvent) => void;
  onClickEvent: (date: string) => void;
}

const MonthView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onDragEnd,
  onDragMove,
  onClickEvent,
}: MonthViewProps) => {
  // DnD 컴포넌트
  const DraggableEvent = ({ event, children }: { event: Event; children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: event.id,
    });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      cursor: 'grab',
    };

    return (
      <Box ref={setNodeRef} {...listeners} {...attributes} sx={style}>
        {children}
      </Box>
    );
  };

  const DroppableCell = ({
    dateString,
    children,
  }: {
    dateString: string;
    children: React.ReactNode;
  }) => {
    const { setNodeRef, isOver } = useDroppable({ id: dateString });
    return (
      <TableCell
        ref={setNodeRef}
        sx={{
          height: '120px',
          verticalAlign: 'top',
          width: '14.28%',
          padding: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: isOver ? '#e8eaf6' : 'inherit',
          transition: '0.2s',
        }}
        onClick={() => {
          onClickEvent(dateString);
        }}
      >
        {children}
      </TableCell>
    );
  };

  const weeks = getWeeksAtMonth(currentDate);

  return (
    <DndContext onDragEnd={onDragEnd} onDragMove={onDragMove}>
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];

                    return (
                      <DroppableCell key={dayIndex} dateString={dateString}>
                        {day && (
                          <>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(filteredEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              const isRepeating = event.repeat.type !== 'none';

                              return (
                                <DraggableEvent key={event.id} event={event}>
                                  <Box
                                    key={event.id}
                                    sx={{
                                      p: 0.5,
                                      my: 0.5,
                                      backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                      borderRadius: 1,
                                      fontWeight: isNotified ? 'bold' : 'normal',
                                      color: isNotified ? '#d32f2f' : 'inherit',
                                      minHeight: '18px',
                                      width: '100%',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {isNotified && <Notifications fontSize="small" />}
                                      {/* ! TEST CASE */}
                                      {isRepeating && (
                                        <Tooltip
                                          title={`${event.repeat.interval}${getRepeatTypeLabel(
                                            event.repeat.type
                                          )}마다 반복${
                                            event.repeat.endDate
                                              ? ` (종료: ${event.repeat.endDate})`
                                              : ''
                                          }`}
                                        >
                                          <Repeat fontSize="small" />
                                        </Tooltip>
                                      )}
                                      <Typography
                                        variant="caption"
                                        noWrap
                                        sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                      >
                                        {event.title}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </DraggableEvent>
                              );
                            })}
                          </>
                        )}
                      </DroppableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </DndContext>
  );
};

export default MonthView;
