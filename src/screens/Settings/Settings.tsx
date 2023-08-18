import {
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Title,
  Badge,
} from "@mantine/core";
import { ReactElement, useMemo } from "react";
import { NextPageWithLayout } from "../../../pages/_app";
import { Collection } from "../../enums/collection.enum";
import Setting from "../../forms/Setting";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { SettingsInterface } from "../../interfaces/Settings";
import Dashboard from "../../layouts/Dashboard";
import Image from "next/image";
import Link from "next/link";
import { useGlobalContext } from "../../providers/GlobalProvider";

export const Settings: NextPageWithLayout = () => {
  const { session, setSession, timeoutRef } = useGlobalContext();

  const { documents: settingsArray, loading } =
    useFirestoreDocuments<SettingsInterface>(Collection.Settings, true);

  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  if (loading) return <Loader />;

  return (
    <Stack>
      <Setting settings={settings} />
      <Title>Koppelingen</Title>
      <Group>
        <Card
          style={{
            background: "#25262b",
            position: "relative",
            maxWidth: 300,
          }}
        >
          <Card.Section>
            <Image
              src="https://cdn.wolterskluwer.io/wk/fundamentals/1.x.x/logo/assets/white-medium.svg"
              width={300}
              height={100}
              alt="Norway"
              style={{
                padding: "0px 32px",
                objectFit: "contain",
              }}
            />
          </Card.Section>
          <Badge
            color={session ? "green" : "red"}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            {session ? "Verbonden" : "Niet verbonden"}
          </Badge>
          {session ? (
            <Button
              fullWidth
              onClick={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                window.localStorage.removeItem("twinfield");
                setSession(false);
              }}
            >
              Ontkoppelen
            </Button>
          ) : (
            <Link href="https://login.twinfield.com/auth/authentication/connect/authorize?client_id=book-a-room&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fsettings&response_type=code&scope=openid+twf.organisationUser+twf.user+twf.organisation+offline_access&state=state&nonce=nonce">
              <Button fullWidth>Koppelen</Button>
            </Link>
          )}
        </Card>
      </Group>
    </Stack>
  );
};

Settings.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
