import { useEffect, useState } from 'react';
import { Calendar, Clock, User, FileText, Settings, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logout } from '../../Redux/doctorSlice';
import avatar from '../../../src/assets/logo-def.png';
import { AuthMe } from '../../Redux/AuthLoginSlice';

const Dashboard = ({ children }) => {
  const { isLoggedIn, role, data } = useSelector((state) => state?.LoginAuth || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({});
  const [userRole, setUserRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if we have data in Redux, if not, fetch it
    if (!data || Object.keys(data).length === 0) {
      dispatch(AuthMe())
        .unwrap()
        .then((result) => {
          if (result && result.user) {
            setUserData(result);
            setUserRole(result.user.role);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
    
      setUserData(data);
      if (data.user && data.user.role) {
        setUserRole(data.user.role);
      } else if (role) {
        setUserRole(role);
      }
    }
  }, [dispatch, data, role]);

  const handleLogout = async () => {
    const res = await dispatch(Logout());
    if (res?.payload?.success) {
      localStorage.removeItem("data");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("role");
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  // Get role from multiple possible sources
  const currentRole = userRole || userData.role || data?.user?.role || role || '';
  

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm py-4 px-5 flex justify-between items-center">
        
        <h1 className="text-xl flex font-bold text-gray-800">
          <Calendar className="h-8 w-8 text-blue-600" /> Hummari chikitsa
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile unless toggled */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 bg-white shadow-lg z-10`}>
          <div className="flex flex-col h-full">
            {/* Profile Section */}
            <div className="p-2 sm:p-3 bg-green-700 text-white">
              <div className="flex items-center">
                <img
                  src={data?.user?.photo || data?.user?.image || data?.photo || data?.image || userData?.user?.photo || userData?.user?.image || avatar}
                  alt={data?.user?.name || data?.name || userData?.user?.name || "User"}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white mr-3 sm:mr-4"
                />
                <div>
                  <h2 className="font-semibold text-sm sm:text-lg">{data?.user?.name || data?.name || userData?.user?.name || "User"}</h2>
                  {/* <p className="text-blue-100 text-xs sm:text-sm capitalize">{currentRole || 'User'}</p> */}
                  <p className="text-blue-100 text-xs sm:text-sm">{data?.hospital?.name || userData?.hospital?.name || userData?.hospitalId?.name ||''}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <NavLink
                    to='/analytics/dashboard'
                    className={({ isActive }) =>
                      `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="font-medium">Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/doctor/dashboard'
                    className={({ isActive }) =>
                      `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="font-medium">Appointments</span>
                  </NavLink>
                </li>

                

                {currentRole !== 'admin' && (
                  <li>
                    <NavLink
                      to='/book/appointment'
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="font-medium">Book Appointment</span>
                    </NavLink>
                  </li>
                )}

                <li>
                  <NavLink
                    to='/patient'
                    className={({ isActive }) =>
                      `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="font-medium">Patients</span>
                  </NavLink>
                </li>

                {currentRole === 'hospital' && (
                  <li>
                    <NavLink
                      to='/hospital'
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="font-medium">My Hospital</span>
                    </NavLink>
                  </li>
                )}

                {currentRole === 'admin' && (
                  <li>
                    <NavLink
                      to='/hospital/list'
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="font-medium">Hospital</span>
                    </NavLink>
                  </li>
                )}

                {currentRole === 'hospital' && (
                  <li>
                    <NavLink
                      to="/hospital/setting"
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="font-medium">Setting</span>
                    </NavLink>
                  </li>
                )}

                {currentRole === 'doctor' && (
                  <li>
                    <NavLink
                      to="/doctor/setting"
                      className={({ isActive }) =>
                        `flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                      <span className="font-medium">Setting</span>
                    </NavLink>
                  </li>
                )}

                <li className="mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-2 sm:p-3 rounded-lg transition text-sm sm:text-base text-gray-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1  overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;