// Components/Navbar.jsx
import { Menu } from 'lucide-react';
import { getUserName } from '../Utils/auth';

const Navbar = ({ setSidebarOpen }) => {
  return (
    <header className="w-full h-16 bg-white shadow flex items-center px-4 justify-between">
      {/* Botón para móvil */}
      <button className="lg:hidden" onClick={() => setSidebarOpen(prev => !prev)}>
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-semibold">Bienvenido {getUserName()}!</h1>
    </header>
  );
};

export default Navbar;
