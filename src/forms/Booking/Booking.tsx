import {
  Button,
  Group,
  NumberInput,
  Select,
  Table,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
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
import { SettingsInterface } from '../../interfaces/Settings';
import currency from '../../utils/currency';

const { Document, Page, Text, View, StyleSheet, PDFDownloadLink } = pdf;

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    padding: 32,
    flexDirection: 'column',
  },
  settingsContainer: {
    alignItems: 'flex-end',
  },
  line: {
    marginVertical: 8,
    height: 1,
    backgroundColor: 'black',
    width: 100,
  },
  spacer: {
    marginVertical: 4,
  },
  table: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    paddingBottom: 4,
    marginBottom: 4,
    borderBottom: '1px solid black',
  },
});

const Receipt = ({
  room,
  booking,
  nights,
  pricePerNight,
  settings,
  totalWithoutVat,
  vat,
  vatPercentage,
  total,
}: {
  room: FireStoreRoomInterface;
  booking: FormData;
  nights: number;
  pricePerNight: number;
  settings: SettingsInterface;
  totalWithoutVat: number;
  vat: number;
  vatPercentage: number;
  total: number;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.settingsContainer}>
        <Text>Factuurnummer: 20220184</Text>
        <Text>Datum: 17-03-2022</Text>
        <View style={styles.line} />
        <Text>{settings.companyName}</Text>
        <Text>
          {settings.street} {settings.houseNumber}
        </Text>
        <Text>
          {settings.postalCode} {settings.city}
        </Text>
        <View style={styles.spacer} />
        <Text>E-mail: {settings.email}</Text>
        <Text>Telefoonnummer: {settings.phoneNumber}</Text>
        <View style={styles.spacer} />
        <Text>KvK-nummer: {settings.kvkNumber}</Text>
        <Text>Btw-nummer: {settings.btwNumber}</Text>
        <View style={styles.spacer} />
        <Text>Swift (BIC) code: {settings.bicCode}</Text>
        <Text>IBAN: {settings.iban}</Text>
      </View>
      <View>
        <Text>{booking.name}</Text>
        <Text>{booking.secondName}</Text>
        <Text>
          {booking.street} {booking.houseNumber}
        </Text>
        <Text>
          {booking.postalCode} {booking.city}
        </Text>
        <View style={styles.spacer} />
        <Text>E-mail: {booking.email}</Text>
        <Text>Telefoonnummer: {booking.phoneNumber}</Text>
        <View style={styles.spacer} />
        <Text>{booking.extra}</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.table}>
        <View>
          <Text style={styles.header}>Kamer</Text>
          <Text>{room.name}</Text>
        </View>
        <View>
          <Text style={styles.header}>Prijs per nacht</Text>
          <Text>{currency(pricePerNight)}</Text>
        </View>
        <View>
          <Text style={styles.header}>Nachten</Text>
          <Text>{`${nights} (${booking.date?.[0].toLocaleDateString(
            'nl-NL',
          )} - ${booking.date?.[1].toLocaleDateString('nl-NL')})`}</Text>
        </View>
        <View>
          <Text style={styles.header}>Totaal excl. Btw</Text>
          <Text>{currency(totalWithoutVat)}</Text>
        </View>
        <View>
          <Text style={styles.header}>BTW</Text>
          <Text>{`${currency(vat)} (${vatPercentage}%)`}</Text>
        </View>
        <View>
          <Text style={styles.header}>Total</Text>
          <Text>{currency(total)}</Text>
        </View>
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
  btw: number;
  name: string;
  secondName: string | null;
  email: string;
  phoneNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  priceOverride: number | null;
  extra: string | null;
}

const Booking: FC<BookingProps> = ({ booking, closeHandler }) => {
  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    COLLECTIONS.SETTINGS,
  );

  const settings = useMemo(() => settingsArray && settingsArray[0], [settingsArray]);

  const { documents: rooms } = useFirestoreDocuments<FireStoreRoomInterface>(
    COLLECTIONS.ROOMS,
  );

  const form = useForm<FormData>({
    initialValues: booking
      ? {
          date: [booking.start, booking.end],
          room: 'room' in booking ? JSON.stringify(booking.room) : null,
          notes: 'notes' in booking ? booking.notes : '',
          btw: 'btw' in booking ? booking.btw : 9,
          name: 'name' in booking ? booking.name : '',
          secondName: 'secondName' in booking ? booking.secondName : null,
          email: 'email' in booking ? booking.email : '',
          phoneNumber: 'phoneNumber' in booking ? booking.phoneNumber : '',
          street: 'street' in booking ? booking.street : '',
          houseNumber: 'houseNumber' in booking ? booking.houseNumber : '',
          postalCode: 'postalCode' in booking ? booking.postalCode : '',
          city: 'city' in booking ? booking.city : '',
          priceOverride:
            'priceOverride' in booking && !!booking.priceOverride
              ? booking.priceOverride
              : null,
          extra: 'extra' in booking ? booking.extra : null,
        }
      : {
          date: null,
          room: null,
          notes: '',
          btw: 9,
          name: '',
          secondName: null,
          email: '',
          phoneNumber: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          priceOverride: null,
          extra: null,
        },
  });

  const submitHandler = useCallback(
    async (values: FormData) => {
      const { date, room, priceOverride } = values;

      // @ts-ignore
      delete values.date;

      const bookingToSend = {
        ...values,
        start: date?.[0] && Timestamp.fromDate(date[0]),
        end: date?.[1] && Timestamp.fromDate(date[1]),
        room: room ? JSON.parse(room) : booking && 'room' in booking && booking.room,
        priceOverride: priceOverride ?? 0,
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

  const pricePerNight = useMemo(
    () => form.values.priceOverride ?? room?.price,
    [form.values.priceOverride, room],
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

  const totalWithoutVat = useMemo(
    () => Math.round(pricePerNight * nights * 100) / 100,
    [pricePerNight, nights],
  );

  const vat = useMemo(
    () => Math.round(totalWithoutVat * form.values.btw) / 100,
    [totalWithoutVat, form.values.btw],
  );

  const total = useMemo(() => totalWithoutVat + vat, [totalWithoutVat, vat]);

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <DateRangePicker
        required
        label="Datum"
        placeholder="Datum"
        {...form.getInputProps('date')}
      />
      <Select
        required={!(booking && 'room' in booking)}
        label="Kamer"
        placeholder="Kamer"
        searchable
        data={roomSelectData ?? []}
        {...form.getInputProps('room')}
      />
      <Select
        required
        label="Btw percentage"
        placeholder="Btw percentage"
        defaultValue="9"
        data={[
          {
            label: '0%',
            value: '0',
          },
          {
            label: '9%',
            value: '9',
          },
          {
            label: '21%',
            value: '21',
          },
        ]}
        {...form.getInputProps('btw')}
      />
      <Textarea
        label="Opmerkingen"
        placeholder="Opmerkingen"
        {...form.getInputProps('notes')}
      />
      <Title order={2}>Klantgegevens</Title>
      <Group grow>
        <TextInput
          required
          label="Naam"
          placeholder="Naam"
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Tweede naam"
          placeholder="Tweede naam"
          {...form.getInputProps('secondName')}
        />
      </Group>
      <Group grow>
        <TextInput
          required
          type="email"
          label="E-mail"
          placeholder="E-mail"
          {...form.getInputProps('email')}
        />
        <TextInput
          required
          type="tel"
          label="Telefoonnummer"
          placeholder="Telefoonnummer"
          {...form.getInputProps('phoneNumber')}
        />
      </Group>
      <Group grow>
        <TextInput
          required
          label="Straat"
          placeholder="Straat"
          {...form.getInputProps('street')}
        />
        <TextInput
          required
          label="Huisnummer"
          placeholder="Huisnummer"
          {...form.getInputProps('houseNumber')}
        />
      </Group>
      <Group grow>
        <TextInput
          required
          label="Postcode"
          placeholder="Postcode"
          {...form.getInputProps('postalCode')}
        />
        <TextInput
          required
          label="Plaats"
          placeholder="Plaats"
          {...form.getInputProps('city')}
        />
      </Group>
      <Group grow>
        <NumberInput
          min={0}
          noClampOnBlur
          decimalSeparator=","
          icon="€"
          label="Aangepaste prijs"
          placeholder="Prijs per nacht"
          {...form.getInputProps('priceOverride')}
        />
        <TextInput label="Extra" placeholder="Extra" {...form.getInputProps('extra')} />
      </Group>
      <Group mt={16}>
        <Button type="submit">Opslaan</Button>
        {booking && 'id' in booking && (
          <Button color="red" onClick={deleteHandler}>
            Verwijderen
          </Button>
        )}
      </Group>
      {booking &&
        'id' in booking &&
        form.values.date &&
        settings &&
        !!form.values.date[0] &&
        !!form.values.date[1] && (
          <div>
            <Title my={16} order={2}>
              Bon
            </Title>
            <Table>
              <thead>
                <tr>
                  <th>Kamer</th>
                  <th>Prijs per nacht</th>
                  <th>Nachten</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{room.name}</td>
                  <td>{currency(pricePerNight)}</td>
                  <td>{nights}</td>
                </tr>
              </tbody>
            </Table>
            <p>{`Totaal excl. Btw: ${currency(totalWithoutVat)}`}</p>
            <p>{`BTW: ${currency(vat)} (${form.values.btw}%)`}</p>
            <p>{`Totaal: ${currency(total)}`}</p>

            <PDFDownloadLink
              document={
                <Receipt
                  settings={settings}
                  booking={form.values}
                  room={room}
                  nights={nights}
                  pricePerNight={pricePerNight}
                  totalWithoutVat={totalWithoutVat}
                  vat={vat}
                  vatPercentage={form.values.btw}
                  total={total}
                />
              }
              fileName={`Bon (${form.values.date[0].toLocaleDateString(
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
