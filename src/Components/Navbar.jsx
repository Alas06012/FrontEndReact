import { Menu } from 'lucide-react';
import { getUserName } from '../Utils/auth';
import { motion } from 'framer-motion';

const Navbar = ({ setSidebarOpen }) => {
  return (
    <header className="w-full h-16 bg-white shadow-sm border-b border-gray-100 flex items-center px-5 justify-between sticky top-0 z-10">
      {/* Botón para móvil con mejor estilo */}
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="lg:hidden p-1.5 rounded-md hover:bg-gray-50 transition-colors"
        onClick={() => setSidebarOpen(prev => !prev)}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </motion.button>

      {/* Título con mejor tipografía */}
      <h1 className="text-lg font-medium text-gray-800 ml-2">
        Welcome, <span className="text-indigo-600 font-semibold">{getUserName()}</span>!
      </h1>
      
      {/* Espacio para balancear el diseño */}
      <div className="lg:hidden w-5 h-5"></div>
    </header>
  );
};

export default Navbar;