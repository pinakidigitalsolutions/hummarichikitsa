import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../../Helper/axiosInstance";
import Dashboard from "../../components/Layout/Dashboard";
import avatar from "../../../src/assets/logo-def.png";
import toast from "react-hot-toast";
import { ChangePassword } from "../../Redux/doctorSlice";

const AdminStaffSetting = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/user/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    if (user?.role === "admin") return "Admin";
    return "User";
  }, [user]);

  const isActive = useMemo(() => {
    if (user?.status === undefined || user?.status === null) {
      return null;
    }

    if (typeof user.status === "boolean") {
      return user.status;
    }

    return user.status === "active";
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All field are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    const res = await dispatch(ChangePassword({ currentPassword, newPassword }));
    if (res?.payload?.success) {
      toast.success(res.payload.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <Dashboard>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Account Settings
                </h1>
                <p className="text-slate-600 mt-2 text-sm md:text-base">
                  Manage your account details and password
                </p>
              </div>
              {isActive !== null && (
                <div className="mt-4 md:mt-0">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></div>
                    {isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                Personal Information
              </h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={user?.photo || user?.image || avatar}
                    alt={displayName}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-100"
                  />
                </div>

                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <p className="text-slate-900 font-medium">{displayName}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <p className="text-slate-600">{user?.email || "-"}</p>
                    </div>

                    {user?.number && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone
                        </label>
                        <p className="text-slate-600">{user.number}</p>
                      </div>
                    )}

                    {user?.role && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Role
                        </label>
                        <p className="text-slate-600 capitalize">{user.role}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">
              Change Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default AdminStaffSetting;
