import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { WishlistPage } from '../pages/WishlistPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderSuccessPage } from '../pages/OrderSuccessPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { ProfilePage } from '../pages/ProfilePage';
import { OrdersHistoryPage } from '../pages/OrdersHistoryPage';
import { OrderDetailsPage } from '../pages/OrderDetailsPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { AboutUsPage } from '../pages/AboutUsPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { TermsPage } from '../pages/TermsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
    <Route path="/product/:slug" element={<ProductDetailsPage />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/about" element={<AboutUsPage />} />
    <Route path="/contact" element={<ContactUsPage />} />
    <Route path="/privacy" element={<PrivacyPolicyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="/tracking" element={<OrderTrackingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/wishlist" element={<WishlistPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/order-success" element={<OrderSuccessPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/orders" element={<OrdersHistoryPage />} />
    <Route path="/orders/:id" element={<OrderDetailsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
