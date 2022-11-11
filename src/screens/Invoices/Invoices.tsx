import { Group, Loader, Table, Title } from "@mantine/core";
import firebase from "firebase/compat";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { NextPageWithLayout } from "../../../pages/_app";
import { Collection } from "../../enums/collection.enum";
import { InvoiceType } from "../../enums/invoiceType.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { Invoice } from "../../interfaces/invoice.interface";
import Dashboard from "../../layouts/Dashboard";

import DocumentReference = firebase.firestore.DocumentReference;

export const Invoices: NextPageWithLayout = () => {
  const { documents: invoices, loading } = useFirestoreDocuments<Invoice>(
    Collection.Invoices,
    true
  );

  const router = useRouter();

  if (loading) return <Loader />;

  return (
    <>
      <div>
        <Group>
          <Title>Facturen</Title>
        </Group>
        {invoices && !!invoices.length && (
          <Table highlightOnHover>
            <thead>
              <tr>
                <th>Type</th>
                <th>Nummer</th>
                <th>Datum</th>
                <th>Periode</th>
                <th>Kamer</th>
                <th>Klant</th>
              </tr>
            </thead>
            <tbody>
              {invoices
                .sort((a, b) => parseInt(b.number) - parseInt(a.number))
                .map((invoice) => {
                  return (
                    <tr
                      onClick={() => {
                        router.push({
                          pathname: Route.Invoice,
                          query: {
                            id: invoice.id,
                          },
                        });
                      }}
                      key={invoice.id}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <td>
                        {invoice.type === InvoiceType.Credit
                          ? "Creditfactuur"
                          : "Factuur"}
                      </td>
                      <td>{invoice.number}</td>
                      <td>
                        {invoice.date.toDate().toLocaleDateString("Nl-nl")}
                      </td>
                      <td>
                        Van {invoice.from.toDate().toLocaleDateString("Nl-nl")}{" "}
                        tot {invoice.to.toDate().toLocaleDateString("Nl-nl")}
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
  bookingRef: DocumentReference<Booking>;
}

const BookingDetails = ({ bookingRef }: BookingDetailsProps) => {
  const [booking, loading] = useDocumentData<Booking>(bookingRef);

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

Invoices.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
