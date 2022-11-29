import { View, StyleSheet } from "@react-pdf/renderer";
import InvoiceTableHeader from "./InvoiceTableHeader";
import InvoiceTableRow from "./InvoiceTableRow";
import InvoiceTableFooter from "./InvoiceTableFooter";
import { Invoice } from "../../../interfaces/invoice.interface";

const styles = StyleSheet.create({
  tableContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#bff0fd",
  },
});

const InvoiceItemsTable = ({ invoice }: { invoice: Invoice }) => (
  <View style={styles.tableContainer}>
    <InvoiceTableHeader />
    <InvoiceTableRow items={invoice.lines} />
    <InvoiceTableFooter items={invoice.lines} />
  </View>
);

export default InvoiceItemsTable;
