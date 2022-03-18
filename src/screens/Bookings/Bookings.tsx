import { EventInput } from '@fullcalendar/common';
import { EventApi } from '@fullcalendar/react';
import { Loader, Modal } from '@mantine/core';
import { FC, useMemo, useState } from 'react';

import Calendar from '../../components/Calendar';
import COLLECTIONS from '../../enums/COLLECTIONS';
import Booking from '../../forms/Booking';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import {
  BookingInterface,
  FirestoreBookingInterface,
  NewBookingInterface,
} from '../../interfaces/Booking';

const Bookings: FC = () => {
  const [booking, setBooking] = useState<BookingInterface | NewBookingInterface>();
  const { documents: bookings, loading } =
    useFirestoreDocuments<FirestoreBookingInterface>(COLLECTIONS.BOOKINGS, true);

  const events = useMemo<EventInput[] | undefined>(
    () =>
      bookings?.map((booking) => ({
        title: `Kamer: ${booking.room.name}`,
        start: booking.start.toDate(),
        end: booking.end.toDate(),
        extendedProps: booking,
      })),
    [bookings],
  );

  if (loading) return <Loader />;

  const closeHandler = () => setBooking(undefined);
  const newBookingHandler = (start: Date, end: Date) =>
    setBooking({
      start,
      end,
    });
  const openBookingHandler = ({ extendedProps, start, end }: EventApi) => {
    setBooking({
      ...extendedProps,
      start: start ?? new Date(),
      end: end ?? new Date(),
    });
  };

  return (
    <>
      <Modal opened={!!booking} size="lg" onClose={closeHandler} title="Boeking">
        <Booking booking={booking} closeHandler={closeHandler} />
      </Modal>

      {events && (
        <Calendar
          events={events}
          onClick={newBookingHandler}
          onEventClick={openBookingHandler}
        />
      )}
    </>
  );
};

export default Bookings;