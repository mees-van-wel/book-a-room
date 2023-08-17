import pdf from "@react-pdf/renderer";
import { SettingsInterface } from "../../../interfaces/Settings";
import { bookingCalculator } from "../../../utils/bookingCalculator";
import currency from "../../../utils/currency";
import { Booking } from "../../../interfaces/booking.interface";
import { Timestamp } from "firebase/firestore";
import { compareDates } from "../../Bookings/Booking";
import { InvoiceType } from "../../../enums/invoiceType.enum";

const { Document, Page, Text, View, StyleSheet, Image } = pdf;

const styles = StyleSheet.create({
  page: {
    fontSize: 11,
    flexDirection: "column",
  },
  container: {
    padding: "16px 32px 32px 32px",
  },
  settingsContainer: {
    alignItems: "flex-end",
  },
  line: {
    marginVertical: 8,
    height: 1,
    backgroundColor: "black",
    width: 100,
  },
  spacer: {
    marginVertical: 4,
  },
  table: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    paddingBottom: 4,
    marginBottom: 4,
    borderBottom: "1px solid black",
  },
  image: {
    marginBottom: 10,
  },
});

interface DeprecatedReceiptProps {
  images?: {
    dir: string;
    header?: string;
    footer?: string;
  };
  invoice: {
    type: InvoiceType;
    number: number | string;
    date: Timestamp;
    from: Timestamp;
    to: Timestamp;
  };
  settings: SettingsInterface;
  booking: Booking;
}

export const DeprecatedReceipt = ({
  images,
  invoice,
  settings,
  booking,
}: DeprecatedReceiptProps) => {
  const from = new Date(invoice.from.seconds * 1000);
  const to = new Date(invoice.to.seconds * 1000);

  const isLastInvoice = compareDates(new Date(booking.end.seconds * 1000), to);

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
    fromDate: from,
    toDate: to,
    touristTax: booking.touristTax,
    roomPrice: booking.room.price,
    roomvatPercentage: parseInt(booking.btw),
    cleaningPrice: booking.cleaningFee,
    cleaningVatPercentage: parseInt(booking.cleaningFeeVat),
    parkingPrice: booking.parkingFee,
    parkingVatPercentage: parseInt(booking.parkingFeeVat),
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {images?.header && <Image src={`${images.dir}/${images.header}`} />}
        <View style={styles.container}>
          <View style={styles.settingsContainer}>
            <Text>
              Type:{" "}
              {invoice.type === InvoiceType.Credit ? "CREDIT NOTE" : "Invoice"}
            </Text>
            <Text>Number: {invoice.number}</Text>
            <Text>
              Date:{" "}
              {new Date(invoice.date.seconds * 1000).toLocaleDateString(
                "nl-NL"
              )}
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
              <Text>
                {booking.room.name} ({from.toLocaleDateString("nl-NL")}
                {" - "}
                {to.toLocaleDateString("nl-NL")})
              </Text>
              {cleaning && isLastInvoice ? <Text>Cleaning fee</Text> : <Text />}
              {parking ? <Text>Parking costs</Text> : <Text />}
              {tourist ? <Text>Tourist tax</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Unit price</Text>
              <Text>{currency(room.priceWithoutVat)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.priceWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {parking ? (
                <Text>{currency(parking.priceWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {tourist ? <Text>{currency(booking.touristTax)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Amount</Text>
              <Text>{nights}</Text>
              {cleaning && isLastInvoice ? <Text>{nights}</Text> : <Text />}
              {parking ? <Text>{nights}</Text> : <Text />}
              {tourist ? <Text>{nights}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total excluding VAT</Text>
              <Text>{currency(room.totalWithoutVat)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.totalWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {parking ? (
                <Text>{currency(parking.totalWithoutVat)}</Text>
              ) : (
                <Text />
              )}
              {tourist ? <Text>{currency(tourist.total)}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>VAT</Text>
              <Text>{`${currency(room.vat)} (${booking.btw}%${
                parseInt(booking.btw) == 0 ? " / Verlegd" : ""
              })`}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{`${currency(cleaning.vat)} (${booking.cleaningFeeVat}%${
                  parseInt(booking.cleaningFeeVat) == 0 ? " / Verlegd" : ""
                })`}</Text>
              ) : (
                <Text />
              )}
              {parking ? (
                <Text>{`${currency(parking.vat)} (${booking.parkingFeeVat}%${
                  parseInt(booking.parkingFeeVat) == 0 ? " / Verlegd" : ""
                })`}</Text>
              ) : (
                <Text />
              )}
              {tourist ? <Text>{`${currency(0)} (0%)`}</Text> : <Text />}
            </View>
            <View>
              <Text style={styles.header}>Total</Text>
              <Text>{currency(room.total)}</Text>
              {cleaning && isLastInvoice ? (
                <Text>{currency(cleaning.total)}</Text>
              ) : (
                <Text />
              )}
              {parking ? <Text>{currency(parking.total)}</Text> : <Text />}
              {tourist ? <Text>{currency(tourist.total)}</Text> : <Text />}
            </View>
          </View>
          <View style={styles.spacer} />
          <Text>Total excluding VAT: {currency(totalWithoutVat)}</Text>
          <Text>Total VAT: {currency(vat)}</Text>
          <Text>Total: {currency(total)}</Text>
          <View style={styles.spacer} />
          <View style={styles.spacer} />
          {invoice.type === InvoiceType.Normal && (
            <Text>
              We kindly request that you transfer the amount due within 14 days.
            </Text>
          )}
        </View>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {images?.footer && <Image src={`${images.dir}/${images.footer}`} />}
      </Page>
    </Document>
  );
};
