import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Calendar, LogOut, Settings, Mail, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Logout } from '../Redux/doctorSlice';
import { AuthMe } from '../Redux/AuthLoginSlice';
import { getAllAppointment } from '../Redux/appointment';
import { UserProfilePopup } from '../components/UserProfilePopup';

const NavLink = ({ to, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`transition ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
        >
            {children}
        </Link>
    );
};

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
    const currentUser = data?.user || {};
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            const res = await dispatch(Logout());
            if (res?.payload?.success) {
                localStorage.removeItem("data");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("role");
                localStorage.removeItem("token");
                localStorage.removeItem("lastVisitDate");
                window.location.href = '/'; // Force full page reload
            }
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem("data");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("role");
            localStorage.removeItem("token");
            localStorage.removeItem("lastVisitDate");
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        dispatch(AuthMe());
    }, [dispatch]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <span className="ml-2 text-xl font-semibold text-gray-800">Hummari Chikitsa</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/hospitals">Hospitals</NavLink>

                        {currentUser?.role === 'doctor' || currentUser?.role === 'hospital' || currentUser?.role === 'admin' || currentUser?.role === 'staff' ? (
                            <NavLink to="/doctor/dashboard">Dashboard</NavLink>
                        ) : (
                            isLoggedIn && (
                                <NavLink to="/appointments">My Appointments</NavLink>
                            )
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <UserProfilePopup />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-gray-700 hover:text-red-600 transition"
                                >
                                    <LogOut className="h-5 w-5 mr-1" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <Link to='/login'>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                        Patient Login
                                    </button>
                                </Link>

                                <Link to='/doctor/login'>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                        Doctor Login
                                    </button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden" onClick={toggleMenu}>
                        {isMenuOpen ? (
                            <X className="h-6 w-6 text-gray-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 py-4 border-t border-gray-200">
                        <nav className="flex flex-col space-y-4">
                            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
                            <NavLink to="/hospitals" onClick={closeMenu}>Hospitals</NavLink>

                            {currentUser?.role === 'doctor' || currentUser?.role === 'hospital' || currentUser?.role === 'admin' || currentUser?.role === 'staff' ? (
                                <NavLink to="/doctor/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                            ) : (
                                isLoggedIn && (
                                    <NavLink to="/appointments" onClick={closeMenu}>My Appointments</NavLink>
                                )
                            )}

                            {isLoggedIn ? (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex ">
                                        <UserProfilePopup />
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full mt-4 text-gray-700 hover:text-red-600 transition"
                                    >
                                        <LogOut className="h-5 w-5 mr-1" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                    <Link to="/login" onClick={closeMenu}>
                                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                            Patient Login
                                        </button>
                                    </Link>
                                    <Link to='/doctor/login' onClick={closeMenu}>
                                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                            Doctor Login
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;