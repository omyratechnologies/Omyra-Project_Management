import React from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Meeting } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  meetings: Meeting[];
  onSelectMeeting: (meeting: Meeting) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ meetings, onSelectMeeting }) => {
  // Transform meetings for the calendar with error handling
  const events = meetings.filter(meeting => meeting && meeting.scheduledAt).map(meeting => {
    try {
      const startDate = new Date(meeting.scheduledAt);
      const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
      
      return {
        id: meeting._id,
        title: meeting.title || 'Untitled Meeting',
        start: startDate,
        end: endDate,
        resource: meeting
      };
    } catch (error) {
      console.error('Error processing meeting for calendar:', meeting, error);
      return null;
    }
  }).filter(Boolean); // Remove null entries

  const handleSelectEvent = (event: any) => {
    if (event?.resource) {
      onSelectMeeting(event.resource);
    }
  };

  const eventStyleGetter = (event: any) => {
    const meeting = event.resource as Meeting;
    let backgroundColor = '#3174ad';
    
    switch (meeting.status) {
      case 'scheduled':
        backgroundColor = '#3174ad';
        break;
      case 'completed':
        backgroundColor = '#10b981';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const CustomEvent = ({ event }: { event: any }) => {
    const meeting = event.resource as Meeting;
    return (
      <div className="p-1">
        <div className="font-medium text-xs truncate">{event.title}</div>
        <div className="text-xs opacity-75">
          {meeting.attendees?.length || 0} attendees
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px] bg-white rounded-lg border p-4">
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-calendar .rbc-event {
            border-radius: 4px;
          }
          .custom-calendar .rbc-event-content {
            padding: 2px 4px;
          }
          .custom-calendar .rbc-toolbar button {
            color: #374151;
            border: 1px solid #d1d5db;
            background: white;
            margin: 0 2px;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
          }
          .custom-calendar .rbc-toolbar button:hover {
            background: #f3f4f6;
          }
          .custom-calendar .rbc-toolbar button.rbc-active {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
          }
          .custom-calendar .rbc-header {
            padding: 8px 6px;
            font-weight: 500;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }
          .custom-calendar .rbc-date-cell {
            padding: 8px;
          }
          .custom-calendar .rbc-today {
            background-color: #fef3c7;
          }
          .custom-calendar .rbc-off-range-bg {
            background: #f9fafb;
          }
        `
      }} />
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent
        }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        popup
        step={30}
        showMultiDayTimes
        className="custom-calendar"
      />
    </div>
  );
};

export default CalendarView;
