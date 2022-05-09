import 'dayjs/locale/nl';

import {
  Button,
  Group,
  NumberInput,
  ScrollArea,
  Select,
  Stepper,
  Table,
  Textarea,
} from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import pdf from '@react-pdf/renderer';
import dayjs from 'dayjs';
import firebase from 'firebase/compat';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { BookingInterface, NewBookingInterface } from '../../interfaces/Booking';
import { firestore } from '../../lib/firebase';
import Logo from '../../logo.jpg';
import Timestamp = firebase.firestore.Timestamp;
import { useNotifications } from '@mantine/notifications';

import { CustomerInterface } from '../../interfaces/Customer';
import { FireStoreRoomInterface } from '../../interfaces/Room';
import { SettingsInterface } from '../../interfaces/Settings';
import currency from '../../utils/currency';
import getInvoiceNumber from '../../utils/invoiceNumber';

const { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } = pdf;

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    flexDirection: 'column',
  },
  container: {
    padding: '16px 32px 32px 32px',
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
  image: {
    marginBottom: 10,
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
  cleaningFee,
  cleaningFeeVat,
  cleaningFeeVatPercentage,
  totalCleaningFee,
  parkingFee,
  parkingFeeVat,
  parkingFeeVatPercentage,
  totalParkingFee,
  totalNights,
  total,
  totalMinusVat,
  totalVat,
}: {
  room: FireStoreRoomInterface;
  booking: FormData;
  nights: number;
  pricePerNight: number;
  settings: SettingsInterface;
  totalWithoutVat: number;
  vat: number;
  vatPercentage: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  cleaningFeeVatPercentage: number;
  totalCleaningFee: number;
  parkingFee: number;
  parkingFeeVat: number;
  parkingFeeVatPercentage: number;
  totalParkingFee: number;
  totalNights: number;
  total: number;
  totalMinusVat: number;
  totalVat: number;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={Logo} style={styles.image} />
        <View style={styles.container}>
          <View style={styles.settingsContainer}>
            <Text>Factuurnummer: {booking.invoiceNumber}</Text>
            <Text>
              Datum: {booking.invoiceDate?.toDate().toLocaleDateString('nl-NL')}
            </Text>
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
            <Text>{booking.customer.name}</Text>
            <Text>{booking.customer.secondName}</Text>
            <Text>
              {booking.customer.street} {booking.customer.houseNumber}
            </Text>
            <Text>
              {booking.customer.postalCode} {booking.customer.city}
            </Text>
            <View style={styles.spacer} />
            <Text>E-mail: {booking.customer.email}</Text>
            <Text>Telefoonnummer: {booking.customer.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>{booking.customer.extra}</Text>
            <View style={styles.spacer} />
          </View>
          <View style={styles.table}>
            <View>
              <Text style={styles.header}>Dienst</Text>
              <Text>{room.name}</Text>
              {cleaningFee ? <Text>Schoonmaakkosten</Text> : <Text />}
              {parkingFee ? <Text>Parkeerkosten</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Prijs per stuk</Text>
              <Text>{currency(pricePerNight)}</Text>
              {cleaningFee ? <Text>{currency(cleaningFee)}</Text> : <Text />}
              {parkingFee ? <Text>{currency(parkingFee)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Aantal</Text>
              <Text>{`${nights} (${booking.date?.[0].toLocaleDateString(
                'nl-NL',
              )} - ${booking.date?.[1].toLocaleDateString('nl-NL')})`}</Text>
              {cleaningFee ? <Text>1</Text> : <Text />}
              {parkingFee ? <Text>1</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Totaal excl. Btw</Text>
              <Text>{currency(totalWithoutVat)}</Text>
              {cleaningFee ? <Text>{currency(cleaningFee)}</Text> : <Text />}
              {parkingFee ? <Text>{currency(parkingFee)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>BTW</Text>
              <Text>{`${currency(vat)} (${vatPercentage}%${
                vatPercentage == 0 ? ' / Verlegd' : ''
              })`}</Text>
              {cleaningFee ? (
                <Text>{`${currency(cleaningFeeVat)} (${cleaningFeeVatPercentage}%${
                  cleaningFeeVatPercentage == 0 ? ' / Verlegd' : ''
                })`}</Text>
              ) : (
                <Text />
              )}
              {parkingFee ? (
                <Text>{`${currency(parkingFeeVat)} (${parkingFeeVatPercentage}%${
                  parkingFeeVatPercentage == 0 ? ' / Verlegd' : ''
                })`}</Text>
              ) : (
                <Text />
              )}
            </View>
            <View>
              <Text style={styles.header}>Totaal</Text>
              <Text>{currency(totalNights)}</Text>
              {cleaningFee ? <Text>{currency(totalCleaningFee)}</Text> : <Text />}
              {parkingFee ? <Text>{currency(totalParkingFee)}</Text> : <Text />}
            </View>
          </View>
          <View style={styles.spacer} />
          <Text>Totaal excl. Btw: {currency(totalMinusVat)}</Text>
          <Text>Totaal Btw: {currency(totalVat)}</Text>
          <Text>Totaal: {currency(total)}</Text>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
          <Text>
            Wij verzoeken u vriendelijk het bedrag binnen 14 dagen over te maken.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

interface BookingProps {
  booking?: BookingInterface | NewBookingInterface;
  closeHandler: () => void;
}

interface FormData {
  date: [Date, Date] | null;
  room: string | null;
  btw: number;
  cleaningFee: number;
  cleaningFeeVat: number;
  parkingFee: number;
  parkingFeeVat: number;
  customer: any;
  priceOverride: number | null;
  notes: string;
  invoiceNumber: string;
  invoiceDate: Timestamp;
}

const Booking: FC<BookingProps> = ({ booking, closeHandler }) => {
  const isBookingCreated = useMemo(() => booking && 'id' in booking, [booking]);
  const [active, setActive] = useState(isBookingCreated ? 1 : 0);
  const nextStep = () => setActive((current) => current + 1);
  const prevStep = () => setActive((current) => current - 1);
  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    COLLECTIONS.SETTINGS,
    true,
  );

  const settings = useMemo<SettingsInterface>(
    // @ts-ignore
    () => settingsArray && settingsArray[0],
    [settingsArray],
  );

  const notifications = useNotifications();

  const { documents: rooms } = useFirestoreDocuments<FireStoreRoomInterface>(
    COLLECTIONS.ROOMS,
  );
  const { documents: customers } = useFirestoreDocuments<CustomerInterface>(
    COLLECTIONS.CUSTOMERS,
  );

  const form = useForm<FormData>({
    // @ts-ignore
    initialValues: booking
      ? {
          invoiceDate: 'invoiceDate' in booking ? booking.invoiceDate : null,
          invoiceNumber: 'invoiceNumber' in booking ? booking.invoiceNumber : null,
          date: [booking.start, booking.end],
          room: 'room' in booking ? JSON.stringify(booking.room) : null,
          btw: 'btw' in booking ? booking.btw : 9,
          cleaningFee: 'cleaningFee' in booking ? booking.cleaningFee : null,
          cleaningFeeVat: 'cleaningFeeVat' in booking ? booking.cleaningFeeVat : 21,
          parkingFee: 'parkingFee' in booking ? booking.parkingFee : null,
          parkingFeeVat: 'parkingFeeVat' in booking ? booking.parkingFeeVat : 21,
          customer: 'customer' in booking ? JSON.stringify(booking.customer) : null,
          priceOverride:
            'priceOverride' in booking && !!booking.priceOverride
              ? booking.priceOverride
              : null,
          notes: 'notes' in booking ? booking.notes : '',
        }
      : {
          date: null,
          room: null,
          btw: 9,
          cleaningFee: null,
          cleaningFeeVat: 21,
          parkingFee: null,
          parkingFeeVat: 21,
          customer: null,
          priceOverride: null,
          notes: '',
        },
  });

  const submitHandler = useCallback(
    async (values: FormData) => {
      const { date, room, priceOverride, cleaningFee, parkingFee, customer } = values;

      const bookingToSend = {
        ...values,
        start: date?.[0] && Timestamp.fromDate(date[0]),
        end: date?.[1] && Timestamp.fromDate(date[1]),
        room: room ? JSON.parse(room) : booking && 'room' in booking && booking.room,
        customer: customer
          ? JSON.parse(customer)
          : booking && 'customer' in booking && booking.customer,
        priceOverride: priceOverride ?? 0,
        cleaningFee: cleaningFee ?? 0,
        parkingFee: parkingFee ?? 0,
      };

      if (booking && 'id' in booking)
        await setDoc(doc(firestore, COLLECTIONS.BOOKINGS, booking.id), bookingToSend);
      else {
        await addDoc(collection(firestore, COLLECTIONS.BOOKINGS), {
          ...bookingToSend,
          invoiceNumber: getInvoiceNumber(settings.invoices),
          invoiceDate: Timestamp.fromDate(new Date()),
        });
        await setDoc(doc(firestore, COLLECTIONS.SETTINGS, settings.id), {
          ...settings,
          invoices: settings.invoices ? settings.invoices + 1 : 1,
        });
      }

      isBookingCreated ? setActive(1) : closeHandler();

      notifications.showNotification({
        color: 'green',
        message: 'Opgeslagen',
      });
    },
    [booking, closeHandler, settings],
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

  const customerSelectData = useMemo(
    () =>
      customers?.map((customer) => ({
        value: JSON.stringify(customer),
        label: customer.name,
      })),
    [customers],
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

    if (customers && booking && 'customer' in booking) {
      const customer = customerSelectData?.find(({ value }) => {
        const { name, email } = JSON.parse(value) as CustomerInterface;
        return name === booking.customer.name && email === booking.customer.email;
      })?.value;

      if (customer) form.setFieldValue('customer', customer);
    }
  }, [rooms, customers]);

  const totalWithoutVat = useMemo(
    () => Math.round(pricePerNight * nights * 100) / 100,
    [pricePerNight, nights],
  );

  const vat = useMemo(
    () => Math.round(totalWithoutVat * form.values.btw) / 100,
    [totalWithoutVat, form.values.btw],
  );

  const totalNights = useMemo(() => totalWithoutVat + vat, [totalWithoutVat, vat]);

  const cleaningFeeVat = useMemo(
    () =>
      form.values.cleaningFee
        ? Math.round(form.values.cleaningFee * form.values.cleaningFeeVat) / 100
        : 0,
    [form.values.cleaningFee, form.values.cleaningFeeVat],
  );

  const totalCleaningFee = useMemo(
    () => (form.values.cleaningFee ? form.values.cleaningFee + cleaningFeeVat : 0),
    [form.values.cleaningFee, cleaningFeeVat],
  );

  const parkingFeeVat = useMemo(
    () =>
      form.values.parkingFee
        ? Math.round(form.values.parkingFee * form.values.parkingFeeVat) / 100
        : 0,
    [form.values.parkingFee, form.values.parkingFeeVat],
  );

  const totalParkingFee = useMemo(
    () => (form.values.parkingFee ? form.values.parkingFee + parkingFeeVat : 0),
    [form.values.parkingFee, parkingFeeVat],
  );

  const total = useMemo(
    () => totalNights + totalCleaningFee + totalParkingFee,
    [totalNights, totalCleaningFee],
  );

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm">
        <Stepper.Step label="Details" allowStepSelect={false}>
          <DateRangePicker
            required
            label="Datum"
            locale="nl"
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
                label: '0% / Verlegd',
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
          <NumberInput
            min={0}
            noClampOnBlur
            decimalSeparator=","
            icon="€"
            label="Schoonmaakkosten"
            placeholder="Schoonmaakkosten"
            {...form.getInputProps('cleaningFee')}
          />
          {!!form.values.cleaningFee && (
            <Select
              label="Schoonmaakkosten Btw percentage"
              placeholder="Schoonmaakkosten Btw percentage"
              defaultValue="21"
              data={[
                {
                  label: '0% / Verlegd',
                  value: '0',
                },
                {
                  label: '21%',
                  value: '21',
                },
              ]}
              {...form.getInputProps('cleaningFeeVat')}
            />
          )}
          <NumberInput
            min={0}
            noClampOnBlur
            decimalSeparator=","
            icon="€"
            label="Parkeerkosten"
            placeholder="Parkeerkosten"
            {...form.getInputProps('parkingFee')}
          />
          {!!form.values.parkingFee && (
            <Select
              label="Parkeerkosten Btw percentage"
              placeholder="Parkeerkosten Btw percentage"
              defaultValue="21"
              data={[
                {
                  label: '0% / Verlegd',
                  value: '0',
                },
                {
                  label: '21%',
                  value: '21',
                },
              ]}
              {...form.getInputProps('parkingFeeVat')}
            />
          )}
          <Select
            required={!(booking && 'customer' in booking)}
            label="Klant"
            placeholder="Klant"
            searchable
            data={customerSelectData ?? []}
            {...form.getInputProps('customer')}
          />
          <NumberInput
            min={0}
            noClampOnBlur
            decimalSeparator=","
            icon="€"
            label="Aangepaste prijs"
            placeholder="Prijs per nacht"
            {...form.getInputProps('priceOverride')}
          />
          <Textarea
            label="Opmerkingen"
            placeholder="Opmerkingen"
            {...form.getInputProps('notes')}
          />
        </Stepper.Step>
        {booking &&
          'id' in booking &&
          form.values.date &&
          settings &&
          !!form.values.date[0] &&
          !!form.values.date[1] && (
            <Stepper.Step label="Bon" allowStepSelect={false}>
              <ScrollArea
                style={{
                  maxWidth: '75vw',
                }}
              >
                <Table
                  style={{
                    minWidth: 600,
                  }}
                >
                  <thead>
                    <tr>
                      <th>Dienst</th>
                      <th>Prijs per stuk</th>
                      <th>Aantal</th>
                      <th>Totaal excl. Btw</th>
                      <th>BTW</th>
                      <th>Totaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{room.name}</td>
                      <td>{currency(pricePerNight)}</td>
                      <td>{nights}</td>
                      <td>{currency(totalWithoutVat)}</td>
                      <td>{`${currency(vat)} (${form.values.btw}%${
                        form.values.btw == 0 ? ' / Verlegd' : ''
                      })`}</td>
                      <td>{currency(totalNights)}</td>
                    </tr>
                    {!!form.values.cleaningFee && (
                      <tr>
                        <td>Schoonmaakkosten</td>
                        <td>{currency(form.values.cleaningFee)}</td>
                        <td>1</td>
                        <td>{currency(form.values.cleaningFee)}</td>
                        <td>{`${currency(cleaningFeeVat)} (${
                          form.values.cleaningFeeVat
                        }%${form.values.cleaningFeeVat == 0 ? ' / Verlegd' : ''})`}</td>
                        <td>{currency(form.values.cleaningFee + cleaningFeeVat)}</td>
                      </tr>
                    )}
                    {!!form.values.parkingFee && (
                      <tr>
                        <td>Parkeerkosten</td>
                        <td>{currency(form.values.parkingFee)}</td>
                        <td>1</td>
                        <td>{currency(form.values.parkingFee)}</td>
                        <td>{`${currency(parkingFeeVat)} (${form.values.parkingFeeVat}%${
                          form.values.parkingFeeVat == 0 ? ' / Verlegd' : ''
                        })`}</td>
                        <td>{currency(form.values.parkingFee + parkingFeeVat)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
              <p>{`Totaal: ${currency(total)}`}</p>
              <PDFDownloadLink
                document={
                  <Receipt
                    settings={settings}
                    booking={{
                      ...form.values,
                      invoiceNumber: booking.invoiceNumber,
                      // @ts-ignore
                      invoiceDate: booking.invoiceDate,
                      customer: booking.customer,
                    }}
                    room={room}
                    nights={nights}
                    pricePerNight={pricePerNight}
                    totalWithoutVat={totalWithoutVat}
                    vat={vat}
                    vatPercentage={form.values.btw}
                    totalNights={totalNights}
                    cleaningFee={form.values.cleaningFee}
                    cleaningFeeVat={cleaningFeeVat}
                    cleaningFeeVatPercentage={form.values.cleaningFeeVat}
                    totalCleaningFee={totalCleaningFee}
                    parkingFee={form.values.parkingFee}
                    parkingFeeVat={parkingFeeVat}
                    parkingFeeVatPercentage={form.values.parkingFeeVat}
                    totalParkingFee={totalParkingFee}
                    total={total}
                    totalMinusVat={
                      totalWithoutVat +
                      (form.values.cleaningFee ?? 0) +
                      (form.values.parkingFee ?? 0)
                    }
                    totalVat={vat + cleaningFeeVat + parkingFeeVat}
                  />
                }
                fileName={`${booking.invoiceNumber} - ${booking.customer.name}`}
              >
                <Button>Download PDF</Button>
              </PDFDownloadLink>
            </Stepper.Step>
          )}
      </Stepper>
      <Group mt={16}>
        {active > 0 && (
          <Button onClick={prevStep} variant="outline">
            Bewerken
          </Button>
        )}

        {isBookingCreated && (
          <Button color="red" onClick={deleteHandler}>
            Verwijderen
          </Button>
        )}

        {active === 0 && form.values.room && form.values.customer && (
          <Button type="submit">Opslaan</Button>
        )}
      </Group>
    </form>
  );
};

export default Booking;
