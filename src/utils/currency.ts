const currency = (number: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(number);

export default currency;
