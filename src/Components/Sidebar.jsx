import { useEffect, useRef } from 'react';
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
    FiUsers,
    FiFileText,
    FiEdit,
    FiBookOpen,
    FiClipboard,
    FiBook,
} from 'react-icons/fi';
import { logout } from '../Utils/auth';
import LogoItca from '../assets/LogoITCA_Web.png';
import Alert from './Alert';
import { useNavigate, NavLink, useLocation, Link } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen, userRole }) => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarOpen &&
                window.innerWidth < 1024 &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
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
            title: 'Log out',
            text: 'Are you sure you want to log out?',
            icon: 'question',
            type: 'confirm',
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
            background: '#1e293b',
            color: 'white',
        });

        if (result.isConfirmed) {
            try {
                logout();
                navigate('/login');
            } catch (error) {
                Alert({
                    title: 'Error',
                    text: error,
                    icon: 'error',
                });
            }
        }
    };

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 p-2 mr-2 rounded-lg transition-colors hover:bg-gray-600 ${isActive ? 'bg-gray-800 text-cyan-400' : ''}`;

    const isAdmin = userRole?.toLowerCase() === 'admin';
    const isTeacher = userRole?.toLowerCase() === 'teacher';
    const isStudent = userRole?.toLowerCase() === 'student';

    return (
        <aside
            ref={sidebarRef}
            className={`bg-gray-800 text-white w-64 h-full shadow-lg fixed lg:static transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 transition-transform duration-300 z-40`}
        >
            <Link to="/dashboard/admin" className="grid items-center text-center border-b border-gray-700">
                <div className="px-5 pt-5 pb-2 flex items-center space-x-3">
                    <img src={LogoItca} className="w-32" alt="LogoItca" />
                </div>
                <div className="mb-5 rounded-lg">
                    <h1 className="text-xl font-bold">NECDiagnostics</h1>
                </div>
            </Link>

            <nav className="p-4">
                <ul>
                    {isAdmin && (
                        <>
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
                                    to="/dashboard/admin/study_materials"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiFileText className="w-5 h-5" />
                                    <span className="ml-3">Administrar materiales de estudio</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/admin/prompts"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiFileText className="w-5 h-5" />
                                    <span className="ml-3">Administrar Prompts</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/admin/TitlesAdmin"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiBox className="w-5 h-5" />
                                    <span className="ml-3">Titles Admin</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/student/newtest"
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
                                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                >
                                    <FiBox className="w-5 h-5" />
                                    <span className="ml-3">Test Admin</span>
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
                        </>
                    )}

                    {isStudent && (
                        <li>
                            <NavLink to="/dashboard/student/newtest" className={navLinkClass}>
                                <FiClipboard className="w-5 h-5" />
                                <span className="ml-3">Take New Test</span>
                            </NavLink>
                        </li>
                    )}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors text-red-400 hover:text-red-300"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span className="ml-3">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
