import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { routesArray } from './routes';

const Router = () => (
  <BrowserRouter>
    <Routes>
      {routesArray.map(({ path, layout: Layout, element: Element }) => (
        <Route
          key={path}
          path={path}
          element={
            <Layout>
              <Element />
            </Layout>
          }
        />
      ))}
    </Routes>
  </BrowserRouter>
);

export default Router;
