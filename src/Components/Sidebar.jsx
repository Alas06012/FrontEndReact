import { Link } from 'react-router-dom';
import { use, useEffect, useRef } from 'react';
import {
    FiHome,
    FiBox,
    FiSettings,
    FiBarChart2,
    FiUser,
    FiPlusCircle,
    FiCalendar,
    FiTool,
    FiLogOut,
    FiUsers
} from 'react-icons/fi';
import { logout } from '../Utils/auth';
import LogoItca from '../assets/LogoITCA_Web.png'
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarOpen &&
                window.innerWidth < 1024 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarOpen, setSidebarOpen]);

    const handleLogout = async () => {
        const result = await Alert({
            title: 'Cerrar sesión',
            text: '¿Estás seguro de que deseas salir?',
            icon: 'question',
            type: 'confirm',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            background: '#1e293b', // slate-800
            color: 'white'
        });

        if (result.isConfirmed) {
            try {
                logout();
                navigate('/login')

            } catch (error) {
                Alert({
                    title: 'Error',
                    text: error,
                    icon: 'error'
                });
            }
        }
    };



    return (
        <aside
            ref={sidebarRef}
            className={`bg-gray-800 text-white w-64 h-full shadow-lg fixed lg:static transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 transition-transform duration-300 z-40`}
        >
            {/* <button
        onClick={() => setSidebarOpen(false)}
        className="absolute top-4 right-4 lg:hidden text-gray-300 hover:text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button> */}

            <Link to="/dashboard/admin" className='grid items-center text-center  border-b border-gray-700'>
                <div className="px-5 pt-5 pb-2 flex items-center space-x-3">
                    <img src={LogoItca} className='w-max' alt="LogoItca" />
                </div>
                <div className="mb-5 rounded-lg">
                    <h1 className="text-xl font-bold">NECDiagnostics</h1>
                </div>
            </Link>

            <nav className="p-4">

                {/* {ITEMS PARA USUARIO ADMIN} */}
                {userRole?.toLowerCase() === 'admin' ? (
                    <ul>
                        <li>
                            <Link
                                to="/dashboard/admin/users"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            >
                                <FiUsers className="w-5 h-5" />
                                <span className="ml-3">Administrar Usuarios</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/dashboard/admin/questionsbank"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            >
                                <FiBox className="w-5 h-5" />
                                <span className="ml-3">Banco De Preguntas</span>
                            </Link>
                        </li>
                        {/* <li>
                            <Link
                                to="/dashboard/admin/reports"
                                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            >
                                <FiBarChart2 className="w-5 h-5" />
                                <span className="ml-3">Reportes</span>
                            </Link>
                        </li> */}
                    </ul>
                ) :
                    /* {ITEMS PARA USUARIO STUDENT} */
                    (
                        
                        <ul>
                            <li>
                                <Link
                                    to="/dashboard/student/newtest"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiUsers className="w-5 h-5" />
                                    <span className="ml-3">Realizar Pruebas</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/student/materials"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiBarChart2 className="w-5 h-5" />
                                    <span className="ml-3">Materiales De Estudio</span>
                                </Link>
                            </li>
                        </ul>
                    )
                }
            </nav>

            {/* Sección de Cerrar Sesión */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span className="ml-3">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;