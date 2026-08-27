import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardOverviewPage } from '../pages/DashboardOverviewPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ProductsListPage } from '../pages/ProductsListPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { CategoriesListPage } from '../pages/CategoriesListPage';
import { InventoryManagementPage } from '../pages/InventoryManagementPage';
import { OrdersListPage } from '../pages/OrdersListPage';
import { OrderDetailsAdminPage } from '../pages/OrderDetailsAdminPage';
import { CouponsManagementPage } from '../pages/CouponsManagementPage';
import { UsersManagementPage } from '../pages/UsersManagementPage';
import { ReviewsManagementPage } from '../pages/ReviewsManagementPage';
import { BannerManagementPage } from '../pages/BannerManagementPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminProtectedRoute } from './AdminProtectedRoute';

export const AdminRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<AdminProtectedRoute />}>
      <Route path="/" element={<DashboardOverviewPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/products" element={<ProductsListPage />} />
      <Route path="/products/new" element={<ProductFormPage />} />
      <Route path="/products/edit/:id" element={<ProductFormPage />} />
      <Route path="/categories" element={<CategoriesListPage />} />
      <Route path="/inventory" element={<InventoryManagementPage />} />
      <Route path="/orders" element={<OrdersListPage />} />
      <Route path="/orders/:id" element={<OrderDetailsAdminPage />} />
      <Route path="/coupons" element={<CouponsManagementPage />} />
      <Route path="/users" element={<UsersManagementPage />} />
      <Route path="/reviews" element={<ReviewsManagementPage />} />
      <Route path="/banners" element={<BannerManagementPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Routes>
);
