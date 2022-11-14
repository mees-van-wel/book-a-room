import { Button, Group, Loader, Title } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import { NextPageWithLayout } from "../../../../pages/_app";
import { InvoiceDetails } from "../../../components/InvoiceDetails";
import { Collection } from "../../../enums/collection.enum";
import { InvoiceType } from "../../../enums/invoiceType.enum";
import { Route } from "../../../enums/route.enum";
import useFirestoreDocuments from "../../../hooks/useFirestoreDocuments";
import { Booking } from "../../../interfaces/booking.interface";
import { Invoice as InvoiceInterface } from "../../../interfaces/invoice.interface";
import { SettingsInterface } from "../../../interfaces/Settings";
import Dashboard from "../../../layouts/Dashboard";
import { firestore } from "../../../lib/firebase";
import { createRef } from "../../../utils/createRef.utility";
import { generateRoute } from "../../../utils/generateRoute.utility";
import getInvoiceNumber from "../../../utils/invoiceNumber";
import { calcNights } from "../../Bookings/Booking";
import { Receipt } from "../Receipt";

export const Invoice: NextPageWithLayout = () => {
  const router = useRouter();

  const id = router.query.id as string;

  const [invoice] = useDocumentData(
    createRef<InvoiceInterface>(Collection.Invoices, id)
  );
  const [bookingSnapshot] = useDocument<Booking>(invoice?.booking);
  const booking = bookingSnapshot?.data();

  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    Collection.Settings,
    true
  );

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  const deleteHandler = async () => {
    if (!booking || !invoice) return;

    await updateDoc(invoice.booking, {
      // @ts-ignore
      invoices: booking.invoices.filter((invoice) => invoice.id !== id),
    });

    await deleteDoc(doc(firestore, Collection.Invoices, id));

    await router.replace(Route.Invoices);

    showNotification({
      color: "green",
      message: "Verwijderd",
    });
  };

  const createCreditHandler = async () => {
    if (!invoice || !settings || !booking || !bookingSnapshot) return;

    await setDoc(doc(firestore, Collection.Settings, settings.id), {
      ...settings,
      invoices: settings.invoices ? settings.invoices + 1 : 1,
    });

    const bookingRef = doc(firestore, Collection.Bookings, bookingSnapshot.id);

    const invoiceRef = await addDoc(
      collection(firestore, Collection.Invoices),
      {
        booking: bookingRef,
        type: InvoiceType.Credit,
        number: getInvoiceNumber(settings.invoices),
        date: Timestamp.fromDate(new Date()),
        from: invoice.from,
        to: invoice.to,
        mailedOn: null,
        creditedOn: null,
      } as InvoiceInterface
    );

    await updateDoc(bookingRef, {
      invoices: [...booking.invoices, invoiceRef],
    });

    await updateDoc(doc(firestore, Collection.Invoices, id), {
      creditedOn: Timestamp.fromDate(new Date()),
    });

    await router.push(generateRoute(Route.Invoice, { id: invoiceRef.id }));

    showNotification({
      color: "green",
      message: "Creditfactuur gemaakt",
    });
  };

  const invoiceNights = useMemo(
    () =>
      invoice?.to && invoice?.from
        ? calcNights(invoice.to.toDate(), invoice.from.toDate())
        : undefined,
    [invoice?.from, invoice?.to]
  );

  if (!invoice) return <Loader />;

  return (
    <div>
      <Group mb="md">
        <Title>
          {invoice.type === InvoiceType.Credit ? "Creditfactuur" : "Factuur"}{" "}
          {invoice.number}
        </Title>
        {booking && (
          <>
            <Link passHref href={Route.Invoices}>
              <Button component="a">Naar overzicht</Button>
            </Link>
            <Link
              passHref
              href={generateRoute(Route.Booking, { id: bookingSnapshot?.id })}
            >
              <Button component="a">Naar boeking</Button>
            </Link>
            {settings && (
              <PDFDownloadLink
                document={
                  <Receipt
                    images={{
                      dir: "/assets/images/",
                      header: process.env.NEXT_PUBLIC_INVOICE_HEADER,
                      footer: process.env.NEXT_PUBLIC_INVOICE_FOOTER,
                    }}
                    invoice={invoice}
                    settings={settings}
                    booking={booking}
                  />
                }
                fileName={`${
                  invoice.type === InvoiceType.Credit
                    ? "Creditfactuur"
                    : "Factuur"
                } ${invoice.number}.pdf`}
              >
                <Button>Download</Button>
              </PDFDownloadLink>
            )}
            {booking.customer.email && settings && (
              <Button
                onClick={async () => {
                  await axios.post("/api/mail", {
                    to: "mees11@hotmail.nl",
                    invoice,
                    settings,
                    booking,
                  });

                  await updateDoc(doc(firestore, Collection.Invoices, id), {
                    mailedOn: Timestamp.fromDate(new Date()),
                  });
                }}
                variant={invoice.mailedOn ? "light" : undefined}
              >
                Mail
              </Button>
            )}
            {invoice.type === InvoiceType.Normal && (
              <Button
                variant={invoice.creditedOn ? "light" : undefined}
                onClick={createCreditHandler}
              >
                Maak creditfactuur
              </Button>
            )}
            <Button
              onClick={() => {
                openConfirmModal({
                  title: "Weet je het zeker?",
                  labels: { confirm: "Ja", cancel: "Nee" },
                  onConfirm: deleteHandler,
                });
              }}
              color="red"
              variant="light"
            >
              Verwijderen
            </Button>
          </>
        )}
      </Group>
      <table width={500}>
        <tr>
          <td>Type:</td>
          <td>
            {invoice.type === InvoiceType.Credit ? "Creditfactuur" : "Factuur"}
          </td>
        </tr>
        <tr>
          <td>Nummer:</td>
          <td>{invoice.number}</td>
        </tr>
        <tr>
          <td>Datum:</td>
          <td>{invoice.date.toDate().toLocaleDateString("Nl-nl")}</td>
        </tr>
        <tr>
          <td>Periode:</td>
          <td>
            {invoice.from.toDate().toLocaleDateString("Nl-nl")} {" - "}
            {invoice.to.toDate().toLocaleDateString("Nl-nl")}
          </td>
        </tr>
        {invoiceNights && (
          <tr>
            <td>Nachten:</td>
            <td>{invoiceNights}</td>
          </tr>
        )}
        {booking && (
          <>
            <tr>
              <td>Kamer:</td>
              <td>{booking.room.name}</td>
            </tr>
            <tr>
              <td>Klant:</td>
              <td>
                {booking.customer.name}
                {booking.customer.secondName &&
                  ` - ${booking.customer.secondName}`}
              </td>
            </tr>
            {invoice.mailedOn && (
              <tr>
                <td>Gemaild op:</td>
                <td>{invoice.mailedOn.toDate().toLocaleString("Nl-nl")}</td>
              </tr>
            )}
            {invoice.creditedOn && (
              <tr>
                <td>Gecrediteerd op:</td>
                <td>{invoice.creditedOn.toDate().toLocaleString("Nl-nl")}</td>
              </tr>
            )}
          </>
        )}
      </table>
      {booking && <InvoiceDetails invoice={invoice} booking={booking} />}
    </div>
  );
};

Invoice.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
