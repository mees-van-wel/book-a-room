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
  TextInput,
} from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import pdf from '@react-pdf/renderer';
import dayjs from 'dayjs';
import firebase from 'firebase/compat';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import LocalResidenceFooter from '../../footer-local-residence.jpg';
import LocalResidenceHeader from '../../header-local-residence.jpg';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { BookingInterface, NewBookingInterface } from '../../interfaces/Booking';
import { firestore } from '../../lib/firebase';
import LongStayBredaHeader from '../../logo.jpg';
import Timestamp = firebase.firestore.Timestamp;
import { useNotifications } from '@mantine/notifications';
import isBetween from 'dayjs/plugin/isBetween';

import { CustomerInterface } from '../../interfaces/Customer';
import { FireStoreRoomInterface } from '../../interfaces/Room';
import { SettingsInterface } from '../../interfaces/Settings';
import currency from '../../utils/currency';
import getInvoiceNumber from '../../utils/invoiceNumber';
dayjs.extend(isBetween);

const { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } = pdf;

const calcVat = (price: number, vat: number) =>
  Math.round((price / (100 + vat)) * vat * 100) / 100;
const calcTotalWithoutVat = (price: number, vat: number) =>
  Math.round((price - vat) * 100) / 100;
const calcNights = (end: Date, start: Date) => dayjs(end).diff(start, 'days');

const compareDates = (firstDate: Date, secondDate: Date) => {
  return (
    firstDate.getDate() == secondDate.getDate() &&
    firstDate.getMonth() == secondDate.getMonth() &&
    firstDate.getFullYear() == secondDate.getFullYear()
  );
};

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
  touristTax,
  touristTaxTotal,
  totalNights,
  total,
  totalMinusVat,
  totalVat,
  isLastInvoice,
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
  touristTax: number;
  touristTaxTotal: number;
  totalNights: number;
  total: number;
  totalMinusVat: number;
  totalVat: number;
  isLastInvoice: boolean;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/*<Image src={LocalResidenceHeader} />*/}
        <Image src={LongStayBredaHeader} />
        <View style={styles.container}>
          <View style={styles.settingsContainer}>
            <Text>Invoice number: {booking.invoiceNumber}</Text>
            <Text>Date: {booking.invoiceDate?.toDate().toLocaleDateString('nl-NL')}</Text>
            <View style={styles.line} />
            <Text>{settings.companyName}</Text>
            <Text>
              {settings.street} {settings.houseNumber}
            </Text>
            <Text>
              {settings.postalCode} {settings.city}
            </Text>
            <View style={styles.spacer} />
            <Text>Email: {settings.email}</Text>
            <Text>Telephone number: {settings.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>Chamber of Commerce number: {settings.kvkNumber}</Text>
            <Text>VAT number: {settings.btwNumber}</Text>
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
            <Text>Email: {booking.customer.email}</Text>
            <Text>Telephone number: {booking.customer.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>{booking.customer.extra}</Text>
            <Text>{booking.extraOne}</Text>
            <Text>{booking.extraTwo}</Text>
            <View style={styles.spacer} />
          </View>
          <View style={styles.table}>
            <View>
              <Text style={styles.header}>Service</Text>
              <Text>{room.name}</Text>
              {cleaningFee && isLastInvoice ? <Text>Cleaning fee</Text> : <Text />}
              {parkingFee ? <Text>Parking costs</Text> : <Text />}
              {touristTax ? <Text>Tourist tax</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Unit price</Text>
              <Text>{currency(pricePerNight)}</Text>
              {cleaningFee && isLastInvoice ? (
                <Text>{currency(cleaningFee)}</Text>
              ) : (
                <Text />
              )}
              {parkingFee ? <Text>{currency(parkingFee)}</Text> : <Text />}
              {touristTax ? <Text>{currency(touristTax)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Amount</Text>
              <Text>{`${nights} (${booking.date?.[0].toLocaleDateString(
                'nl-NL',
              )} - ${booking.date?.[1].toLocaleDateString('nl-NL')})`}</Text>
              {cleaningFee && isLastInvoice ? <Text>1</Text> : <Text />}
              {parkingFee ? <Text>{nights}</Text> : <Text />}
              {touristTax ? <Text>{nights}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total excluding VAT</Text>
              <Text>{currency(totalWithoutVat)}</Text>
              {cleaningFee && isLastInvoice ? (
                <Text>{currency(totalCleaningFee - cleaningFeeVat)}</Text>
              ) : (
                <Text />
              )}
              {parkingFee ? (
                <Text>{currency(totalParkingFee - parkingFeeVat)}</Text>
              ) : (
                <Text />
              )}
              {touristTax ? <Text>{currency(touristTaxTotal)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>VAT</Text>
              <Text>{`${currency(vat)} (${vatPercentage}%${
                vatPercentage == 0 ? ' / Verlegd' : ''
              })`}</Text>
              {cleaningFee && isLastInvoice ? (
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
              {touristTax ? <Text>{`${currency(0)} (0%)`}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total</Text>
              <Text>{currency(totalNights)}</Text>
              {cleaningFee && isLastInvoice ? (
                <Text>{currency(totalCleaningFee)}</Text>
              ) : (
                <Text />
              )}
              {parkingFee ? <Text>{currency(totalParkingFee)}</Text> : <Text />}
              {touristTax ? <Text>{currency(touristTaxTotal)}</Text> : <Text />}
            </View>
          </View>
          <View style={styles.spacer} />
          <Text>Total excluding VAT: {currency(totalMinusVat)}</Text>
          <Text>Total VAT: {currency(totalVat)}</Text>
          <Text>
            Total:{' '}
            {currency(
              totalNights +
                (isLastInvoice && totalCleaningFee ? totalCleaningFee : 0) +
                (totalParkingFee ?? 0) +
                (touristTaxTotal ?? 0),
            )}
          </Text>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
          <Text>We kindly request that you transfer the amount due within 14 days.</Text>
        </View>
        {/*<Image src={LocalResidenceFooter} />*/}
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
  touristTax: number;
  customer: any;
  priceOverride: number | null;
  notes: string;
  invoiceNumber: string;
  invoiceDate: Timestamp;
  extraOne: string | null;
  extraTwo: string | null;
}

const Booking: FC<BookingProps> = ({ booking, closeHandler }) => {
  const isBookingCreated = useMemo(() => booking && 'id' in booking, [booking]);
  const [invoicePeriod, setInvoicePeriod] = useState(undefined);
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
          touristTax: 'touristTax' in booking ? booking.touristTax : null,
          customer: 'customer' in booking ? JSON.stringify(booking.customer) : null,
          priceOverride:
            'priceOverride' in booking && !!booking.priceOverride
              ? booking.priceOverride
              : null,
          notes: 'notes' in booking ? booking.notes : '',
          extraOne: 'extraOne' in booking ? booking.extraOne : '',
          extraTwo: 'extraTwo' in booking ? booking.extraTwo : '',
        }
      : {
          date: null,
          room: null,
          btw: 9,
          cleaningFee: null,
          cleaningFeeVat: 21,
          parkingFee: null,
          parkingFeeVat: 21,
          touristTax: null,
          customer: null,
          priceOverride: null,
          notes: '',
          extraOne: '',
          extraTwo: '',
        },
  });

  const submitHandler = useCallback(
    async (values: FormData) => {
      const { date, room, priceOverride, cleaningFee, parkingFee, touristTax, customer } =
        values;

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
        touristTax: touristTax ?? 0,
      };

      if (booking && 'id' in booking)
        await setDoc(doc(firestore, COLLECTIONS.BOOKINGS, booking.id), bookingToSend);
      else await addDoc(collection(firestore, COLLECTIONS.BOOKINGS), bookingToSend);

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
      rooms
        ?.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .map((room) => ({
          value: JSON.stringify(room),
          label: room.name,
        })),
    [rooms],
  );

  const customerSelectData = useMemo(
    () =>
      customers
        ?.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .map((customer) => ({
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
    () => (form.values.date ? calcNights(form.values.date[1], form.values.date[0]) : 0),
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

    if (customers && booking && 'customer' in booking) {
      const customer = customerSelectData?.find(({ value }) => {
        const { name, email } = JSON.parse(value) as CustomerInterface;
        return name === booking.customer.name && email === booking.customer.email;
      })?.value;

      if (customer) form.setFieldValue('customer', customer);
    }
  }, [rooms, customers]);

  const roomPrice = useMemo(
    () => form.values.priceOverride ?? room?.price,
    [form.values.priceOverride, room],
  );

  const roomTotal = useMemo(
    () => Math.round(roomPrice * nights * 100) / 100,
    [roomPrice, nights],
  );

  const roomVat = useMemo(
    () => calcVat(roomTotal, form.values.btw),
    [roomTotal, form.values.btw],
  );

  const roomTotalWithoutVat = useMemo(
    () => calcTotalWithoutVat(roomTotal, roomVat),
    [roomTotal, roomVat],
  );

  const roomWithoutVat = useMemo(
    () => Math.round((roomTotalWithoutVat / nights) * 100) / 100,
    [roomTotalWithoutVat, nights],
  );

  const cleaningFeeVat = useMemo(
    () => calcVat(form.values.cleaningFee ?? 0, form.values.cleaningFeeVat),
    [form.values.cleaningFee, form.values.cleaningFeeVat],
  );

  const cleaningFeeWithoutVat = useMemo(
    () => calcTotalWithoutVat(form.values.cleaningFee ?? 0, cleaningFeeVat),
    [form.values.cleaningFee, cleaningFeeVat],
  );

  const parkingFeeVat = useMemo(
    () => calcVat(form.values.parkingFee ?? 0, form.values.parkingFeeVat),
    [form.values.parkingFee, form.values.parkingFeeVat],
  );

  const parkingFeeWithoutVat = useMemo(
    () => calcTotalWithoutVat(form.values.parkingFee ?? 0, parkingFeeVat),
    [form.values.parkingFee, parkingFeeVat],
  );

  const touristTax = useMemo(
    () => Math.round((form.values.touristTax ?? 0) * nights * 100) / 100,
    [form.values.touristTax, nights],
  );

  const total = useMemo(
    () =>
      roomTotal +
      (form.values.cleaningFee ?? 0) +
      (form.values.parkingFee ?? 0) +
      (touristTax ?? 0),
    [roomTotal, form.values.cleaningFee, form.values.parkingFee, touristTax],
  );

  const createInvoice = useCallback(async () => {
    if (settings && invoicePeriod?.[1])
      await setDoc(doc(firestore, COLLECTIONS.SETTINGS, settings.id), {
        ...settings,
        invoices: settings.invoices ? settings.invoices + 1 : 1,
      });

    if (booking && invoicePeriod) {
      const { date, room, priceOverride, cleaningFee, parkingFee, touristTax, customer } =
        form.values;

      const bookingToSend = {
        ...form.values,
        invoices: booking.invoices
          ? [
              ...booking.invoices,
              {
                number: getInvoiceNumber(settings.invoices),
                date: Timestamp.fromDate(new Date()),
                start: Timestamp.fromDate(invoicePeriod[0]),
                end: Timestamp.fromDate(invoicePeriod[1]),
              },
            ]
          : [
              {
                number: getInvoiceNumber(settings.invoices),
                date: Timestamp.fromDate(new Date()),
                start: Timestamp.fromDate(invoicePeriod[0]),
                end: Timestamp.fromDate(invoicePeriod[1]),
              },
            ],
        start: date?.[0] && Timestamp.fromDate(date[0]),
        end: date?.[1] && Timestamp.fromDate(date[1]),
        room: room ? JSON.parse(room) : booking && 'room' in booking && booking.room,
        customer: customer
          ? JSON.parse(customer)
          : booking && 'customer' in booking && booking.customer,
        priceOverride: priceOverride ?? 0,
        cleaningFee: cleaningFee ?? 0,
        parkingFee: parkingFee ?? 0,
        touristTax: touristTax ?? 0,
      };

      await setDoc(doc(firestore, COLLECTIONS.BOOKINGS, booking.id), bookingToSend);
    }

    setInvoicePeriod(undefined);
    closeHandler();
  }, [form.values, setInvoicePeriod, settings, booking, invoicePeriod, closeHandler]);

  const deleteInvoice = useCallback(
    async (index) => {
      if (booking) {
        const {
          date,
          room,
          priceOverride,
          cleaningFee,
          parkingFee,
          touristTax,
          customer,
        } = form.values;

        const bookingToSend = {
          ...form.values,
          invoices: booking?.invoices?.filter((invoice, i) => i !== index),
          start: date?.[0] && Timestamp.fromDate(date[0]),
          end: date?.[1] && Timestamp.fromDate(date[1]),
          room: room ? JSON.parse(room) : booking && 'room' in booking && booking.room,
          customer: customer
            ? JSON.parse(customer)
            : booking && 'customer' in booking && booking.customer,
          priceOverride: priceOverride ?? 0,
          cleaningFee: cleaningFee ?? 0,
          parkingFee: parkingFee ?? 0,
          touristTax: touristTax ?? 0,
        };

        await setDoc(doc(firestore, COLLECTIONS.BOOKINGS, booking.id), bookingToSend);
      }

      closeHandler();
    },
    [booking, form.values, closeHandler],
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
          <NumberInput
            min={0}
            noClampOnBlur
            decimalSeparator=","
            icon="€"
            label="Toeristenbelasting per nacht"
            placeholder="Toeristenbelasting per nacht"
            {...form.getInputProps('touristTax')}
          />
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
          <TextInput
            label="Extra 1"
            placeholder="Extra 1"
            {...form.getInputProps('extraOne')}
          />
          <TextInput
            label="Extra 2"
            placeholder="Extra 2"
            {...form.getInputProps('extraTwo')}
          />
        </Stepper.Step>
        {booking &&
          'id' in booking &&
          form.values.date &&
          settings &&
          !!form.values.date[0] &&
          !!form.values.date[1] && (
            <Stepper.Step label="Bon" allowStepSelect={false}>
              {form.values.notes && <Text>Opmerkingen: {form.values.notes}</Text>}
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
                      <td>{currency(roomWithoutVat)}</td>
                      <td>{nights}</td>
                      <td>{currency(roomTotalWithoutVat)}</td>
                      <td>{`${currency(roomVat)} (${form.values.btw}%${
                        form.values.btw == 0 ? ' / Verlegd' : ''
                      })`}</td>
                      <td>{currency(roomTotal)}</td>
                    </tr>
                    {!!form.values.cleaningFee && (
                      <tr>
                        <td>Schoonmaakkosten</td>
                        <td>{currency(cleaningFeeWithoutVat)}</td>
                        <td>1</td>
                        <td>{currency(cleaningFeeWithoutVat)}</td>
                        <td>{`${currency(cleaningFeeVat)} (${
                          form.values.cleaningFeeVat
                        }%${form.values.cleaningFeeVat == 0 ? ' / Verlegd' : ''})`}</td>
                        <td>{currency(form.values.cleaningFee)}</td>
                      </tr>
                    )}
                    {!!form.values.parkingFee && (
                      <tr>
                        <td>Parkeerkosten</td>
                        <td>{currency(parkingFeeWithoutVat / nights)}</td>
                        <td>{nights}</td>
                        <td>{currency(parkingFeeWithoutVat)}</td>
                        <td>{`${currency(parkingFeeVat)} (${form.values.parkingFeeVat}%${
                          form.values.parkingFeeVat == 0 ? ' / Verlegd' : ''
                        })`}</td>
                        <td>{currency(form.values.parkingFee)}</td>
                      </tr>
                    )}
                    {!!form.values.touristTax && (
                      <tr>
                        <td>Toeristenbelasting</td>
                        <td>{currency(form.values.touristTax)}</td>
                        <td>{nights}</td>
                        <td>{currency(touristTax)}</td>
                        <td>{`${currency(0)} (0%)`}</td>
                        <td>{currency(touristTax)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </ScrollArea>
              <p>{`Totaal: ${currency(total)}`}</p>
              <Group>
                <DateRangePicker
                  placeholder="Factureer periode"
                  locale="nl"
                  value={invoicePeriod}
                  onChange={setInvoicePeriod}
                  minDate={new Date(form?.values?.date?.[0].setHours(4))}
                  maxDate={new Date(form?.values?.date?.[1].setHours(4))}
                  excludeDate={(date) => {
                    for (let i = 0; i < booking?.invoices?.length ?? 0; i++) {
                      const invoice = booking?.invoices?.[i];
                      if (invoice) {
                        const { start, end } = invoice;
                        const result = dayjs(date).isBetween(
                          start.toDate(),
                          end.toDate(),
                          null,
                          '[]',
                        );
                        if (result) return result;
                      }
                    }
                    return false;
                  }}
                />
                {invoicePeriod && invoicePeriod[1] && (
                  <Button onClick={createInvoice}>Maak factuur</Button>
                )}
              </Group>
              <div style={{ marginTop: 16 }}>
                {booking?.invoices?.map((invoice, index) => {
                  const invoiceNights = calcNights(
                    invoice.end.toDate(),
                    invoice.start.toDate(),
                  );

                  const isLastInvoice = form.values.date?.[1]
                    ? compareDates(form.values.date[1], invoice.end.toDate())
                    : false;

                  return (
                    <>
                      <div
                        key={invoice.number}
                        style={{
                          borderTop: 'solid 1px gray',
                          display: 'inline-block',
                          marginBottom: 16,
                        }}
                      >
                        <p style={{ margin: 0 }}>{`${index + 1}.`}</p>
                        <p style={{ margin: 0 }}>{`Nummer: ${invoice.number}`}</p>
                        <p style={{ margin: 0 }}>{`Aanmaakdatum: ${invoice.date
                          .toDate()
                          .toLocaleDateString('nl-NL')}`}</p>
                        <p style={{ margin: 0 }}>{`Periode: ${invoice.start
                          .toDate()
                          .toLocaleDateString('nl-NL')} - ${invoice.end
                          .toDate()
                          .toLocaleDateString('nl-NL')} (${invoiceNights} nachten)`}</p>
                        <Group
                          style={{
                            marginTop: 8,
                          }}
                        >
                          <PDFDownloadLink
                            document={
                              <Receipt
                                settings={settings}
                                booking={{
                                  ...form.values,
                                  invoiceNumber: invoice.number,
                                  invoiceDate: invoice.date,
                                  customer: booking.customer,
                                  date: [invoice.start.toDate(), invoice.end.toDate()],
                                }}
                                room={room}
                                nights={calcNights(
                                  invoice.end.toDate(),
                                  invoice.start.toDate(),
                                )}
                                pricePerNight={roomWithoutVat}
                                totalWithoutVat={
                                  (roomTotalWithoutVat / nights) * invoiceNights
                                }
                                vat={(roomVat / nights) * invoiceNights}
                                vatPercentage={form.values.btw}
                                totalNights={(roomTotal / nights) * invoiceNights}
                                cleaningFee={cleaningFeeWithoutVat}
                                cleaningFeeVat={cleaningFeeVat}
                                cleaningFeeVatPercentage={form.values.cleaningFeeVat}
                                totalCleaningFee={form.values.cleaningFee}
                                parkingFee={parkingFeeWithoutVat / nights}
                                parkingFeeVat={(parkingFeeVat / nights) * invoiceNights}
                                parkingFeeVatPercentage={form.values.parkingFeeVat}
                                totalParkingFee={
                                  (form.values.parkingFee / nights) * invoiceNights
                                }
                                touristTax={form.values.touristTax ?? 0}
                                touristTaxTotal={form.values.touristTax * invoiceNights}
                                totalMinusVat={
                                  ((roomTotalWithoutVat +
                                    parkingFeeWithoutVat +
                                    touristTax) /
                                    nights) *
                                    invoiceNights +
                                  (isLastInvoice ? cleaningFeeWithoutVat : 0)
                                }
                                totalVat={
                                  ((roomVat + parkingFeeVat) / nights) * invoiceNights +
                                  (isLastInvoice ? cleaningFeeVat : 0)
                                }
                                total={
                                  isLastInvoice
                                    ? (total / nights) * invoiceNights
                                    : (total / nights) * invoiceNights -
                                      form.values.cleaningFee
                                }
                                isLastInvoice={isLastInvoice}
                              />
                            }
                            fileName={`${invoice.number} - ${booking.customer.name}.pdf`}
                          >
                            <Button>Download PDF</Button>
                          </PDFDownloadLink>
                          <Button color="red" onClick={() => deleteInvoice(index)}>
                            Verwijderen
                          </Button>
                        </Group>
                      </div>
                      <br />
                    </>
                  );
                })}
              </div>
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
