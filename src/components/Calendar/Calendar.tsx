import '@fullcalendar/react/dist/vdom';

import nlLocale from '@fullcalendar/core/locales/nl';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar, { EventApi, EventInput } from '@fullcalendar/react';
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
        const now = new Date();
        start.setHours(now.getHours());
        end.setDate(end.getDate() - 1);
        end.setHours(now.getHours() + 1);
        if (onClick) onClick(new Date(start), new Date(end));
      }}
    />
  );
};

export default Calendar;
