import { Button, Loader } from "@mantine/core";
import { getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import Dashboard from "../../layouts/Dashboard";

export const CleaningSchedule: NextPageWithLayout = () => {
  const { documents: bookings } = useFirestoreDocuments<Booking>(
    Collection.Bookings,
    true
  );

  const router = useRouter();

  const getEvents = useCallback(
    (currentWeek: Date[]) =>
      bookings?.reduce<CalendarEvent[]>((array, booking) => {
        // array.push({
        //   id: booking.id,
        //   title: booking.customer.secondName || booking.customer.name,
        //   start: booking.cleaningStartDate.toDate(),
        //   end: booking.cleaningStartDate.toDate(),
        //   roomName: booking.room.name,
        // });

        return array;
      }, []),
    [bookings]
  );

  if (!bookings) return <Loader />;

  return (
    <div>
      <Calendar
        lsKey="calendar-cleaning-schedule"
        events={getEvents}
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
