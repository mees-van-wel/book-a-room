import ROUTES from './enums/ROUTES';
import Dashboard from './layouts/Dashboard';
import Page from './layouts/Page';
import Auth from './screens/Auth';
import Bookings from './screens/Bookings';
import NotFoundError from './screens/NotFoundError';
import Rooms from './screens/Rooms';

const routes = {
  [ROUTES.BOOKINGS]: {
    path: '/',
    label: 'Bookings',
    element: Bookings,
    layout: Dashboard,
  },
  [ROUTES.ROOMS]: {
    path: '/rooms',
    label: 'Rooms',
    element: Rooms,
    layout: Dashboard,
  },
  [ROUTES.AUTH]: {
    path: '/auth',
    element: Auth,
    layout: Page,
  },
  [ROUTES.WILDCARD]: {
    path: '*',
    element: NotFoundError,
    layout: Page,
  },
} as const;

export default routes;

export const routesArray = Object.values(routes);
