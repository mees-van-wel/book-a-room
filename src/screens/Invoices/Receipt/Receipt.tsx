import pdf from "@react-pdf/renderer";
import { InvoiceType } from "../../../enums/invoiceType.enum";
import { Invoice } from "../../../interfaces/invoice.interface";
import InvoiceItemsTable from "./InvoiceItemsTable";

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
    flexWrap: "wrap",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

interface ReceiptProps {
  images?: {
    dir: string;
    header?: string;
    footer?: string;
  };
  invoice: Invoice;
}

export const Receipt = ({ images, invoice }: ReceiptProps) => {
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
            <Text>{invoice.company.name}</Text>
            <Text>{invoice.company.adres}</Text>
            <Text>
              {invoice.company.postalCode} {invoice.company.city}
            </Text>
            <View style={styles.spacer} />
            <Text>Email: {invoice.company.email}</Text>
            <Text>Telephone number: {invoice.company.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>Chamber of Commerce number: {invoice.company.cocNumber}</Text>
            <Text>VAT number: {invoice.company.vatNumber}</Text>
            <View style={styles.spacer} />
            <Text>Swift (BIC) code: {invoice.company.bicCode}</Text>
            <Text>IBAN: {invoice.company.iban}</Text>
          </View>
          <View>
            <Text>{invoice.customer.name}</Text>
            <Text>{invoice.customer.adres}</Text>
            <Text>
              {invoice.customer.postalCode} {invoice.customer.city}
            </Text>
            <View style={styles.spacer} />
            <Text>Email: {invoice.customer.email}</Text>
            <Text>Telephone number: {invoice.customer.phoneNumber}</Text>
            <View style={styles.spacer} />
            <Text>Room: {invoice.roomName}</Text>
            <Text>
              Billing period:{" "}
              {`${invoice.from
                .toDate()
                .toLocaleDateString("Nl-nl")} - ${invoice.to
                .toDate()
                .toLocaleDateString("Nl-nl")}`}
            </Text>
            {invoice.extra ? <Text>{invoice.extra}</Text> : <Text />}
          </View>
          <InvoiceItemsTable invoice={invoice} />
          <View style={styles.spacer} />
          <View style={styles.spacer} />
          {invoice.type !== InvoiceType.Credit ? (
            <Text>
              We kindly request that you transfer the amount due within 14 days.
            </Text>
          ) : (
            <Text />
          )}
        </View>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {images?.footer && <Image src={`${images.dir}/${images.footer}`} />}
      </Page>
    </Document>
  );
};
