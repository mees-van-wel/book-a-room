import { Button, Group, Loader, NumberInput, TextInput } from "@mantine/core";
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
import { RoomInterface } from "../../../interfaces/Room";
import Dashboard from "../../../layouts/Dashboard";
import { firestore } from "../../../lib/firebase";
import { createRef } from "../../../utils/createRef.utility";
import { generateRoute } from "../../../utils/generateRoute.utility";

export const Room: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;

  const [room, loading] = useDocumentData(
    createRef<RoomInterface>(Collection.Rooms, id)
  );

  return loading ? <Loader /> : <RoomForm room={room} />;
};

interface FormValues {
  name: string;
  price?: number | undefined;
}

interface RoomFormProps {
  room?: RoomInterface;
}

const RoomForm = ({ room }: RoomFormProps) => {
  const router = useRouter();
  const id = router.query.id as string;

  const form = useForm<FormValues>({
    initialValues: room ?? {
      name: "",
      price: undefined,
    },
  });

  const submitHandler = async (values: FormValues) => {
    if (!room) {
      const roomSnapshot = await addDoc(
        collection(firestore, Collection.Rooms),
        values
      );

      await router.push(generateRoute(Route.Room, { id: roomSnapshot.id }));
    } else {
      await setDoc(doc(firestore, Collection.Rooms, id), values);
      form.resetDirty();
    }

    showNotification({
      color: "green",
      message: "Opgeslagen",
    });
  };

  const deleteHandler = async () => {
    await deleteDoc(doc(firestore, Collection.Rooms, id));

    await router.push(Route.Rooms);

    showNotification({
      color: "green",
      message: "Verwijderd",
    });
  };

  return (
    <form onSubmit={form.onSubmit(submitHandler)}>
      <Group mb={16}>
        <Link passHref href={Route.Rooms}>
          <Button component="a">Naar overzicht</Button>
        </Link>
        {(!room || form.isDirty()) && <Button type="submit">Opslaan</Button>}
        {room && (
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
      <NumberInput
        required
        min={0}
        noClampOnBlur
        decimalSeparator=","
        icon="€"
        label="Prijs per nacht"
        placeholder="Prijs per nacht"
        {...form.getInputProps("price")}
      />
    </form>
  );
};

Room.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
