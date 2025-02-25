import {
  Button,
  ColorScheme,
  Group,
  NumberInput,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import isEqual from "lodash.isequal";
import { FC, useMemo } from "react";

import { Collection } from "../../enums/collection.enum";
import { SettingsInterface } from "../../interfaces/Settings";
import { firestore } from "../../lib/firebase";

interface FormProps {
  settings?: SettingsInterface;
}

const Setting: FC<FormProps> = ({ settings }) => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
  });

  const form = useForm<SettingsInterface>({
    initialValues: {
      invoices: settings?.invoices ?? undefined,
      companyName: settings?.companyName ?? "",
      email: settings?.email ?? "",
      phoneNumber: settings?.phoneNumber ?? "",
      street: settings?.street ?? "",
      houseNumber: settings?.houseNumber ?? "",
      postalCode: settings?.postalCode ?? "",
      city: settings?.city ?? "",
      kvkNumber: settings?.kvkNumber ?? "",
      btwNumber: settings?.btwNumber ?? "",
      bicCode: settings?.bicCode ?? "",
      iban: settings?.iban ?? "",
      id: settings?.id ?? "",
    },
  });

  const isDirty = useMemo(
    () => !isEqual(form.values, settings),
    [form.values, settings]
  );

  const submitHandler = async (values: SettingsInterface) => {
    if (!settings)
      await addDoc(collection(firestore, Collection.Settings), values);
    else await setDoc(doc(firestore, Collection.Settings, settings.id), values);

    showNotification({
      color: "green",
      message: "Opgeslagen",
    });
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(submitHandler)}>
        <Group>
          <Title>Instellingen</Title>
          {isDirty && <Button type="submit">Opslaan</Button>}
        </Group>
        <NumberInput
          label="Factuurnummer"
          placeholder="Factuurnummer"
          {...form.getInputProps("invoices")}
        />
        <TextInput
          required
          label="Bedrijfsnaam"
          placeholder="Bedrijfsnaam"
          {...form.getInputProps("companyName")}
        />
        <Group grow>
          <TextInput
            required
            label="E-mail"
            type="email"
            placeholder="E-mail"
            {...form.getInputProps("email")}
          />
          <TextInput
            label="Telefoonnummer"
            type="tel"
            placeholder="Telefoonnummer"
            {...form.getInputProps("phoneNumber")}
          />
        </Group>
        <Group grow>
          <TextInput
            required
            label="Straatnaam"
            placeholder="Straatnaam"
            {...form.getInputProps("street")}
          />
          <TextInput
            required
            label="Huisnummer"
            placeholder="Huisnummer"
            {...form.getInputProps("houseNumber")}
          />
        </Group>
        <Group grow>
          <TextInput
            required
            label="Postcode"
            placeholder="Postcode"
            {...form.getInputProps("postalCode")}
          />
          <TextInput
            required
            label="Plaats"
            placeholder="Plaats"
            {...form.getInputProps("city")}
          />
        </Group>
        <Group grow>
          <TextInput
            required
            label="KvK-nummer"
            placeholder="KvK-nummer"
            {...form.getInputProps("kvkNumber")}
          />
          <TextInput
            required
            label="BTW-nummer"
            placeholder="BTW-nummer"
            {...form.getInputProps("btwNumber")}
          />
        </Group>
        <Group grow>
          <TextInput
            required
            label="Swift / BIC"
            placeholder="Swift / BIC"
            {...form.getInputProps("bicCode")}
          />
          <TextInput
            required
            label="IBAN"
            placeholder="IBAN"
            {...form.getInputProps("iban")}
          />
        </Group>
      </form>
      <Title mt="md">Voorkeuren</Title>
      <Button
        mt="xs"
        onClick={() =>
          setColorScheme((current) => (current === "dark" ? "light" : "dark"))
        }
      >
        {colorScheme === "dark" ? "Lichte modus" : "Donkere modus"}
      </Button>
    </div>
  );
};

export default Setting;
