import { Button, Group } from "@mantine/core";
import { DatePicker, getMonthDays } from "@mantine/dates";
import { useLocalStorage } from "@mantine/hooks";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { FC, useMemo } from "react";
import { Collection } from "../../enums/collection.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import { RoomInterface } from "../../interfaces/Room";
import { calcNights, overlapDates } from "../../screens/Bookings/Booking";

dayjs.extend(isBetween);

const now = new Date();

const compareDates = (firstDate: Date, secondDate?: Date) => {
  return (
    firstDate.getDate() == (secondDate ?? now).getDate() &&
    firstDate.getMonth() == (secondDate ?? now).getMonth() &&
    firstDate.getFullYear() == (secondDate ?? now).getFullYear()
  );
};

interface CalendarProps {
  lsKey: string;
  showAll?: boolean;
  events: CalendarEvent[];
  full?: boolean;
  onNewClick?: () => void;
  onEventClick?: (eventId: string) => void;
}

const Calendar: FC<CalendarProps> = ({
  lsKey,
  showAll,
  events,
  full,
  onEventClick,
  onNewClick,
}) => {
  const [dateString, setDate] = useLocalStorage<string>({
    key: lsKey,
    defaultValue: now.toISOString(),
  });

  const date = useMemo(() => new Date(dateString), [dateString]);

  const firstDayOfWeek = "monday";
  const { documents: allRooms } = useFirestoreDocuments<RoomInterface>(
    Collection.Rooms
  );

  const days = getMonthDays(date, firstDayOfWeek);

  const currentWeek = useMemo(
    () =>
      days.find((daySet) => !!daySet.find((day) => compareDates(day, date))),
    [days, date]
  );

  const rooms = useMemo(
    () =>
      showAll
        ? allRooms
        : allRooms?.reduce<RoomInterface[]>((array, current) => {
            if (
              currentWeek &&
              events.some(
                (event) =>
                  current.name === event.roomName &&
                  overlapDates(
                    [currentWeek[0], currentWeek[currentWeek.length - 1]],
                    [event.start, event.end]
                  )
              )
            )
              array.push(current);
            return array;
          }, []),
    [showAll, allRooms, currentWeek, events]
  );

  const previousWeek = () => {
    const cloneDate = new Date(date);
    setDate(new Date(cloneDate.setDate(date.getDate() - 7)).toISOString());
  };

  const nextWeek = () => {
    const cloneDate = new Date(date);
    setDate(new Date(cloneDate.setDate(date.getDate() + 7)).toISOString());
  };

  return (
    <div>
      <div
        className="no-print"
        style={{
          display: "flex",
          padding: 8,
          boxShadow: "0px 5px 15px -4px rgba(0,0,0,0.67)",
          borderRadius: 8,
          backgroundColor: "#343a40",
        }}
      >
        <div
          style={{
            width: "30%",
          }}
        >
          {onNewClick && (
            <Button onClick={onNewClick} variant="default">
              Nieuwe boeking
            </Button>
          )}
        </div>
        <Group position="center">
          <Button.Group>
            <Button onClick={previousWeek} variant="default">
              Vorige week
            </Button>
            <Button
              onClick={() => {
                setDate(now.toISOString());
              }}
              variant="default"
            >
              Deze week
            </Button>
            <Button onClick={nextWeek} variant="default">
              Volgende week
            </Button>
          </Button.Group>
          <DatePicker
            locale="nl"
            value={date}
            onChange={(value) => {
              value && setDate(value.toISOString());
            }}
            clearable={false}
            required
          />
        </Group>
      </div>
      {!!events.length && (
        <div
          style={{
            overflow: "auto",
            maxHeight: "calc(100vh - 179px)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <tr>
              <th />
              {currentWeek?.map((day) => (
                <th
                  key={day.getDate()}
                  style={{
                    textAlign: "center",
                    padding: 8,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {day.toLocaleDateString("nl-NL", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </th>
              ))}
            </tr>
            {rooms
              ?.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
              .map(({ name }) => (
                <tr
                  key={name}
                  style={{
                    borderTop: "solid gray 1px",
                  }}
                >
                  <td
                    style={{
                      borderRight: "solid gray 1px",
                      padding: 8,
                    }}
                  >
                    {name}
                  </td>
                  {currentWeek?.map((day) => {
                    const event = events.filter(
                      (event) =>
                        name === event.roomName &&
                        (compareDates(day, event.start) ||
                          dayjs(day).isBetween(
                            event.start,
                            event.end,
                            null,
                            "(]"
                          ))
                    );

                    return (
                      <td
                        key={day.getDate()}
                        style={{
                          verticalAlign: "top",
                        }}
                      >
                        <div>
                          {!!event.length &&
                            event.map((e, i) => {
                              const isOne = calcNights(e.end, e.start) === 0;
                              const isStart = compareDates(e.start, day);
                              const isEnd = compareDates(e.end, day);

                              const opacity =
                                e.invoicedTill &&
                                e.invoicedTill?.toDate().getTime() <
                                  day.getTime()
                                  ? 0.5
                                  : 1;

                              return (
                                <p
                                  className={!e.title ? "bg" : undefined}
                                  title={e.title}
                                  key={i}
                                  onClick={() =>
                                    onEventClick && onEventClick(e.id)
                                  }
                                  style={{
                                    cursor: onEventClick
                                      ? "pointer"
                                      : undefined,
                                    borderTopLeftRadius: isStart ? 16 : 0,
                                    borderBottomLeftRadius: isStart ? 16 : 0,
                                    borderTopRightRadius: isEnd ? 16 : 0,
                                    borderBottomRightRadius: isEnd ? 16 : 0,
                                    background: isOne
                                      ? "#1971c2"
                                      : isStart
                                      ? "linear-gradient(90deg, hsla(131, 54%, 40%, 1) 25%, hsla(209, 77%, 43%, 1) 100%)"
                                      : isEnd
                                      ? "linear-gradient(90deg, hsla(209, 77%, 43%, 1) 0%, hsla(0, 74%, 54%, 1) 75%)"
                                      : "#1971c2",
                                    color: "white",
                                    fontSize: 14,
                                    textAlign: full ? "left" : "center",
                                    opacity,
                                    height: !e.title ? "30px" : undefined,
                                    marginLeft: isStart ? "auto" : -1,
                                    width: "100%",
                                    marginRight: -1,
                                    marginTop: 8,
                                    marginBottom: 8,
                                    padding: "4px 8px",
                                    whiteSpace: full ? undefined : "nowrap",
                                    overflow: full ? undefined : "hidden",
                                    textOverflow: full ? undefined : "ellipsis",
                                  }}
                                >
                                  {e.title}
                                </p>
                              );
                            })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </table>
        </div>
      )}
    </div>
  );
};

export default Calendar;
