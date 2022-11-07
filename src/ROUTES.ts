import Dashboard from './layouts/Dashboard';
import Page from './layouts/Page';
import Auth from './screens/Auth';
import Bookings from './screens/Bookings';
import Customers from './screens/Customers/Customers';
import { Invoices } from './screens/Invoices';
import NotFoundError from './screens/NotFoundError';
import Rooms from './screens/Rooms';
import Settings from './screens/Settings';

const ROUTES = {
  BOOKINGS: {
    path: '/',
    label: 'Boekingen',
    element: Bookings,
    layout: Dashboard,
  },
  ROOMS: {
    path: '/rooms',
    label: 'Kamers',
    element: Rooms,
    layout: Dashboard,
  },
  CUSTOMERS: {
    path: '/customers',
    label: 'Klanten',
    element: Customers,
    layout: Dashboard,
  },
  INVOICES: {
    path: '/invoices',
    label: 'Facturen',
    element: Invoices,
    layout: Dashboard,
  },
  SETTINGS: {
    path: '/settings',
    label: 'Instellingen',
    element: Settings,
    layout: Dashboard,
  },
  AUTH: {
    path: '/auth',
    element: Auth,
    layout: Page,
  },
  WILDCARD: {
    path: '*',
    element: NotFoundError,
    layout: Page,
  },
} as const;

export default ROUTES;

export const routesArray = Object.values(ROUTES);
