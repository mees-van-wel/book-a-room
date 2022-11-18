import { Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import Dashboard from "../../layouts/Dashboard";
import { NEW } from "../../utils/new.utility";

export const Bookings: NextPageWithLayout = () => {
  const { documents: bookings } = useFirestoreDocuments<Booking>(
    Collection.Bookings,
    true
  );

  const router = useRouter();

  const events = useMemo<CalendarEvent[] | undefined>(
    () =>
      bookings?.map((booking) => ({
        id: booking.id,
        title: !!booking.extraOne
          ? `${booking.extraOne} - ${booking.customer.name}`
          : booking.customer.name,
        start: booking.start.toDate(),
        end: booking.end.toDate(),
        roomName: booking.room.name,
      })),
    [bookings]
  );

  if (!events) return <Loader />;

  return (
    <Calendar
      showAll
      lsKey="calendar-bookings"
      events={events}
      onNewClick={() => {
        router.push({
          pathname: Route.Booking,
          query: {
            id: NEW,
          },
        });
      }}
      onEventClick={(id) => {
        router.push({
          pathname: Route.Booking,
          query: {
            id,
          },
        });
      }}
    />
  );
};

Bookings.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
