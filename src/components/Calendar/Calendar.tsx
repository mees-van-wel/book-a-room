import '@fullcalendar/react/dist/vdom';

import nlLocale from '@fullcalendar/core/locales/nl';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar, { EventApi, EventInput } from '@fullcalendar/react';
import dayjs from 'dayjs';
import { FC, useMemo } from 'react';

interface CalendarProps {
  events: EventInput[];
  onClick?: (start: Date, end: Date) => void;
  onEventClick?: (event: EventApi) => void;
}

const Calendar: FC<CalendarProps> = ({ events, onEventClick, onClick }) => {
  const correctEvents = useMemo(
    () =>
      events?.map((event) => {
        const end = event.end as Date;
        return {
          ...event,
          end: new Date(end.setHours(end.getHours() + 1)),
        };
      }),
    [events],
  );

  return (
    <FullCalendar
      locale={nlLocale}
      height="calc(100% - 16px)"
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={correctEvents}
      eventClick={({ event }) => {
        if (onEventClick) onEventClick(event);
      }}
      firstDay={1}
      selectable
      nowIndicator
      select={({ start, end }) => {
        start.setHours(12);
        end.setHours(12);

        const dayStart = dayjs(start);
        const dayEnd = dayjs(end);

        if (dayEnd.diff(dayStart, 'days') > 1) end.setDate(end.getDate() - 1);

        if (onClick) onClick(new Date(start), new Date(end));
      }}
    />
  );
};

export default Calendar;
