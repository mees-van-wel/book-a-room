import { Button, Group, Loader, Modal, Table, Title } from "@mantine/core";
import { useDidUpdate, useDisclosure } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useMemo, useState } from "react";
import { useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import { NextPageWithLayout } from "../../../../pages/_app";
import { InvoiceDetails } from "../../../components/InvoiceDetails";
import { Collection } from "../../../enums/collection.enum";
import { InvoiceType } from "../../../enums/invoiceType.enum";
import { Route } from "../../../enums/route.enum";
import useFirestoreDocuments from "../../../hooks/useFirestoreDocuments";
import { Booking } from "../../../interfaces/booking.interface";
import { Customer } from "../../../interfaces/customer.interface";
import { Invoice as InvoiceInterface } from "../../../interfaces/invoice.interface";
import { Room } from "../../../interfaces/room.interface";
import { SettingsInterface } from "../../../interfaces/Settings";
import Dashboard from "../../../layouts/Dashboard";
import { firestore } from "../../../lib/firebase";
import { createRef } from "../../../utils/createRef.utility";
import currency from "../../../utils/currency";
import { generateRoute } from "../../../utils/generateRoute.utility";
import getInvoiceNumber from "../../../utils/invoiceNumber";
import { getCustomer, getRoom } from "../../Bookings";
import { calcNights } from "../../Bookings/Booking";
import { DeprecatedReceipt } from "../DeprecatedReceipt";
import { Receipt } from "../Receipt";
import { useGlobalContext } from "../../../providers/GlobalProvider";
import { TwCustomerModal } from "./twCustomerModel";
import { PRODUCTS } from "../../../constants/products";

export const Invoice: NextPageWithLayout = () => {
  const router = useRouter();
  const invoiceId = router.query.id as string;

  const [invoice] = useDocumentData(
    createRef<InvoiceInterface>(Collection.Invoices, invoiceId)
  );

  if (!invoice) return <Loader />;

  return !invoice.lines ? (
    <DeprecatedInvoice invoice={invoice} />
  ) : (
    <NewInvoice invoice={invoice} />
  );
};

interface NewInvoiceProps {
  invoice: InvoiceInterface;
}

const NewInvoice = ({ invoice }: NewInvoiceProps) => {
  const router = useRouter();
  const invoiceId = router.query.id as string;
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const { session } = useGlobalContext();

  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    Collection.Settings,
    true
  );

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  const invoiceNights = useMemo(
    () =>
      invoice?.to && invoice?.from
        ? calcNights(invoice.to.toDate(), invoice.from.toDate())
        : undefined,
    [invoice?.from, invoice?.to]
  );

  const createCreditHandler = async () => {
    if (!invoice || !settings) return;

    await setDoc(doc(firestore, Collection.Settings, settings.id), {
      ...settings,
      invoices: settings.invoices ? settings.invoices + 1 : 1,
    });

    const invoiceRef = await addDoc(
      collection(firestore, Collection.Invoices),
      {
        type: InvoiceType.Credit,
        number: getInvoiceNumber(settings.invoices),
        date: Timestamp.fromDate(new Date()),
        from: invoice.from,
        to: invoice.to,
        mailedOn: null,
        creditedOn: null,
        roomName: invoice.roomName,
        extra: invoice.extra,
        company: invoice.company,
        customer: invoice.customer,
        terms: invoice.terms,
        bookingRefrence: invoice.bookingRefrence,
        lines: invoice.lines.map((line) => ({
          ...line,
          unitPriceWithoutVat: -Math.abs(line.unitPriceWithoutVat),
          totalWithoutVat: -Math.abs(line.totalWithoutVat),
          vat: -Math.abs(line.vat),
          total: -Math.abs(line.total),
        })),
      } as InvoiceInterface
    );

    const snapshot = await getDoc(invoice.bookingRefrence);
    const booking = snapshot.data();

    if (!!booking)
      await updateDoc(invoice.bookingRefrence, {
        invoices: [...booking.invoices, invoiceRef],
      });

    await updateDoc(doc(firestore, Collection.Invoices, invoiceId), {
      creditedOn: Timestamp.fromDate(new Date()),
    });

    await router.push(generateRoute(Route.Invoice, { id: invoiceRef.id }));

    showNotification({
      color: "green",
      message: "Creditfactuur gemaakt",
    });
  };

  const deleteHandler = async () => {
    const snapshot = await getDoc(invoice.bookingRefrence);
    const booking = snapshot.data();

    if (!!booking)
      await updateDoc(invoice.bookingRefrence, {
        invoicedTill: Timestamp.fromDate(
          new Date(
            invoice.from.toDate().setDate(invoice.from.toDate().getDate() - 1)
          )
        ),
        invoices: booking.invoices.filter(
          // @ts-ignore
          (invoice) => invoice.id !== invoiceId
        ),
      });

    await deleteDoc(doc(firestore, Collection.Invoices, invoiceId));

    await router.replace(Route.Invoices);

    showNotification({
      color: "green",
      message: "Verwijderd",
    });
  };

  const mailHandler = async () => {
    await updateDoc(doc(firestore, Collection.Invoices, invoiceId), {
      mailedOn: Timestamp.fromDate(new Date()),
    });

    setLoading(false);

    window
      ?.open(
        process.env.NEXT_PUBLIC_SMTP_BCC
          ? `https://outlook.office.com/mail/deeplink/compose?to=${invoice.customer.email},${process.env.NEXT_PUBLIC_SMTP_BCC}&subject=Invoice&body=Dear%20customer%2C%0A%0AAttached%20you%20will%20find%20your%20invoice.%0A%0AKind%20regards%2C%0A%0ATeam%20${invoice.company.name}`
          : `https://outlook.office.com/mail/deeplink/compose?to=${invoice.customer.email}&subject=Invoice&body=Dear%20customer%2C%0A%0AAttached%20you%20will%20find%20your%20invoice.%0A%0AKind%20regards%2C%0A%0ATeam%20${invoice.company.name}`,
        "_blank"
      )
      ?.focus();
  };

  const billingHandler = async (customerId: string) => {
    close();

    if (session)
      await axios.post(
        `/api/create-transaction?accessToken=${session.access_token}`,
        {
          lines: invoice.lines.map((line) => ({
            description: line.name,
            value: line.totalWithoutVat,
            ledger:
              line.name === PRODUCTS.CLEANING
                ? 803010
                : line.name === PRODUCTS.PARKING
                ? 803000
                : 804000,
            vatCode: line.vatPercentage === 9 ? "VL" : "VH",
            vatValue: line.vat,
          })),
          total,
          customerId,
          invoiceDate: invoice.date.toMillis(),
          invoiceStartDate: invoice.from.toMillis(),
          invoiceEndDate: invoice.to.toMillis(),
          invoiceNumber: invoice.number,
        }
      );

    await mailHandler();
  };

  const totalWithoutVat = invoice.lines.reduce(
    (accumulator, { totalWithoutVat }) => accumulator + totalWithoutVat,
    0
  );

  const vat = invoice.lines.reduce(
    (accumulator, { vat }) => accumulator + vat,
    0
  );

  const total = invoice.lines.reduce(
    (accumulator, { total }) => accumulator + total,
    0
  );

  return (
    <div>
      <Modal opened={opened} onClose={close} title="Bevestig klant">
        <TwCustomerModal
          customerName={invoice.customer.name.split(" - ")[0].trim()}
          onConfirm={billingHandler}
        />
      </Modal>
      <Group mb="md">
        <Title>
          {invoice.type === InvoiceType.Credit ? "Creditfactuur" : "Factuur"}{" "}
          {invoice.number}
        </Title>
        <>
          <Link passHref href={Route.Invoices}>
            <Button component="a">Naar overzicht</Button>
          </Link>
          <Link
            passHref
            href={generateRoute(Route.Booking, {
              id: invoice.bookingRefrence.id,
            })}
          >
            <Button component="a">Naar boeking</Button>
          </Link>
          <PDFDownloadLink
            document={
              <Receipt
                images={{
                  dir: "/assets/images/",
                  header: process.env.NEXT_PUBLIC_INVOICE_HEADER,
                  footer: process.env.NEXT_PUBLIC_INVOICE_FOOTER,
                }}
                invoice={invoice}
              />
            }
            fileName={`${
              invoice.type === InvoiceType.Credit ? "Credit note" : "Invoice"
            } ${invoice.number}.pdf`}
          >
            <Button
              loading={loading}
              variant={invoice.mailedOn ? "light" : undefined}
              onClick={async () => {
                setLoading(true);
                if (invoice.mailedOn) await mailHandler();
                else open();
              }}
            >
              {invoice.mailedOn
                ? "PDF Downloaden"
                : invoice.type === InvoiceType.Credit
                ? "Crediteren"
                : "Factureren"}
            </Button>
          </PDFDownloadLink>
          {invoice.type !== InvoiceType.Credit && (
            <Button
              variant={invoice.creditedOn ? "light" : undefined}
              onClick={() => {
                openConfirmModal({
                  title: "Weet je het zeker?",
                  labels: { confirm: "Ja", cancel: "Nee" },
                  onConfirm: createCreditHandler,
                });
              }}
            >
              Maak creditfactuur
            </Button>
          )}
        </>
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
          <td>{invoice.date.toDate().toLocaleDateString("nl-NL")}</td>
        </tr>
        <tr>
          <td>Periode:</td>
          <td>
            {invoice.from.toDate().toLocaleDateString("nl-NL")} {" - "}
            {invoice.to.toDate().toLocaleDateString("nl-NL")}
          </td>
        </tr>
        {invoiceNights && (
          <tr>
            <td>Nachten:</td>
            <td>{invoiceNights}</td>
          </tr>
        )}
        <tr>
          <td>Kamer:</td>
          <td>{invoice.roomName}</td>
        </tr>
        <tr>
          <td>Klant:</td>
          <td>{invoice.customer.name}</td>
        </tr>
        {invoice.mailedOn && (
          <tr>
            <td>Gefactureerd op:</td>
            <td>{invoice.mailedOn.toDate().toLocaleString("nl-NL")}</td>
          </tr>
        )}
        {invoice.creditedOn && (
          <tr>
            <td>Gecrediteerd op:</td>
            <td>{invoice.creditedOn.toDate().toLocaleString("nl-NL")}</td>
          </tr>
        )}
      </table>
      <div
        style={{
          overflowX: "auto",
        }}
      >
        <Table mt="md">
          <thead>
            <tr>
              <th>Dienst</th>
              <th>Prijs per stuk</th>
              <th>Aantal</th>
              <th>Totaal excl. BTW</th>
              <th>BTW</th>
              <th>Totaal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map(
              (
                {
                  name,
                  unitPriceWithoutVat,
                  quantity,
                  totalWithoutVat,
                  vat,
                  vatPercentage,
                  total,
                },
                index
              ) => {
                return (
                  <tr key={index}>
                    <td>{name}</td>
                    <td>{currency(unitPriceWithoutVat)}</td>
                    <td>{quantity}x</td>
                    <td>{currency(totalWithoutVat)}</td>
                    <td>
                      {currency(vat)} ({vatPercentage}%)
                    </td>
                    <td>{currency(total)}</td>
                  </tr>
                );
              }
            )}
          </tbody>
        </Table>
        <p>Totaal excl. BTW: {currency(totalWithoutVat)}</p>
        <p>Totaal BTW: {currency(vat)}</p>
        <p>Totaal: {currency(total)}</p>
      </div>
    </div>
  );
};

interface DeprecatedInvoiceProps {
  invoice: InvoiceInterface;
}

const DeprecatedInvoice = ({ invoice }: DeprecatedInvoiceProps) => {
  const router = useRouter();
  const [room, setRoom] = useState<Room>();
  const [customer, setCustomer] = useState<Customer>();
  const invoiceId = router.query.id as string;
  // @ts-ignore
  const bookingRef = invoice.booking as unknown as DocumentReference<Booking>;

  const [bookingSnapshot] = useDocument<Booking>(bookingRef);

  const booking = bookingSnapshot?.data();

  useDidUpdate(() => {
    if (!booking) return;

    (async () => {
      const [room, customer] = await Promise.all([
        getRoom(booking),
        getCustomer(booking),
      ]);

      if (!room || !customer) return;

      setRoom(room);
      setCustomer(customer);
    })();
  }, [booking]);

  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    Collection.Settings,
    true
  );

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  const deleteHandler = async () => {
    if (!invoice) return;

    if (!!booking)
      await updateDoc(bookingRef, {
        invoices: booking.invoices.filter(
          // @ts-ignore
          (invoice) => invoice.id !== invoiceId
        ),
      });

    await deleteDoc(doc(firestore, Collection.Invoices, invoiceId));

    await router.replace(Route.Invoices);

    showNotification({
      color: "green",
      message: "Verwijderd",
    });
  };

  const invoiceNights = useMemo(
    () =>
      invoice?.to && invoice?.from
        ? calcNights(invoice.to.toDate(), invoice.from.toDate())
        : undefined,
    [invoice?.from, invoice?.to]
  );

  if (!customer || !room) return <Loader />;

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
                  <DeprecatedReceipt
                    images={{
                      dir: "/assets/images/",
                      header: process.env.NEXT_PUBLIC_INVOICE_HEADER,
                      footer: process.env.NEXT_PUBLIC_INVOICE_FOOTER,
                    }}
                    invoice={invoice}
                    settings={settings}
                    booking={{ ...booking, room, customer }}
                  />
                }
                fileName={`${
                  invoice.type === InvoiceType.Credit
                    ? "Credit note"
                    : "Invoice"
                } ${invoice.number}.pdf`}
              >
                <Button>Download</Button>
              </PDFDownloadLink>
            )}
            {invoice.type === InvoiceType.Normal && (
              <Button
                variant={invoice.creditedOn ? "light" : undefined}
                onClick={() => {
                  openConfirmModal({
                    title: "Weet je het zeker?",
                    labels: { confirm: "Ja", cancel: "Nee" },
                    // onConfirm: createCreditHandler,
                  });
                }}
              >
                Maak creditfactuur
              </Button>
            )}
          </>
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
          <td>{invoice.date.toDate().toLocaleDateString("nl-NL")}</td>
        </tr>
        <tr>
          <td>Periode:</td>
          <td>
            {invoice.from.toDate().toLocaleDateString("nl-NL")} {" - "}
            {invoice.to.toDate().toLocaleDateString("nl-NL")}
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
              <td>{room.name}</td>
            </tr>
            <tr>
              <td>Klant:</td>
              <td>
                {customer.name}
                {customer.secondName && ` - ${customer.secondName}`}
              </td>
            </tr>
            {invoice.mailedOn && (
              <tr>
                <td>Gefactureed op:</td>
                <td>{invoice.mailedOn.toDate().toLocaleString("nl-NL")}</td>
              </tr>
            )}
            {invoice.creditedOn && (
              <tr>
                <td>Gecrediteerd op:</td>
                <td>{invoice.creditedOn.toDate().toLocaleString("nl-NL")}</td>
              </tr>
            )}
          </>
        )}
      </table>
      {booking && room ? (
        <InvoiceDetails room={room} invoice={invoice} booking={booking} />
      ) : (
        <p>De bijbehorende boeking is verwijderd.</p>
      )}
    </div>
  );
};

Invoice.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
