const getInvoiceNumber = (number = 1) =>
  `${new Date().getFullYear()}${String(number).padStart(4, '0')}`;

export default getInvoiceNumber;
