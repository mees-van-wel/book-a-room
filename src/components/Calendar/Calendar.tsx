import '@fullcalendar/react/dist/vdom';

import { EventApi, EventInput } from '@fullcalendar/react';
import { Button, Group } from '@mantine/core';
import { DatePicker, getMonthDays } from '@mantine/dates';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { FC, useMemo, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { RoomInterface } from '../../interfaces/Room';

interface CalendarProps {
  events: EventInput[];
  onClick?: (start: Date, end: Date) => void;
  onEventClick?: (event: EventApi) => void;
}

const now = new Date();

const compareDates = (firstDate: Date, secondDate?: Date) => {
  return (
    firstDate.getDate() == (secondDate ?? now).getDate() &&
    firstDate.getMonth() == (secondDate ?? now).getMonth() &&
    firstDate.getFullYear() == (secondDate ?? now).getFullYear()
  );
};

const Calendar: FC<CalendarProps> = ({ events, onEventClick, onClick }) => {
  const [date, setDate] = useState(now);
  const firstDayOfWeek = 'monday';
  const { documents: rooms } = useFirestoreDocuments<RoomInterface>(COLLECTIONS.ROOMS);

  const days = getMonthDays(date, firstDayOfWeek);

  const currentWeek = useMemo(
    () => days.find((daySet) => !!daySet.find((day) => compareDates(day, date))),
    [days, date],
  );

  // const rooms = useMemo(() => {
  //   const r: string[] = [];
  //   events.forEach((event) => {
  //     if (
  //       !r.includes(event.roomName) &&
  //       // @ts-ignore
  //       (compareDates(currentWeek[0], event.start) ||
  //         // @ts-ignore
  //         dayjs(event.end).isBetween(
  //           // @ts-ignore
  //           currentWeek[0],
  //           // @ts-ignore
  //           currentWeek[currentWeek.length - 1],
  //           null,
  //           '(]',
  //         ) ||
  //         // @ts-ignore
  //         dayjs(event.start).isBetween(
  //           // @ts-ignore
  //           currentWeek[0],
  //           // @ts-ignore
  //           currentWeek[currentWeek.length - 1],
  //           null,
  //           '(]',
  //         ))
  //     )
  //       r.push(event.roomName);
  //   });
  //   return r;
  // }, [events, currentWeek]);

  const previousWeek = () => {
    const cloneDate = new Date(date);
    setDate(new Date(cloneDate.setDate(date.getDate() - 7)));
  };

  const nextWeek = () => {
    const cloneDate = new Date(date);
    setDate(new Date(cloneDate.setDate(date.getDate() + 7)));
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          padding: 8,
          boxShadow: '0px 5px 15px -4px rgba(0,0,0,0.67)',
          borderRadius: 8,
          backgroundColor: '#228be6',
        }}
      >
        <div
          style={{
            width: '30%',
          }}
        >
          {/*@ts-ignore*/}
          <Button onClick={onClick} variant="default">
            Nieuwe boeking
          </Button>
        </div>
        <Group position="center">
          <Button onClick={previousWeek} variant="default">
            Vorige week
          </Button>
          <DatePicker
            locale="nl"
            value={date}
            // @ts-ignore
            onChange={setDate}
            clearable={false}
            required
          />
          <Button onClick={nextWeek} variant="default">
            Volgende week
          </Button>
        </Group>
      </div>
      <div style={{ overflow: 'auto', maxHeight: '80vh' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Kamer</th>
            {currentWeek?.map((day) => (
              <th key={day.getDate()} style={{ textAlign: 'center', padding: 8 }}>
                {day.toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </th>
            ))}
          </tr>
          {rooms?.sort().map(({ name }) => (
            <tr
              key={name}
              style={{
                borderTop: 'solid gray 1px',
              }}
            >
              <td
                style={{
                  borderRight: 'solid gray 1px',
                  padding: 8,
                }}
              >
                {name}
              </td>
              {currentWeek?.map((day) => {
                const event = events.find(
                  (event) =>
                    name === event.roomName &&
                    // @ts-ignore
                    (compareDates(day, event.start) ||
                      // @ts-ignore
                      dayjs(day).isBetween(event.start, event.end, null, '(]')),
                );

                return (
                  <td key={day.getDate()} style={{ padding: 8 }}>
                    {event && (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                      <p
                        // @ts-ignore
                        onClick={() => onEventClick(event)}
                        style={{
                          cursor: 'pointer',
                          margin: 0,
                          backgroundColor: '#228be6',
                          color: 'white',
                          fontSize: 14,
                          textAlign: 'center',
                          marginLeft: -8,
                          marginRight: -8,
                          padding: '4px 8px',
                        }}
                      >
                        {event.title}
                      </p>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export default Calendar;
