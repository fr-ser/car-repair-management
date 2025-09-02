import { Outlet } from 'react-router-dom';

import MenuBar from './components/MenuBar.tsx';

export function Layout() {
  return (
    <div>
      <MenuBar></MenuBar>

      {/* Page content (children get rendered here) */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
