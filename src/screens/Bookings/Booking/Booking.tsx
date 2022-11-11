import "dayjs/locale/nl";
import {
  Button,
  Group,
  Loader,
  NumberInput,
  ScrollArea,
  Select,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ReactElement, useMemo, useState } from "react";
import { Collection } from "../../../enums/collection.enum";
import useFirestoreDocuments from "../../../hooks/useFirestoreDocuments";
import { firestore } from "../../../lib/firebase";
import { showNotification } from "@mantine/notifications";
import isBetween from "dayjs/plugin/isBetween";
import { SettingsInterface } from "../../../interfaces/Settings";
import { NextPageWithLayout } from "../../../../pages/_app";
import Dashboard from "../../../layouts/Dashboard";
import Link from "next/link";
import { Route } from "../../../enums/route.enum";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import {
  Booking as BookingInterface,
  BookingInvoice,
} from "../../../interfaces/booking.interface";
import { useRouter } from "next/router";
import { isNew } from "../../../utils/new.utility";
import { createRef } from "../../../utils/createRef.utility";
import { Room } from "../../../interfaces/room.interface";
import { Customer } from "../../../interfaces/customer.interface";
import { Invoice } from "../../../interfaces/invoice.interface";
import { generateRoute } from "../../../utils/generateRoute.utility";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Receipt } from "../../Invoices/Receipt";
import getInvoiceNumber from "../../../utils/invoiceNumber";
import { openConfirmModal } from "@mantine/modals";
import { InvoiceType } from "../../../enums/invoiceType.enum";
import { CleaningInterval } from "../../../enums/cleaningInterval.enum";

dayjs.extend(isBetween);

export const calcVat = (price: number, vat: number) =>
  Math.round((price / (100 + vat)) * vat * 100) / 100;
export const calcTotalWithoutVat = (price: number, vat: number) =>
  Math.round((price - vat) * 100) / 100;
export const calcNights = (end: Date, start: Date) =>
  dayjs(end).diff(start, "days");

export const compareDates = (firstDate: Date, secondDate: Date) => {
  return (
    firstDate.getDate() == secondDate.getDate() &&
    firstDate.getMonth() == secondDate.getMonth() &&
    firstDate.getFullYear() == secondDate.getFullYear()
  );
};

export const overlapDates = (a: [Date, Date], b: [Date, Date]) => {
  if (a[0] <= b[0] && b[0] <= a[1]) return true;
  if (a[0] <= b[1] && b[1] <= a[1]) return true;
  if (b[0] < a[0] && a[1] < b[1]) return true;

  return false;
};

export const Booking: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [booking, loading] = useDocumentData(
    createRef<BookingInterface>(Collection.Bookings, isNew(id) ? undefined : id)
  );

  if (isNew(id) || (!loading && booking))
    return <BookingForm booking={booking} />;

  return <Loader />;
};

interface FormValues {
  date: [Date | null, Date | null];
  room: string;
  btw: string;
  cleaningFee: number | undefined;
  cleaningFeeVat: string;
  cleaningInterval: string;
  cleaningStartDate: Date | null;
  cleaningNotes: string;
  parkingFee: number | undefined;
  parkingFeeVat: string;
  touristTax: number | undefined;
  customer: string;
  priceOverride: number | undefined;
  notes: string;
  extraOne: string | null;
  extraTwo: string | null;
}

interface BookingFormProps {
  booking?: BookingInterface;
}

const BookingForm = ({ booking }: BookingFormProps) => {
  const router = useRouter();
  const id = router.query.id as string;
  const [cleaningDate, setCleaningDate] = useState<Date | null>(null);
  const [cleaningNotes, setCleaningNotes] = useState<string>("");
  const [invoicePeriod, setInvoicePeriod] = useState<
    [Date | null, Date | null]
  >([null, null]);
  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    Collection.Settings,
    true
  );

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  const { documents: rooms } = useFirestoreDocuments<Room>(
    Collection.Rooms,
    true
  );

  const roomSelectData = useMemo(
    () =>
      rooms
        ?.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .map((room) => ({
          value: room.id,
          label: room.name,
        })),
    [rooms]
  );

  const { documents: customers } = useFirestoreDocuments<Customer>(
    Collection.Customers,
    true
  );

  const customerSelectData = useMemo(
    () =>
      customers
        ?.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
        .map((customer) => ({
          value: customer.id,
          label: customer.name,
        })),
    [customers]
  );

  const form = useForm<FormValues>({
    initialValues: {
      date: booking
        ? [booking.start.toDate(), booking.end.toDate()]
        : [null, null],
      room: booking?.room.id || "",
      btw: booking?.btw.toString() || "9",
      cleaningFee: booking?.cleaningFee || undefined,
      cleaningFeeVat: booking?.cleaningFeeVat.toString() || "21",
      cleaningInterval: booking?.cleaningInterval || "",
      cleaningStartDate: booking?.cleaningStartDate?.toDate() || null,
      cleaningNotes: booking?.cleaningNotes || "",
      parkingFee: booking?.parkingFee || undefined,
      parkingFeeVat: booking?.parkingFeeVat.toString() || "21",
      touristTax: booking?.touristTax || undefined,
      customer: booking?.customer.id || "",
      priceOverride: booking?.priceOverride || undefined,
      notes: booking?.notes || "",
      extraOne: booking?.extraOne || "",
      extraTwo: booking?.extraTwo || "",
    },
  });

  const submitHandler = async (values: FormValues) => {
    if (!values.date[1] || !values.room || !values.customer) {
      showNotification({
        color: "red",
        message: "Vul alle verplichte velden in",
      });
      return;
    }

    const q = query(
      collection(firestore, Collection.Bookings),
      where("room.id", "==", values.room)
    );

    const querySnapshot = await getDocs(q);

    const overlaps = querySnapshot.docs.some((document) => {
      const booking = document.data() as BookingInterface;

      if (!values.date[0] || !values.date[1]) return false;

      return overlapDates(
        [booking.start.toDate(), booking.end.toDate()],
        [values.date[0], values.date[1]]
      );
    });

    const book = async () => {
      const room = rooms?.find(({ id }) => id === values.room);
      if (room) delete room._ref;

      const customer = customers?.find(({ id }) => id === values.customer);
      if (customer) delete customer._ref;

      const bookingToSend = {
        ...values,
        invoices: booking?.invoices ?? [],
        start: values.date[0] && Timestamp.fromDate(values.date[0]),
        end: values.date[1] && Timestamp.fromDate(values.date[1]),
        room: room ?? booking?.room,
        customer: customer ?? booking?.customer,
        priceOverride: values.priceOverride ?? 0,
        cleaningFee: values.cleaningFee ?? 0,
        parkingFee: values.parkingFee ?? 0,
        touristTax: values.touristTax ?? 0,
      };

      if (booking) {
        await setDoc(doc(firestore, Collection.Bookings, id), bookingToSend);
        form.resetDirty();
      } else {
        const bookingRef = await addDoc(
          collection(firestore, Collection.Bookings),
          bookingToSend
        );
        await router.push(generateRoute(Route.Booking, { id: bookingRef.id }));
      }

      showNotification({
        color: "green",
        message: "Opgeslagen",
      });
    };

    if (overlaps && !booking)
      openConfirmModal({
        title: "De kamer is al geboekt op deze datum, wil je doorgaan?",
        labels: { confirm: "Ja", cancel: "Nee" },
        onConfirm: book,
      });
    else book();
  };

  const deleteHandler = async () => {
    if (booking) {
      await deleteDoc(doc(firestore, Collection.Bookings, id));

      await router.push(Route.Bookings);

      showNotification({
        color: "green",
        message: "Verwijderd",
      });
    }
  };

  const createInvoiceHandler = async () => {
    if (!invoicePeriod[0] || !invoicePeriod[1] || !settings || !booking) return;

    await setDoc(doc(firestore, Collection.Settings, settings.id), {
      ...settings,
      invoices: settings.invoices ? settings.invoices + 1 : 1,
    });

    const bookingRef = doc(firestore, Collection.Bookings, id);

    const invoiceRef = await addDoc(
      collection(firestore, Collection.Invoices),
      {
        booking: bookingRef,
        type: InvoiceType.Normal,
        number: getInvoiceNumber(settings.invoices),
        date: Timestamp.fromDate(new Date()),
        from: Timestamp.fromDate(invoicePeriod[0]),
        to: Timestamp.fromDate(invoicePeriod[1]),
        mailedOn: null,
        creditedOn: null,
      } as Invoice
    );

    await updateDoc(bookingRef, {
      invoices: [...booking.invoices, invoiceRef],
    });

    setInvoicePeriod([null, null]);

    showNotification({
      color: "green",
      message: "Factuur gemaakt",
    });
  };

  const deleteInvoiceHandler = async (index: number) => {
    if (!booking) return;

    await updateDoc(doc(firestore, Collection.Bookings, id), {
      invoices: booking.invoices.filter((_, i) => i !== index),
    });

    showNotification({
      color: "green",
      message: "Factuur verwijderd",
    });
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(submitHandler)}>
        <Group>
          <Title>Boeking</Title>
          <Link passHref href={Route.Bookings}>
            <Button component="a">Naar overzicht</Button>
          </Link>
          {(!booking || form.isDirty()) && (
            <Button type="submit">Opslaan</Button>
          )}
          {booking && (
            <Button
              variant="light"
              color="red"
              onClick={() => {
                openConfirmModal({
                  title: "Weet je het zeker?",
                  labels: { confirm: "Ja", cancel: "Nee" },
                  onConfirm: deleteHandler,
                });
              }}
            >
              Verwijderen
            </Button>
          )}
        </Group>
        <DateRangePicker
          required
          clearable={false}
          label="Datum"
          locale="nl"
          placeholder="Datum"
          {...form.getInputProps("date")}
        />
        <Select
          required
          clearable={false}
          label="Klant"
          placeholder="Klant"
          searchable
          data={customerSelectData ?? []}
          {...form.getInputProps("customer")}
        />
        <Select
          required
          clearable={false}
          label="Kamer"
          placeholder="Kamer"
          searchable
          data={roomSelectData ?? []}
          {...form.getInputProps("room")}
        />
        <Select
          required
          clearable={false}
          label="BTW percentage"
          placeholder="BTW percentage"
          defaultValue="9"
          data={[
            {
              label: "0% / Verlegd",
              value: "0",
            },
            {
              label: "9%",
              value: "9",
            },
            {
              label: "21%",
              value: "21",
            },
          ]}
          {...form.getInputProps("btw")}
        />
        <NumberInput
          min={0}
          noClampOnBlur
          decimalSeparator=","
          icon="€"
          label="Schoonmaakkosten"
          placeholder="Schoonmaakkosten"
          {...form.getInputProps("cleaningFee")}
        />
        {!!form.values.cleaningFee && (
          <Select
            label="Schoonmaakkosten BTW percentage"
            placeholder="Schoonmaakkosten BTW percentage"
            defaultValue="21"
            data={[
              {
                label: "0% / Verlegd",
                value: "0",
              },
              {
                label: "21%",
                value: "21",
              },
            ]}
            {...form.getInputProps("cleaningFeeVat")}
          />
        )}
        <Select
          label="Schoonmaak interval"
          placeholder="Schoonmaak interval"
          clearable
          data={Object.values(CleaningInterval).map((value) => ({
            label:
              value === CleaningInterval.Weekly ? "Wekelijks" : "Tweewekelijks",
            value,
          }))}
          {...form.getInputProps("cleaningInterval")}
        />
        {
          <DatePicker
            label="Schoonmaak startdatum"
            placeholder="Schoonmaak startdatum"
            {...form.getInputProps("cleaningStartDate")}
            minDate={
              form.values.date[0] ? new Date(form.values.date[0]) : undefined
            }
            maxDate={
              form.values.date[1] ? new Date(form.values.date[1]) : undefined
            }
          />
        }
        <Textarea
          label="Schoonmaak opmerkingen"
          placeholder="Schoonmaak opmerkingen"
          {...form.getInputProps("cleaningNotes")}
        />
        <NumberInput
          min={0}
          noClampOnBlur
          decimalSeparator=","
          icon="€"
          label="Parkeerkosten"
          placeholder="Parkeerkosten"
          {...form.getInputProps("parkingFee")}
        />
        {!!form.values.parkingFee && (
          <Select
            label="Parkeerkosten BTW percentage"
            placeholder="Parkeerkosten BTW percentage"
            defaultValue="21"
            data={[
              {
                label: "0% / Verlegd",
                value: "0",
              },
              {
                label: "21%",
                value: "21",
              },
            ]}
            {...form.getInputProps("parkingFeeVat")}
          />
        )}
        <NumberInput
          min={0}
          noClampOnBlur
          decimalSeparator=","
          icon="€"
          label="Toeristenbelasting per nacht"
          placeholder="Toeristenbelasting per nacht"
          {...form.getInputProps("touristTax")}
        />
        <NumberInput
          min={0}
          noClampOnBlur
          decimalSeparator=","
          icon="€"
          label="Aangepaste prijs"
          placeholder="Prijs per nacht"
          {...form.getInputProps("priceOverride")}
        />
        <Textarea
          label="Opmerkingen"
          placeholder="Opmerkingen"
          {...form.getInputProps("notes")}
        />
        <TextInput
          label="Extra 1"
          placeholder="Extra 1"
          {...form.getInputProps("extraOne")}
        />
        <TextInput
          label="Extra 2"
          placeholder="Extra 2"
          {...form.getInputProps("extraTwo")}
        />
      </form>
      {booking && settings && (
        <div
          style={{
            marginTop: 16,
          }}
        >
          <Group>
            <Title>Facturen</Title>
            <DateRangePicker
              mt="md"
              placeholder="Factureer periode"
              locale="nl"
              value={invoicePeriod}
              onChange={setInvoicePeriod}
              minDate={new Date(booking.start.toDate())}
              maxDate={new Date(booking.end.toDate())}
            />
            {invoicePeriod[1] && (
              <Button mt="md" onClick={createInvoiceHandler}>
                Maak factuur
              </Button>
            )}
          </Group>
          {booking.invoices.length && (
            <ScrollArea
              mt="md"
              style={{
                padding: 16,
                borderRadius: 4,
                boxShadow:
                  "inset 25px 0px 30px -25px rgba(0,0,0,0.8), inset -25px 0px 30px -25px rgba(0,0,0,0.8)",
              }}
            >
              <div
                style={{
                  display: "flex",
                }}
              >
                {booking.invoices?.map((invoice, index) => (
                  <InvoiceOverview
                    key={index}
                    invoiceData={invoice}
                    booking={booking}
                    settings={settings}
                    onDelete={() => {
                      openConfirmModal({
                        title: "Weet je het zeker?",
                        labels: { confirm: "Ja", cancel: "Nee" },
                        onConfirm: () => deleteInvoiceHandler(index),
                      });
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

interface InvoiceOverviewProps {
  invoiceData: BookingInvoice | DocumentReference<Invoice>;
  booking: BookingInterface;
  settings: SettingsInterface;
  onDelete: () => void;
}

const InvoiceOverview = ({
  invoiceData,
  booking,
  settings,
  onDelete,
}: InvoiceOverviewProps) => {
  const isRef = "path" in invoiceData;
  const [invoiceSnapShot] = useDocument(isRef ? invoiceData : undefined);
  const invoice = invoiceSnapShot?.data();
  const deprecatedInvoice = !isRef ? invoiceData : undefined;

  if (isRef && invoice) {
    const invoiceNights = calcNights(
      invoice.to.toDate(),
      invoice.from.toDate()
    );

    return (
      <div
        style={{
          borderRadius: 4,
          boxShadow: "0 0 10px 3px rgba(0,0,0,0.4)",
          padding: 16,
          margin: 16,
        }}
      >
        <p>
          Type:{" "}
          {invoice.type === InvoiceType.Credit ? "Creditfactuur" : "Factuur"}
        </p>
        <p>Nummer: {invoice.number}</p>
        <p>{`Datum: ${invoice.date.toDate().toLocaleDateString("nl-NL")}`}</p>
        <p style={{ whiteSpace: "nowrap" }}>{`Periode: ${invoice.from
          .toDate()
          .toLocaleDateString("nl-NL")} - ${invoice.to
          .toDate()
          .toLocaleDateString("nl-NL")} (${invoiceNights} nachten)`}</p>
        <Link
          passHref
          href={generateRoute(Route.Invoice, { id: invoiceSnapShot?.id })}
        >
          <Button mt="xs" component="a">
            Naar factuur
          </Button>
        </Link>
      </div>
    );
  } else if (deprecatedInvoice) {
    const invoiceNights = calcNights(
      deprecatedInvoice.end.toDate(),
      deprecatedInvoice.start.toDate()
    );

    return (
      <>
        <div
          style={{
            borderTop: "solid 1px gray",
            marginBottom: 16,
            paddingTop: 8,
          }}
        >
          <p>Type: Factuur</p>
          <p>Nummer: {deprecatedInvoice.number}</p>
          <p>{`Datum: ${deprecatedInvoice.date
            .toDate()
            .toLocaleDateString("nl-NL")}`}</p>
          <p>{`Periode: ${deprecatedInvoice.start
            .toDate()
            .toLocaleDateString("nl-NL")} - ${deprecatedInvoice.end
            .toDate()
            .toLocaleDateString("nl-NL")} (${invoiceNights} nachten)`}</p>
          <Group mt="xs">
            <PDFDownloadLink
              document={
                <Receipt
                  invoice={{
                    type: InvoiceType.Normal,
                    number: deprecatedInvoice.number,
                    date: deprecatedInvoice.date,
                    from: deprecatedInvoice.start,
                    to: deprecatedInvoice.end,
                  }}
                  settings={settings}
                  booking={booking}
                />
              }
              fileName={`Factuur ${deprecatedInvoice.number}.pdf`}
            >
              <Button>Downloaden</Button>
            </PDFDownloadLink>
            <Button color="red" variant="light" onClick={onDelete}>
              Verwijderen
            </Button>
          </Group>
        </div>
        <br />
      </>
    );
  }

  return <Loader />;
};

Booking.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
