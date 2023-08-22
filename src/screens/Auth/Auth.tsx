import {
  Button,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Page } from "@react-pdf/renderer";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { NextPageWithLayout } from "../../../pages/_app";
import { auth } from "../../lib/firebase";
import { Route } from "../../enums/route.enum";

interface FormValues {
  email: string;
  password: string;
}

export const Auth: NextPageWithLayout = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const form = useForm<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && !!user) router.replace(Route.Bookings);
  }, [loading, router, user]);

  const submitHandler = useCallback(async (values: FormValues) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (e) {
      showNotification({
        color: "red",
        title: "Inlog fout",
        message: "Ongeldig e-mailadres of wachtwoord",
      });
    }
  }, []);

  if (loading || (!loading && !!user)) return <Loader />;

  return (
    <div style={{ display: "grid", placeContent: "center", height: "100vh" }}>
      <Paper p="md" shadow="md" radius="md" withBorder w="300px">
        <form
          onSubmit={form.onSubmit(submitHandler)}
          style={{
            width: "100%",
          }}
        >
          <Stack>
            <Title>Inloggen</Title>
            <TextInput
              required
              label="E-mail"
              type="email"
              name="username"
              id="username"
              placeholder="E-mail"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              required
              label="Wachtwoord"
              name="password"
              id="password"
              placeholder="Wachtwoord"
              {...form.getInputProps("password")}
            />
            <Button type="submit" mt={16}>
              Inloggen
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
};

Auth.getLayout = (page: ReactElement) => <Page>{page}</Page>;
