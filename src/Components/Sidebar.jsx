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
    FiUsers,
    FiFileText,
    FiEdit, FiBookOpen, FiClipboard, FiBook,
} from 'react-icons/fi';
import { logout } from '../Utils/auth';
import LogoItca from '../assets/LogoITCA_Web.png'
import Alert from './Alert';
import { useNavigate } from 'react-router-dom';
import { NavLink, useLocation } from 'react-router-dom';



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
            title: 'Log out',
            text: 'Are you sure you want to log out?',
            icon: 'question',
            type: 'confirm',
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
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

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 p-2 mr-2 rounded-lg transition-colors hover:bg-gray-600 ${isActive ? 'bg-gray-800 text-cyan-400' : ''}`;

    const location = useLocation();
    const path = location.pathname;

    const isAdminMenuOpen = path.startsWith('/dashboard/admin/users') || path.startsWith('/dashboard/admin/prompts') || path.startsWith('/dashboard/student/newtest');
    const isBancoMenuOpen = path.includes('/dashboard/admin/study_materials') || path.includes('/dashboard/admin/questionsbank') || path.includes('/dashboard/admin/QuestionsAdmin') || path.includes('/dashboard/admin/TitlesAdmin');

    const isAdmin = userRole.toLowerCase() === 'admin';
    const isTeacher = userRole.toLowerCase() === 'teacher';
    const isStudent = userRole.toLowerCase() === 'student';

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

                <ul className="space-y-2">
                    {/* ADMIN SECTION */}
                    {(isAdmin || isTeacher) && (
                        <li className="group">
                            <details open={isAdminMenuOpen} className="group open:bg-gray-700 open:border-l-4 open:border-cyan-500 rounded-lg transition-all duration-300">
                                <summary className="flex items-center justify-between p-3 hover:bg-gray-600 cursor-pointer">
                                    <div className="flex items-center">
                                        <FiSettings className="w-5 h-5" />
                                        <span className="ml-3">Administration</span>
                                    </div>
                                    <svg
                                        className="w-4 h-4 ml-2 transition-transform duration-300 group-open:rotate-90"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </summary>
                                <ul className="pl-6 py-2 space-y-1">

                                    {(isAdmin) && (
                                        <>
                                            <li>
                                                <NavLink to="/dashboard/admin/users" className={navLinkClass}>
                                                    <FiUsers className="w-4 h-4" />
                                                    Users
                                                </NavLink>
                                            </li><li>
                                                <NavLink to="/dashboard/admin/prompts" className={navLinkClass}>
                                                    <FiEdit className="w-4 h-4" />
                                                    Prompts
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    {(isAdmin || isTeacher) && (
                                        <li>
                                            <NavLink to="/dashboard/student/newtest" className={navLinkClass}>
                                                <FiClipboard className="w-5 h-5" />
                                                <span className="ml-3">Tests</span>
                                            </NavLink>
                                        </li>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}

                    {/* BANCO SECTION (ADMIN / TEACHER) */}
                    {(isAdmin || isTeacher) && (
                        <li className="group">
                            <details open={isBancoMenuOpen} className="group open:bg-gray-700 open:border-l-4 open:border-cyan-500 rounded-lg transition-all duration-300">
                                <summary className="flex items-center justify-between p-3 hover:bg-gray-600 cursor-pointer">
                                    <div className="flex items-center">
                                        <FiBookOpen className="w-5 h-5" />
                                        <span className="ml-3">Question Pool</span>
                                    </div>
                                    <svg
                                        className="w-4 h-4 ml-2 transition-transform duration-300 group-open:rotate-90"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </summary>
                                <ul className="pl-6 py-2 space-y-1">
                                    {(isAdmin || isTeacher) && (
                                        <><li>
                                            <NavLink to="/dashboard/admin/study_materials" className={navLinkClass}>
                                                <FiFileText className="w-4 h-4" />
                                                Study Materials
                                            </NavLink>
                                        </li><li>
                                                <NavLink to="/dashboard/admin/TitlesAdmin" className={navLinkClass}>
                                                    <FiBox className="w-4 h-4" />
                                                    Question Titles
                                                </NavLink>
                                            </li><li>
                                                <NavLink to="/dashboard/admin/QuestionsAdmin" className={navLinkClass}>
                                                    <FiBox className="w-4 h-4" />
                                                    Questions - Answers
                                                </NavLink>
                                            </li></>
                                    )}
                                </ul>
                            </details>
                        </li>
                    )}

                    {/* STUDENT SECTION */}
                    {isStudent && (
                        <>
                            <li>
                                <NavLink to="/dashboard/student/newtest" className={navLinkClass}>
                                    <FiClipboard className="w-5 h-5" />
                                    <span className="ml-3">Assessments</span>
                                </NavLink>
                                
                            </li>
                        </>
                    )}
                </ul>



            </nav>

            {/* Sección de Cerrar Sesión */}
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