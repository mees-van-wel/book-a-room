import { Group, Loader, Table, Title } from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import firebase from "firebase/compat";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { NextPageWithLayout } from "../../../pages/_app";
import { Collection } from "../../enums/collection.enum";
import { InvoiceType } from "../../enums/invoiceType.enum";
import { Route } from "../../enums/route.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { Booking } from "../../interfaces/booking.interface";
import { Customer } from "../../interfaces/customer.interface";
import { Invoice } from "../../interfaces/invoice.interface";
import { Room } from "../../interfaces/room.interface";
import Dashboard from "../../layouts/Dashboard";
import { getCustomer, getRoom } from "../Bookings";

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
                        {invoice.date.toDate().toLocaleDateString("nl-NL")}
                      </td>
                      <td>
                        Van {invoice.from.toDate().toLocaleDateString("nl-NL")}{" "}
                        tot {invoice.to.toDate().toLocaleDateString("nl-NL")}
                      </td>
                      {invoice.lines ? (
                        <>
                          <td>{invoice.roomName}</td>
                          <td>{invoice.customer.name}</td>
                        </>
                      ) : (
                        <DeprecatedBookingDetails
                          //  @ts-ignore
                          bookingRef={invoice.booking}
                        />
                      )}
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

interface DeprecatedBookingDetailsProps {
  bookingRef: DocumentReference<Booking>;
}

const DeprecatedBookingDetails = ({
  bookingRef,
}: DeprecatedBookingDetailsProps) => {
  // @ts-ignore
  const [booking] = useDocumentData<Booking>(bookingRef);
  const [room, setRoom] = useState<Room>();
  const [customer, setCustomer] = useState<Customer>();

  useDidUpdate(() => {
    if (!booking) return;

    (async () => {
      const room = await getRoom(booking);
      if (room) setRoom(room);

      const customer = await getCustomer(booking);
      if (customer) setCustomer(customer);
    })();
  }, [booking]);

  if (booking && room && customer)
    return (
      <>
        <td>{room.name}</td>
        <td>
          {customer.name}
          {customer.secondName && ` - ${customer.secondName}`}
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
