import { Button, Group, Loader, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { addDoc, collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useCallback } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { NextPageWithLayout } from "../../../../pages/_app";
import { Collection } from "../../../enums/collection.enum";
import { Route } from "../../../enums/route.enum";
import { CustomerInterface } from "../../../interfaces/Customer";
import Dashboard from "../../../layouts/Dashboard";
import { firestore } from "../../../lib/firebase";
import { createRef } from "../../../utils/createRef.utility";
import { generateRoute } from "../../../utils/generateRoute.utility";

export const Customer: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [customer, loading] = useDocumentData(
    createRef<CustomerInterface>(Collection.Customers, id)
  );

  return loading ? <Loader /> : <CustomerForm customer={customer} />;
};

interface FormValues {
  name: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  extra: string;
}

interface CustomerFormProps {
  customer?: CustomerInterface;
}

const CustomerForm = ({ customer }: CustomerFormProps) => {
  const router = useRouter();
  const id = router.query.id as string;

  const form = useForm<FormValues>({
    initialValues: customer ?? {
      name: "",
      secondName: "",
      email: "",
      phoneNumber: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      extra: "",
    },
  });

  const submitHandler = async (values: FormValues) => {
    if (!customer) {
      const customerSnapshot = await addDoc(
        collection(firestore, Collection.Customers),
        values
      );

      await router.push(
        generateRoute(Route.Customer, { id: customerSnapshot.id })
      );
    } else {
      await setDoc(doc(firestore, Collection.Customers, id), values);
      form.resetDirty();
    }

    showNotification({
      color: "green",
      message: "Opgeslagen",
    });
  };

  const deleteHandler = async () => {
    await deleteDoc(doc(firestore, Collection.Customers, id));

    await router.push(Route.Customers);

    showNotification({
      color: "green",
      message: "Verwijderd",
    });
  };

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <Group mb={16}>
        <Link passHref href={Route.Customers}>
          <Button component="a">Naar overzicht</Button>
        </Link>
        {(!customer || form.isDirty()) && (
          <Button type="submit">Opslaan</Button>
        )}
        {customer && (
          <Button
            color="red"
            onClick={() => {
              openConfirmModal({
                title: "Weet je het zeker?",
                labels: { confirm: "Ja", cancel: "Nee" },
                onConfirm: deleteHandler,
              });
            }}
            variant="light"
          >
            Verwijderen
          </Button>
        )}
      </Group>
      <TextInput
        required
        label="Naam"
        placeholder="Naam"
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Tweede naam"
        placeholder="Tweede naam"
        {...form.getInputProps("secondName")}
      />
      <TextInput
        required
        type="email"
        label="E-mail"
        placeholder="E-mail"
        {...form.getInputProps("email")}
      />
      <TextInput
        required
        type="tel"
        label="Telefoonnummer"
        placeholder="Telefoonnummer"
        {...form.getInputProps("phoneNumber")}
      />
      <TextInput
        required
        label="Straat"
        placeholder="Straat"
        {...form.getInputProps("street")}
      />
      <TextInput
        required
        label="Huisnummer"
        placeholder="Huisnummer"
        {...form.getInputProps("houseNumber")}
      />
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
      <TextInput
        label="Extra"
        placeholder="Extra"
        {...form.getInputProps("extra")}
      />
    </form>
  );
};

Customer.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
