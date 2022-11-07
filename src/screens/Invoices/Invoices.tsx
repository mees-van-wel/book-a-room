import { Button, Group, Loader, Modal, Table, Title } from '@mantine/core';
import { PDFDownloadLink } from '@react-pdf/renderer';
import firebase from 'firebase/compat';
import { FC, useMemo, useState } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import COLLECTIONS from '../../enums/COLLECTIONS';
import useFirestoreDocuments from '../../hooks/useFirestoreDocuments';
import { BookingInterface } from '../../interfaces/Booking';
import { Invoice } from '../../interfaces/invoice.interface';
import { SettingsInterface } from '../../interfaces/Settings';
import { sendMail } from '../../services/postmark.service';
import { Details } from './Details';
import { Receipt } from './Receipt';

import DocumentReference = firebase.firestore.DocumentReference;

export const Invoices: FC = () => {
  const [invoiceRef, setInvoiceRef] = useState<DocumentReference<Invoice> | true>();
  const { documents: invoices, loading } = useFirestoreDocuments<Invoice>(
    COLLECTIONS.INVOICES,
    true,
  );

  if (loading) return <Loader />;

  const closeHandler = () => setInvoiceRef(undefined);
  const newHandler = () => setInvoiceRef(true);

  return (
    <>
      <Modal opened={!!invoiceRef} onClose={closeHandler} title="Factuur" size="70%">
        <InvoiceModal
          invoiceRef={invoiceRef === true ? undefined : invoiceRef}
          closeHandler={closeHandler}
        />
      </Modal>

      <div>
        <Group>
          <Title>Facturen</Title>
          <Button onClick={newHandler}>Nieuw</Button>
        </Group>
        {invoices && !!invoices.length && (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Referentie (ID)</th>
                <th>Datum</th>
                <th>Periode</th>
                <th>Kamer</th>
                <th>Klant</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .sort((a, b) => (a.number > b.number ? 1 : b.number > a.number ? -1 : 0))
                .map((invoice) => {
                  return (
                    <tr
                      onClick={() => setInvoiceRef(invoice._ref)}
                      key={invoice.id}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      <td>{invoice.number}</td>
                      <td>{invoice.date.toDate().toLocaleDateString('Nl-nl')}</td>
                      <td>
                        Van {invoice.from.toDate().toLocaleDateString('Nl-nl')} tot{' '}
                        {invoice.to.toDate().toLocaleDateString('Nl-nl')}
                      </td>
                      <BookingDetails bookingRef={invoice.booking} />
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

interface BookingDetailsProps {
  bookingRef: DocumentReference<BookingInterface>;
}

const BookingDetails: FC<BookingDetailsProps> = ({ bookingRef }) => {
  const [booking, loading] = useDocumentData<BookingInterface>(bookingRef);

  if (loading)
    return (
      <>
        <td>
          <Loader />
        </td>
        <td>
          <Loader />
        </td>
      </>
    );

  if (booking)
    return (
      <>
        <td>{booking.room.name}</td>
        <td>
          {booking.customer.name}
          {booking.customer.secondName && ` - ${booking.customer.secondName}`}
        </td>
      </>
    );

  return (
    <>
      <td></td>
      <td></td>
    </>
  );
};

interface InvoiceModalProps {
  invoiceRef: undefined | DocumentReference<Invoice>;
  closeHandler: () => void;
}

const InvoiceModal: FC<InvoiceModalProps> = ({ invoiceRef }) => {
  const [invoice] = useDocumentData<Invoice>(invoiceRef);
  const [booking, loadingBooking] = useDocumentData<BookingInterface>(invoice?.booking);
  const { documents: settingsArray } = useFirestoreDocuments<SettingsInterface>(
    COLLECTIONS.SETTINGS,
    true,
  );

  const settings = useMemo<SettingsInterface>(
    // @ts-ignore
    () => settingsArray && settingsArray[0],
    [settingsArray],
  );

  if (!invoice) return <Loader />;

  return (
    <div>
      <Group mb="md">
        {booking && (
          <>
            <Button>Ga naar boeking</Button>
            <PDFDownloadLink
              document={
                <Receipt invoice={invoice} settings={settings} booking={booking} />
              }
              fileName={`Factuur ${invoice.number}.pdf`}
            >
              <Button>Download Factuur</Button>
            </PDFDownloadLink>
            <Button
              onClick={() => {
                sendMail({
                  to: 'mees11@hotmail.nl',
                  title: 'Nieuwe factuur',
                  body: 'Dit is slechts een test mail.',
                });
              }}
            >
              Mail Factuur
            </Button>
          </>
        )}
      </Group>
      <table width={500}>
        <tr>
          <td>Referentie (ID):</td>
          <td>{invoice.number}</td>
        </tr>
        <tr>
          <td>Datum:</td>
          <td>{invoice.date.toDate().toLocaleDateString('Nl-nl')}</td>
        </tr>
        <tr>
          <td>Periode:</td>
          <td>
            Van {invoice.from.toDate().toLocaleDateString('Nl-nl')} tot{' '}
            {invoice.to.toDate().toLocaleDateString('Nl-nl')}
          </td>
        </tr>
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
                {booking.customer.secondName && ` - ${booking.customer.secondName}`}
              </td>
            </tr>
          </>
        )}
      </table>
      {booking && <Details invoice={invoice} booking={booking} />}
    </div>
  );
};
