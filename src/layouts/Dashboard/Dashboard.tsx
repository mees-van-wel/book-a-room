import {
  Anchor,
  AppShell,
  Burger,
  Button,
  Group,
  Header,
  Loader,
  MediaQuery,
  Navbar,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { signOut } from 'firebase/auth';
import { FC, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import ROUTES from '../../enums/ROUTES';
import { auth } from '../../lib/firebase';
import routes, { routesArray } from '../../routes';
import Page from '../Page';

const Dashboard: FC = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [opened, setOpened] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();

  useEffect(() => {
    if (!loading && !user) navigate(routes[ROUTES.AUTH].path);
  }, [loading, user]);

  if (loading || (!loading && !user))
    return (
      <Page>
        <Loader />
      </Page>
    );

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      styles={(theme) => ({
        main: {
          backgroundColor: theme.colors.dark[8],
          display: 'flex',
          flexDirection: 'column',
        },
      })}
      fixed
      navbar={
        <Navbar
          padding="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        >
          <Group direction="column" spacing="sm">
            {routesArray.map(({ label, path }) => {
              if (label)
                return (
                  <Anchor
                    onClick={() => setOpened(false)}
                    key={path}
                    component={Link}
                    to={path}
                    style={{
                      width: '100%',
                    }}
                  >
                    <Button
                      style={{
                        width: '100%',
                      }}
                      variant={pathname === path ? 'filled' : 'outline'}
                    >
                      {label}
                    </Button>
                  </Anchor>
                );
            })}
            <Button
              style={{
                width: '100%',
              }}
              variant="outline"
              color="red"
              onClick={() => signOut(auth)}
            >
              Logout
            </Button>
          </Group>
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
      <div
        style={{
          flexGrow: 1,
        }}
      >
        {children}
      </div>
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#1A1B1E',
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
          Developed by{' '}
          <Anchor target="_blank" href="https://meesvanwel.nl/">
            Mees van Wel
          </Anchor>
          {' @ '}
          <Anchor target="_blank" href="https://hexa-it.nl/">
            Hexa-IT
          </Anchor>
        </Text>
      </div>
    </AppShell>
  );
};

export default Dashboard;
