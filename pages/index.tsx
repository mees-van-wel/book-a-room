import type { NextPage } from 'next'
import {useAuthState} from "react-firebase-hooks/auth";
import firebase from "../firebase/client";
import {useRouter} from "next/router";
import {
  AppShell,
  Header,
  Navbar,
  UnstyledButton,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  ThemeIcon, Group, Button, Title
} from "@mantine/core";
import {useEffect, useState} from "react";
import useFirestoreDocuments from "../hooks/useFirestoreDocuments";
import useFirestoreDocument from "../hooks/useFirestoreDocument";
import Booking from "../interfaces/booking";
import Room from "../interfaces/room";
import dayjs from "dayjs";
import {IoBusinessOutline} from "react-icons/io5";

const Room = ({booking: {start, end, room: roomRef}}: {booking: Booking}) => {
  const [room] = useFirestoreDocument<Room>(roomRef);
  start = dayjs(start.seconds * 1000);
  end = dayjs(end.seconds * 1000);

  return (
    <div>
      {room?.name}
      <br />
      € {room?.price} X {end.diff(start, 'days')} Days = € {end.diff(start, 'days') * room?.price}
      <br/>
    </div>
  )
};

const Home: NextPage = () => {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const router = useRouter();
  const [user, loading] = useAuthState(firebase.auth())
  const [bookings] = useFirestoreDocuments<Booking>('bookings');

  useEffect(() => {
    if (!loading && !user) void router.replace('/auth');
  })

  if (loading || (!loading && !user)) return null

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
      fixed
      navbar={
        <Navbar
          padding="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Button leftIcon={<IoBusinessOutline />} variant='light'>
            Rooms
          </Button>
        </Navbar>
      }
      header={
        <Header height={70} padding="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
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
      <Text>{bookings?.map((booking, i) => {
        const {start, end } = booking;
        return (
          <div key={i}>
            {new Date(start.seconds * 1000).toString()}
            <br />
            {new Date(end.seconds * 1000).toString()}
            <br />
            <br />
            <Room booking={booking} />
          </div>
        )
      })}</Text>
    </AppShell>
  )
}

export default Home
