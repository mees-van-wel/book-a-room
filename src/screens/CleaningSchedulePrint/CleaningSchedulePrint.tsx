import { Button, Loader } from "@mantine/core";
import { getDoc } from "firebase/firestore";
import { ReactElement, useEffect, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import Calendar from "../../components/Calendar";
import { Collection } from "../../enums/collection.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Schedule } from "../../interfaces/schedule.interface";
import Dashboard from "../../layouts/Dashboard";

export const CleaningSchedulePrint: NextPageWithLayout = () => {
  const { documents: schedules } = useFirestoreDocuments<Schedule>(
    Collection.CleaningSchedule,
    true
  );

  const eventFn = schedules
    ? async () =>
        Promise.all(
          schedules.map(async (schedule) => {
            const bookingSnapshot = await getDoc(schedule.booking);
            const booking = bookingSnapshot.data();

            if (!booking) return {};

            return {
              id: schedule.id,
              title: booking.customer.secondName || booking.customer.name,
              start: schedule.date.toDate(),
              end: schedule.date.toDate(),
              roomName: booking.room.name,
            };
          })
        )
    : undefined;

  useEffect(() => {
    if (eventFn)
      setTimeout(() => {
        window.print();
      }, 1000);
  }, [eventFn]);

  if (!eventFn) return <Loader />;

  return (
    <div>
      {/* @ts-ignore */}
      <Calendar lsKey="calendar-cleaning-schedule" events={eventFn} />
    </div>
  );
};
