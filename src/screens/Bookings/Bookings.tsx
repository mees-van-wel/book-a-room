import { Loader } from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import { getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { CalendarEvent } from "../../interfaces/calendarEvent.interface";
import { Customer } from "../../interfaces/customer.interface";
import { Room } from "../../interfaces/room.interface";
import Dashboard from "../../layouts/Dashboard";
import { createRef } from "../../utils/createRef.utility";
import { NEW } from "../../utils/new.utility";

export const getRoom = async (booking: Booking) => {
  const refrence =
    booking.roomRefrence || createRef(Collection.Rooms, booking.room.id);

  if (!refrence) return booking.room as Room;

  const roomSnapshot = await getDoc<Room>(refrence);
  return roomSnapshot.data();
};

export const getCustomer = async (booking: Booking) => {
  const refrence =
    booking.customerRefrence ||
    createRef(Collection.Customers, booking.customer.id);

  if (!refrence) return booking.customer as Customer;

  const customerSnapshot = await getDoc<Customer>(refrence);
  return customerSnapshot.data();
};

export const Bookings: NextPageWithLayout = () => {
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
        bookings.map(async (booking) => {
          const room = await getRoom(booking);
          const customer = await getCustomer(booking);

          return {
            id: booking.id,
            title:
              booking.extraOne || customer?.secondName
                ? `${booking.extraOne || customer?.secondName} - ${
                    customer?.name
                  }`
                : customer?.name || "",
            start: booking.start.toDate(),
            end: booking.end.toDate(),
            roomName: room?.name || "",
            invoicedTill: booking.invoicedTill,
          };
        })
      );

      setEvents(formatted);
    })();
  }, [bookings]);

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
