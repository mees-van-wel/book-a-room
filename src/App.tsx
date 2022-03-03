import './index.css';

import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import React from 'react';

import Router from './Router';

export const App = () => (
  <MantineProvider theme={{ colorScheme: 'dark' }}>
    <NotificationsProvider position="top-right">
      <Router />
    </NotificationsProvider>
  </MantineProvider>
);
