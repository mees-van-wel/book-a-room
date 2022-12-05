import {
  Anchor,
  AppShell,
  Burger,
  Header,
  Loader,
  MediaQuery,
  Navbar,
  NavLink,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { signOut } from "firebase/auth";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Collection } from "../../enums/collection.enum";
import useFirestoreDocuments from "../../hooks/useFirestoreDocuments";
import { SettingsInterface } from "../../interfaces/Settings";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/router";
import { Page } from "../Page";
import { Route } from "../../enums/route.enum";
import Link from "next/link";
import { Settings } from "../../screens/Settings";

const Dashboard = ({ children }: { children: ReactNode }) => {
  const { documents: settingsArray, loading: settingsLoading } =
    useFirestoreDocuments<SettingsInterface>(Collection.Settings, true);
  const settings = useMemo(
    () => settingsArray && settingsArray[0],
    [settingsArray]
  );

  const [user, loading] = useAuthState(auth);
  const [opened, setOpened] = useState(false);
  const router = useRouter();
  const theme = useMantineTheme();

  useEffect(() => {
    if (!loading && !user) router.replace(Route.Auth);
  }, [loading, router, user]);

  if (loading || (!loading && !user))
    return (
      <Page>
        <Loader />
      </Page>
    );
  else if (!settingsLoading && !settings)
    return (
      <Page>
        <Settings />
      </Page>
    );

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      styles={() => ({
        main: {
          display: "flex",
          flexDirection: "column",
        },
      })}
      fixed
      navbar={
        <Navbar
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Stack spacing="sm">
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.Bookings}
              passHref
            >
              <NavLink
                active={
                  router.pathname === Route.Bookings ||
                  router.pathname === Route.Booking
                }
                component="a"
                label="Boekingen"
              />
            </Link>
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.Invoices}
              passHref
            >
              <NavLink
                active={
                  router.pathname === Route.Invoices ||
                  router.pathname === Route.Invoice
                }
                component="a"
                label="Facturen"
              />
            </Link>
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.Customers}
              passHref
            >
              <NavLink
                active={
                  router.pathname === Route.Customers ||
                  router.pathname === Route.Customer
                }
                component="a"
                label="Klanten"
              />
            </Link>
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.Rooms}
              passHref
            >
              <NavLink
                active={
                  router.pathname === Route.Rooms ||
                  router.pathname === Route.Room
                }
                component="a"
                label="Kamers"
              />
            </Link>
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.CleaningSchedule}
              passHref
            >
              <NavLink
                active={router.pathname === Route.CleaningSchedule}
                component="a"
                label="Schoonmaakrooster"
              />
            </Link>
            <Link
              onClick={() => {
                setOpened(false);
              }}
              href={Route.Settings}
              passHref
            >
              <NavLink
                active={router.pathname === Route.Settings}
                component="a"
                label="Instellingen"
              />
            </Link>
            <NavLink
              color="red"
              active
              variant="subtle"
              onClick={() => signOut(auth)}
              label="Uitloggen"
            />
          </Stack>
        </Navbar>
      }
      header={
        <Header height={70} p={16}>
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Title>Book a room</Title>
          </div>
        </Header>
      }
    >
      <div
        style={{
          flexGrow: 1,
        }}
      >
        {children}
      </div>
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginLeft: -16,
          marginRight: -16,
          marginBottom: -16,
          paddingTop: 8,
          paddingBottom: 8,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <Text>
          Developed by{" "}
          <Anchor target="_blank" href="https://hexa-it.nl/">
            Hexa-IT
          </Anchor>
          {" - "}
          Version 1.1.3
        </Text>
      </div>
    </AppShell>
  );
};

export default Dashboard;
