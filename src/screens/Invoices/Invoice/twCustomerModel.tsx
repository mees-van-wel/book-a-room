import { Button, Select, SelectItem, Stack } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../providers/GlobalProvider";

export const TwCustomerModal = ({
  customerName,
  onConfirm,
}: {
  customerName: string;
  onConfirm: (customerId: string) => void;
}) => {
  const { session } = useGlobalContext();
  const [customerOptions, setCustomerOptions] = useState<SelectItem[]>();
  const [customerValue, setCustomerValue] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    (async () => {
      const { data } = await axios.get(
        `/api/customers?accessToken=${session.access_token}`
      );

      const customerOptions = data.dimensions.dimension
        // @ts-ignore
        .map(({ code, name }) => ({
          value: code._text,
          label: name._text,
        }))
        // @ts-ignore
        .filter(({ label, value }) => label && value);

      // @ts-ignore
      const defaultValue = customerOptions.find(({ label }) =>
        label?.includes(customerName)
      )?.value;

      if (defaultValue) setCustomerValue(defaultValue);

      setCustomerOptions(customerOptions);
    })();
  }, []);

  return (
    <Stack>
      <Select
        value={customerValue}
        withinPortal
        searchable
        label="Klant"
        disabled={!customerOptions}
        data={customerOptions || []}
      />
      <Button
        loading={!customerOptions}
        disabled={!customerValue}
        fullWidth
        onClick={() => customerValue && onConfirm(customerValue)}
      >
        Bevestig
      </Button>
    </Stack>
  );
};
