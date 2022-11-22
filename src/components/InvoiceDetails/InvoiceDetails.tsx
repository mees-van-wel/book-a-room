import { Table } from "@mantine/core";
import { FC } from "react";
import { Booking } from "../../interfaces/booking.interface";
import { Invoice } from "../../interfaces/invoice.interface";
import { compareDates } from "../../screens/Bookings/Booking";
import { bookingCalculator } from "../../utils/bookingCalculator";
import currency from "../../utils/currency";

interface InvoiceDetailsProps {
  invoice: Invoice;
  booking: Booking;
}

export const InvoiceDetails: FC<InvoiceDetailsProps> = ({
  invoice,
  booking,
}) => {
  const isLastInvoice = compareDates(booking.end.toDate(), invoice.to.toDate());

  const {
    nights,
    tourist,
    totalWithoutVat,
    vat,
    total,
    room,
    cleaning,
    parking,
  } = bookingCalculator({
    isLastInvoice,
    invoiceType: invoice.type,
    fromDate: invoice.from.toDate(),
    toDate: invoice.to.toDate(),
    touristTax: booking.touristTax,
    roomPrice: booking.room.price,
    roomvatPercentage: booking.btw,
    cleaningPrice: booking.cleaningFee,
    cleaningVatPercentage: booking.cleaningFeeVat,
    parkingPrice: booking.parkingFee,
    parkingVatPercentage: booking.parkingFeeVat,
  });

  return (
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
          <tr>
            <td>
              {booking.room.name} (
              {invoice.from.toDate().toLocaleDateString("Nl-nl")}
              {" - "}
              {invoice.to.toDate().toLocaleDateString("Nl-nl")})
            </td>
            <td>{currency(room.priceWithoutVat)}</td>
            <td>{nights}</td>
            <td>{currency(room.totalWithoutVat)}</td>
            <td>{`${currency(room.vat)} (${booking.btw}%${
              booking.btw == 0 ? " / Verlegd" : ""
            })`}</td>
            <td>{currency(room.total)}</td>
          </tr>
          {cleaning && isLastInvoice && (
            <tr>
              <td>Schoonmaakkosten</td>
              <td>{currency(cleaning.priceWithoutVat)}</td>
              <td>1</td>
              <td>{currency(cleaning.totalWithoutVat)}</td>
              <td>{`${currency(cleaning.vat)} (${booking.cleaningFeeVat}%${
                booking.cleaningFeeVat == 0 ? " / Verlegd" : ""
              })`}</td>
              <td>{currency(cleaning.total)}</td>
            </tr>
          )}
          {parking && (
            <tr>
              <td>Parkeerkosten</td>
              <td>{currency(parking.priceWithoutVat)}</td>
              <td>{nights}</td>
              <td>{currency(parking.totalWithoutVat)}</td>
              <td>{`${currency(parking.vat)} (${booking.parkingFeeVat}%${
                booking.parkingFeeVat == 0 ? " / Verlegd" : ""
              })`}</td>
              <td>{currency(parking.total)}</td>
            </tr>
          )}
          {tourist && (
            <tr>
              <td>Toeristenbelasting</td>
              <td>{currency(booking.touristTax)}</td>
              <td>{nights}</td>
              <td>{currency(tourist.total)}</td>
              <td>{`${currency(0)} (0%)`}</td>
              <td>{currency(tourist.total)}</td>
            </tr>
          )}
        </tbody>
      </Table>
      <p>Totaal excl. BTW: {currency(totalWithoutVat)}</p>
      <p>Totaal BTW: {currency(vat)}</p>
      <p>Totaal: {currency(total)}</p>
    </div>
  );
};
