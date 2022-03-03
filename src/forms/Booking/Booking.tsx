import { Button, Group, Select, Table, Textarea, Title } from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import pdf from '@react-pdf/renderer';
import dayjs from 'dayjs';
import firebase from 'firebase/compat';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback, useEffect, useMemo } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { BookingInterface, NewBookingInterface } from '../../interfaces/Booking';
import { firestore } from '../../lib/firebase';
import Timestamp = firebase.firestore.Timestamp;
import { FireStoreRoomInterface } from '../../interfaces/Room';
import currency from '../../utils/currency';

const { Document, Page, Text, View, StyleSheet, PDFDownloadLink } = pdf;

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
    padding: 16,
  },
  section: {
    width: '100%',
    display: 'flex',
  },
  text: {
    marginBottom: 16,
  },
});

const Receipt = ({
  room,
  start,
  end,
  nights,
}: {
  room: FireStoreRoomInterface;
  start: Date;
  end: Date;
  nights: number;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>Room:</Text>
        <Text style={styles.text}>Price per night:</Text>
        <Text style={styles.text}>Nights:</Text>
        <Text style={styles.text}>Total:</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>{room.name}</Text>
        <Text style={styles.text}>{currency(room.price)}</Text>
        <Text style={styles.text}>{`${nights} (${start.toLocaleDateString(
          'nl-NL',
        )} - ${end.toLocaleDateString('nl-NL')})`}</Text>
        <Text style={styles.text}>
          {currency(Math.round(room.price * nights * 100) / 100)}
        </Text>
      </View>
    </Page>
  </Document>
);

interface BookingProps {
  booking?: BookingInterface | NewBookingInterface;
  closeHandler: () => void;
}

interface FormData {
  date: [Date, Date] | null;
  room: string | null;
  notes: string;
}

const Booking: FC<BookingProps> = ({ booking, closeHandler }) => {
  const { documents: rooms } = useFirestoreDocuments<FireStoreRoomInterface>(
    COLLECTIONS.ROOMS,
  );

  const form = useForm<FormData>({
    initialValues: booking
      ? {
          date: [booking.start, booking.end],
          room: 'room' in booking ? JSON.stringify(booking.room) : null,
          notes: 'notes' in booking ? booking.notes : '',
        }
      : {
          date: null,
          room: null,
          notes: '',
        },
  });

  const submitHandler = useCallback(
    async ({ date, room, notes }: FormData) => {
      const bookingToSend = {
        start: date?.[0] && Timestamp.fromDate(date[0]),
        end: date?.[1] && Timestamp.fromDate(date[1]),
        room: room ? JSON.parse(room) : booking && 'room' in booking && booking.room,
        notes,
      };

      if (booking && 'id' in booking)
        await setDoc(doc(firestore, 'bookings', booking.id), bookingToSend);
      else await addDoc(collection(firestore, 'bookings'), bookingToSend);

      closeHandler();
    },
    [booking, closeHandler],
  );

  const deleteHandler = useCallback(async () => {
    if (booking && 'id' in booking)
      await deleteDoc(doc(firestore, 'bookings', booking.id));

    closeHandler();
  }, [booking, closeHandler]);

  const roomSelectData = useMemo(
    () =>
      rooms?.map((room) => ({
        value: JSON.stringify(room),
        label: room.name,
      })),
    [rooms],
  );

  const room = useMemo<FireStoreRoomInterface>(
    () =>
      form.values.room
        ? JSON.parse(form.values.room)
        : booking && 'room' in booking && booking.room,
    [form.values.room, booking],
  );

  const nights = useMemo(
    () =>
      form.values.date ? dayjs(form.values.date[1]).diff(form.values.date[0], 'days') : 0,
    [form.values.date],
  );

  useEffect(() => {
    if (rooms && booking && 'room' in booking) {
      const room = roomSelectData?.find(({ value }) => {
        const { name, price } = JSON.parse(value) as FireStoreRoomInterface;
        return name === booking.room.name && price === booking.room.price;
      })?.value;

      if (room) form.setFieldValue('room', room);
    }
  }, [rooms]);

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <DateRangePicker
        required
        label="Date"
        placeholder="Date"
        {...form.getInputProps('date')}
      />
      <Select
        required={!room}
        label="Room"
        placeholder="Room"
        searchable
        clearable
        data={roomSelectData ?? []}
        {...form.getInputProps('room')}
      />
      <Textarea label="Notes" placeholder="Notes" {...form.getInputProps('notes')} />
      <Group mt={16}>
        <Button type="submit">Save</Button>
        {booking && 'id' in booking && (
          <Button color="red" onClick={deleteHandler}>
            Delete
          </Button>
        )}
      </Group>
      {booking &&
        'id' in booking &&
        form.values.date &&
        !!form.values.date[0] &&
        !!form.values.date[1] && (
          <div>
            <Title my={16} order={2}>
              Receipt
            </Title>
            <Table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Price per night</th>
                  <th>Nights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{room.name}</td>
                  <td>{currency(room.price)}</td>
                  <td>{nights}</td>
                </tr>
              </tbody>
            </Table>
            <p>{`Total: ${currency(Math.round(room.price * nights * 100) / 100)}`}</p>

            <PDFDownloadLink
              document={
                <Receipt
                  room={room}
                  nights={nights}
                  start={form.values.date[0]}
                  end={form.values.date[1]}
                />
              }
              fileName={`Receipt (${form.values.date[0].toLocaleDateString(
                'nl-NL',
              )} - ${form.values.date[1].toLocaleDateString('nl-NL')})`}
            >
              <Button>Download PDF</Button>
            </PDFDownloadLink>
          </div>
        )}
    </form>
  );
};

export default Booking;
