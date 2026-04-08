import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';
import Footer from './Footer.tsx';
import CartDrawer from '../cart/CartDrawer.tsx';
import Toaster from '../ui/Toaster.tsx';

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Header onCartClick={() => setDrawerOpen(true)} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <Toaster />
    </>
  );
}
