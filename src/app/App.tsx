import { Outlet } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

export const App = () => {
  return (
    <main className="app-shell">
      <section className="phone-frame">
        <Outlet />
        <BottomNav />
      </section>
    </main>
  );
};