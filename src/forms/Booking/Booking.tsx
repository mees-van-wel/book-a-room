import 'dayjs/locale/nl';

import {
  Button,
  Group,
  NumberInput,
  Select,
  Stepper,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateRangePicker } from '@mantine/dates';
import { useForm } from '@mantine/hooks';
import dayjs from 'dayjs';
import firebase from 'firebase/compat';
import { addDoc, collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import COLLECTIONS from '../../enums/COLLECTIONS';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { BookingInterface, NewBookingInterface } from '../../interfaces/Booking';
import { firestore } from '../../lib/firebase';
import Timestamp = firebase.firestore.Timestamp;
import { useNotifications } from '@mantine/notifications';
import isBetween from 'dayjs/plugin/isBetween';

import { CustomerInterface } from '../../interfaces/Customer';
import { FireStoreRoomInterface } from '../../interfaces/Room';
import { SettingsInterface } from '../../interfaces/Settings';

dayjs.extend(isBetween);

export const calcVat = (price: number, vat: number) =>
  Math.round((price / (100 + vat)) * vat * 100) / 100;
export const calcTotalWithoutVat = (price: number, vat: number) =>
  Math.round((price - vat) * 100) / 100;
export const calcNights = (end: Date, start: Date) => dayjs(end).diff(start, 'days');

export const compareDates = (firstDate: Date, secondDate: Date) => {
  return (
    firstDate.getDate() == secondDate.getDate() &&
    firstDate.getMonth() == secondDate.getMonth() &&
    firstDate.getFullYear() == secondDate.getFullYear()
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
        invoices: booking?.invoices ?? [],
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
            label="BTW percentage"
            placeholder="BTW percentage"
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
              label="Schoonmaakkosten BTW percentage"
              placeholder="Schoonmaakkosten BTW percentage"
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
              label="Parkeerkosten BTW percentage"
              placeholder="Parkeerkosten BTW percentage"
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
              {form.values.notes && <Text>{form.values.notes}</Text>}
              <Group mt="md">
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
                          'day',
                          '[)',
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
                          <Button>Ga naar factuur</Button>
                          {/* <Button color="red" onClick={() => deleteInvoice(index)}>
                            Verwijderen
                          </Button> */}
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
