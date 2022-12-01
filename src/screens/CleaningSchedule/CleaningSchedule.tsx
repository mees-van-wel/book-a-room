import { Button, Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import Dashboard from "../../layouts/Dashboard";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { CleaningInterval } from "../../enums/cleaningInterval.enum";
import { getCustomer, getRoom } from "../Bookings";
import { useDidUpdate } from "@mantine/hooks";

dayjs.extend(duration);

export const CleaningSchedule: NextPageWithLayout = () => {
  const [events, setEvents] = useState<CalendarEvent[]>();
  const { documents: bookings } = useFirestoreDocuments<Booking>(
    Collection.Bookings,
    true
  );

  const router = useRouter();

  useDidUpdate(() => {
    if (!bookings) return;

    (async () => {
      const formatted = await Promise.all(
        bookings.reduce<Promise<CalendarEvent>[]>((array, current) => {
          if (!!current.cleaningInterval && !!current.cleaningStartDate) {
            const weeks = dayjs
              .duration(
                current.end.toDate().getTime() -
                  current.start.toDate().getTime()
              )
              .asWeeks();

            const interval =
              current.cleaningInterval === CleaningInterval.BiWeekly
                ? weeks / 2
                : weeks;

            for (let i = 0; i < interval; i++) {
              const date = dayjs(current.cleaningStartDate.toDate())
                .add(
                  current.cleaningInterval === CleaningInterval.BiWeekly
                    ? i * 2
                    : i,
                  "week"
                )
                .toDate();

              const fn = async () => {
                const room = await getRoom(current);

                return {
                  id: current.id,
                  title: current.cleaningNotes ?? "",
                  start: date,
                  end: date,
                  roomName: room?.name,
                } as CalendarEvent;
              };

              array.push(fn());
            }
          }

          return array;
        }, [])
      );

      setEvents(formatted);
    })();
  }, [bookings]);

  if (!events) return <Loader />;

  return (
    <div>
      <Calendar
        full
        lsKey="calendar-cleaning-schedule"
        events={events}
        onEventClick={(id) => {
          router.push({
            pathname: Route.Booking,
            query: {
              id,
            },
          });
        }}
      />
      <Button
        mt="md"
        className="no-print"
        onClick={() => {
          window.open("/cleaning-schedule-print", "_blank");
        }}
      >
        Print
      </Button>
    </div>
  );
};

CleaningSchedule.getLayout = (page: ReactElement) => (
  <Dashboard>{page}</Dashboard>
);
