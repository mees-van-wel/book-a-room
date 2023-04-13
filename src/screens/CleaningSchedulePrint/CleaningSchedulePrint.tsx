import { Loader } from "@mantine/core";
import { ReactElement, useEffect, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import duration from "dayjs/plugin/duration";
import dayjs from "dayjs";
import { Booking } from "../../interfaces/booking.interface";
import { CleaningInterval } from "../../enums/cleaningInterval.enum";
import { useDidUpdate } from "@mantine/hooks";
import Dashboard from "../../layouts/Dashboard";

dayjs.extend(duration);

export const CleaningSchedulePrint: NextPageWithLayout = () => {
  const { documents: bookings, loading } = useFirestoreDocuments<Booking>(
    Collection.Bookings,
    true
  );

  const events = useMemo(
    () =>
      bookings?.reduce<CalendarEvent[]>((array, current) => {
        if (!!current.cleaningInterval && !!current.cleaningStartDate) {
          const weeks = dayjs
            .duration(
              current.end.toDate().getTime() - current.start.toDate().getTime()
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

            array.push({
              id: current.id,
              title: current.cleaningNotes ?? "",
              start: date,
              end: date,
              roomName: current?.room?.name,
            });
          }
        }
        return array;
      }, []),
    [bookings]
  );

  useEffect(() => {
    if (events)
      setTimeout(() => {
        window.print();
      }, 1000);
  }, [events]);

  console.log(bookings);

  return !bookings || loading ? (
    <Loader />
  ) : (
    <p>asdS</p>
    // <Calendar lsKey="calendar-cleaning-schedule" events={events} full />
  );
};

CleaningSchedulePrint.getLayout = (page: ReactElement) => (
  <Dashboard>{page}</Dashboard>
);
