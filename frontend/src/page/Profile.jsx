import { useState, useRef, useEffect } from 'react';
import { User, Calendar, Settings, LogOut, X, Edit3, Mail, Phone } from 'lucide-react';

const UserProfilePopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Rahul Sharma',
    mobile: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    appointments: [
      { id: 1, doctor: 'Dr. Amit Patel', date: '15 Sep 2023', time: '10:30 AM' },
      { id: 2, doctor: 'Dr. Priya Singh', date: '20 Sep 2023', time: '2:15 PM' }
    ]
  });
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    email: ''
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

  // Initialize edit form with current user data
  useEffect(() => {
    if (isEditModalOpen) {
      setEditForm({
        name: userData.name,
        mobile: userData.mobile,
        email: userData.email
      });
    }
  }, [isEditModalOpen, userData]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setUserData({
      ...userData,
      name: editForm.name,
      mobile: editForm.mobile,
      email: editForm.email
    });
    setIsEditModalOpen(false);
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
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end pt-16 pr-4">
          <div
            ref={popupRef}
            className="bg-white rounded-lg shadow-xl w-80 max-w-full animate-fade-in"
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
                  <h4 className="font-medium text-gray-900">{userData.name}</h4>
                  <p className="text-sm text-gray-600">{userData.mobile}</p>
                  <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="p-4 border-b">
              <div className="flex items-center mb-3">
                <Calendar size={18} className="text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-800">My Appointments</h4>
              </div>
              
              <div className="space-y-3">
                {userData.appointments.map(appointment => (
                  <div key={appointment.id} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{appointment.doctor}</p>
                    <p className="text-xs text-gray-600">
                      {appointment.date} at {appointment.time}
                    </p>
                    <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                      View Details
                    </button>
                  </div>
                ))}
                
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
                  View All Appointments
                </button>
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
              <button className="flex items-center w-full text-left py-2 text-gray-700 hover:text-red-600">
                <LogOut size={18} className="mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
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
                      name="mobile"
                      value={editForm.mobile}
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
                      required
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

      <style jsx>{`
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

export default UserProfilePopup;