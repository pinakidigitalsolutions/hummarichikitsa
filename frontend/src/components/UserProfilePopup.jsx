import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllAppointment } from "../Redux/appointment";
import { Menu, X, User, Calendar, LogOut, Settings, Mail, Phone } from 'lucide-react';
import axiosInstance from "../Helper/axiosInstance";
import { AuthUpdate } from "../Redux/authSlice";

export const UserProfilePopup = () => {
    const { data } = useSelector((state) => state.auth || {});
    const currentUser = data || {};
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Get user data directly from currentUser without local state
    const userName = (currentUser.user_first_name || currentUser?.name || '') + ' ' + (currentUser.user_last_name || '') || 'User Name';
    const userMobile = currentUser?.userid || currentUser?.mobile || currentUser?.phone || '';
    const userEmail = currentUser.email || '';
    const [editForm, setEditForm] = useState({
        user_first_name: currentUser?.user_first_name,
        user_last_name: currentUser?.user_last_name,
        email: userEmail
    });
    



    const popupRef = useRef(null);
    const modalRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target) && isEditModalOpen) {
                setIsEditModalOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditModalOpen]);

    // Initialize edit form with current user data when modal opens
    useEffect(() => {
        if (isEditModalOpen) {
            setEditForm({
                user_first_name: currentUser?.user_first_name,
                user_last_name: currentUser?.user_last_name,
                email: userEmail
            });
        }
    }, [isEditModalOpen, userName, userMobile, userEmail]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        await dispatch(AuthUpdate(editForm))
        // setInterval(()=>{
        //  setIsEditModalOpen(false);
        // },3000)
    };

    const handleLogout = async () => {
        try {
            const res = await dispatch(Logout());
            if (res?.payload?.success) {
                localStorage.removeItem("data");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("role");
                localStorage.removeItem("token");
                window.location.reload()
                setIsPopupOpen(false);
            }
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.clear();
            setIsPopupOpen(false);
            navigate('/login');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm({
            ...editForm,
            [name]: value
        });
    };

    return (
        <div className="relative">
            {/* Avatar Button */}
            <button
                onClick={() => setIsPopupOpen(!isPopupOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <User size={20} />
            </button>

            {/* Popup Overlay */}
            {isPopupOpen && (
                <div className="fixed inset-0 z-50 flex justify-end pt-16 pr-4">
                    <div
                        ref={popupRef}
                        className="bg-white rounded-lg shadow-xl w-80 max-w-full animate-fade-in border border-gray-200"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">User Profile</h3>
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">FulllName : {userName}</h4>
                                    <p className="text-sm text-gray-600">Mobile :  {userMobile}</p>
                                    {userEmail && <p className="text-sm text-gray-600">{userEmail}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center w-full text-left py-2 text-gray-700 hover:text-blue-600"
                            >
                                <Settings size={18} className="mr-3" />
                                Edit Profile
                            </button>
                            <button onClick={handleLogout} className="flex items-center w-full text-left py-2 text-gray-700 hover:text-red-600">
                                <LogOut size={18} className="mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-indigo-600/40 bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl w-96 max-w-full animate-scale-in"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleEditSubmit} className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="user_first_name"
                                            value={editForm.user_first_name}
                                            onChange={handleInputChange}
                                            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="user_last_name"
                                            value={editForm.user_last_name}
                                            onChange={handleInputChange}
                                            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            disabled={true}
                                            name="mobile"
                                            value={currentUser.userid}
                                            onChange={handleInputChange}
                                            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleInputChange}
                                            className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md border border-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scale-in {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};