import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { adminStore } from './store/adminStore';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminRoutes } from './routes/AdminRoutes';

export const App: React.FC = () => (
  <Provider store={adminStore}>
    <BrowserRouter>
      <AdminLayout>
        <AdminRoutes />
      </AdminLayout>
    </BrowserRouter>
  </Provider>
);

export default App;
