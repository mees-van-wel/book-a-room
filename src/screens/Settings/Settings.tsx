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
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import TwinfieldLogo from "../../assets/images/Twinfield-logo.png";

export const Settings: NextPageWithLayout = () => {
  const { session, setSession, disconnect } = useGlobalContext();

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
          withBorder
          style={{
            position: "relative",
            maxWidth: 300,
          }}
        >
          <Card.Section>
            <Image
              src={TwinfieldLogo}
              width={250}
              height={69}
              alt="Norway"
              style={{
                marginTop: 20,
                padding: "0px 32px",
                objectFit: "contain",
              }}
            />
          </Card.Section>
          <Badge
            radius={0}
            color={session ? "green" : "red"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {session ? "Verbonden" : "Niet verbonden"}
          </Badge>
          {session ? (
            <Button fullWidth onClick={disconnect}>
              Ontkoppelen
            </Button>   
          ) : (
            <Link
              href={`https://login.twinfield.com/auth/authentication/connect/authorize?client_id=book-a-room&redirect_uri=${process.env.NEXT_PUBLIC_TW_REDIRECT_URI}&response_type=code&scope=openid+twf.organisationUser+twf.user+twf.organisation+offline_access&state=state&nonce=nonce`}
            >
              <Button fullWidth>Koppelen</Button>
            </Link>
          )}
        </Card>
      </Group>
    </Stack>
  );
};

Settings.getLayout = (page: ReactElement) => <Dashboard>{page}</Dashboard>;
