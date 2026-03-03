
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAvailability,
  addBulkAvailability,
  removeAvailability,
  getDoctorAvailability,
  setSelectedDate,
  clearError,
  clearMessage,
} from "../../Redux/availabilitySlice";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
  Grid3X3,
  List,
  Table,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  CalendarRange,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../Helper/axiosInstance";

const Availability = () => {
  const dispatch = useDispatch();

  // ✅ FIX: Redux state ko alag variable name mein lo
  const { 
    availability: reduxAvailability,  // Redux wala availability
    loading, 
    error, 
    message, 
    selectedDate 
  } = useSelector((state) => state?.availability);

  // ✅ Local state ko alag rakhein
  const [localAvailability, setLocalAvailability] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    { startTime: "09:00 AM", endTime: "05:00 PM", id: "1" }
  ]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [view, setView] = useState("weekly");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localMessage, setLocalMessage] = useState({ text: "", type: "" });
  const [bulkMode, setBulkMode] = useState("single");
  const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
  const [slot, setSlot] = useState();
  const [editingDate, setEditingDate] = useState(null);
  const [editingTimeSlots, setEditingTimeSlots] = useState([]);

  // Initialize selected date
  useEffect(() => {
    if (!selectedDate && bulkMode === "single") {
      const today = new Date().toISOString().split("T")[0];
      dispatch(setSelectedDate(today));
    }
  }, [selectedDate, bulkMode, dispatch]);

  // ✅ FIX: Redux availability ko local state mein set karein
  useEffect(() => {
    if (reduxAvailability && Array.isArray(reduxAvailability)) {
      setLocalAvailability(reduxAvailability);
    }
  }, [reduxAvailability]);

  // Load availability on component mount
  useEffect(() => {
    const fetchAvailability = async () => {
      if (data?._id) {
        try {
          const response = await axiosInstance.get(`/doctor/${data._id}/availability`);
          console.log("API Response:", response.data.data.availability);
          setLocalAvailability(response.data.data.availability);
        } catch (error) {
          console.error("Error fetching availability:", error);
          toast.error("Failed to load availability data");
        }
      }
    };
    
    fetchAvailability();
  }, [data?._id, dispatch]);

  // Debug: Check availability data
  useEffect(() => {
    console.log("Current availability from Redux:", reduxAvailability);
    console.log("Current local availability:", localAvailability);
  }, [reduxAvailability, localAvailability]);

  // Handle Redux messages and errors
  useEffect(() => {
    if (message) {
      setLocalMessage({ text: message, type: "success" });
      toast.success(message);
      dispatch(clearMessage());
    }
    if (error) {
      setLocalMessage({ text: error, type: "error" });
      toast.error(error);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  // Convert 24-hour format to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";

    // If already in AM/PM format, return as is
    if (time24.includes('AM') || time24.includes('PM')) {
      return time24;
    }

    try {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours);

      if (isNaN(hour)) return time24;

      if (hour === 0) {
        return `12:${minutes} AM`;
      } else if (hour === 12) {
        return `12:${minutes} PM`;
      } else if (hour > 12) {
        return `${hour - 12}:${minutes} PM`;
      } else {
        return `${hour}:${minutes} AM`;
      }
    } catch (error) {
      return time24;
    }
  };

  // Convert 12-hour format to 24-hour format for time input
  const convertTo24HourFormat = (time12) => {
    if (!time12) return "";

    // If already in 24-hour format, return as is
    if (!time12.includes('AM') && !time12.includes('PM')) {
      return time12;
    }

    try {
      const time = time12.replace(' AM', '').replace(' PM', '');
      const [hours, minutes] = time.split(':');
      let hour = parseInt(hours);

      if (time12.includes('PM') && hour !== 12) {
        hour += 12;
      } else if (time12.includes('AM') && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    } catch (error) {
      return time12;
    }
  };

  // Time formatting function for display
  const formatTimeForDisplay = (time) => {
    return convertTo12HourFormat(time);
  };

  // Get display format from availability data - FIXED
  const getDisplayFromAvailability = (availabilityItem) => {
    if (
      !availabilityItem ||
      !availabilityItem.timeSlots ||
      availabilityItem.timeSlots.length === 0
    ) {
      return "Not Set";
    }

    // Multiple time slots ko display करें
    if (availabilityItem.timeSlots.length === 1) {
      const slot = availabilityItem.timeSlots[0];
      return `${formatTimeForDisplay(slot.startTime)} - ${formatTimeForDisplay(slot.endTime)}`;
    } else {
      // Multiple slots के लिए first और last slot show करें
      const firstSlot = availabilityItem.timeSlots[0];
      const lastSlot = availabilityItem.timeSlots[availabilityItem.timeSlots.length - 1];
      return `${formatTimeForDisplay(firstSlot.startTime)} - ${formatTimeForDisplay(lastSlot.endTime)} (${availabilityItem.timeSlots.length} slots)`;
    }
  };

  // Add new time slot
  const addTimeSlot = () => {
    setTimeSlots(prev => [
      ...prev,
      { startTime: "09:00 AM", endTime: "05:00 PM", id: Date.now().toString() }
    ]);
  };

  // Add new time slot in edit mode
  const addEditingTimeSlot = () => {
    setEditingTimeSlots(prev => [
      ...prev,
      { startTime: "09:00 AM", endTime: "05:00 PM", id: Date.now().toString() }
    ]);
  };

  // Remove time slot
  const removeTimeSlot = (id) => {
    if (timeSlots.length > 1) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
    } else {
      toast.error("At least one time slot is required");
    }
  };

  // Remove time slot in edit mode
  const removeEditingTimeSlot = (id) => {
    if (editingTimeSlots.length > 1) {
      setEditingTimeSlots(prev => prev.filter(slot => slot.id !== id));
    } else {
      toast.error("At least one time slot is required");
    }
  };

  // Update time slot
  const updateTimeSlot = (id, field, value) => {
    setTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === id) {
          let updatedValue = value;

          // Convert time input value to AM/PM format before storing
          if ((field === 'startTime' || field === 'endTime') && value) {
            updatedValue = convertTo12HourFormat(value);
          }

          return { ...slot, [field]: updatedValue };
        }
        return slot;
      })
    );
  };

  // Update time slot in edit mode
  const updateEditingTimeSlot = (id, field, value) => {
    setEditingTimeSlots(prev =>
      prev.map(slot => {
        if (slot.id === id) {
          let updatedValue = value;

          // Convert time input value to AM/PM format before storing
          if ((field === 'startTime' || field === 'endTime') && value) {
            updatedValue = convertTo12HourFormat(value);
          }

          return { ...slot, [field]: updatedValue };
        }
        return slot;
      })
    );
  };

  // Validate time slots
  const validateTimeSlots = (slots = timeSlots) => {
    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        toast.error("Please fill all time slots");
        return false;
      }

      // Convert to 24-hour format for comparison
      const start24 = convertTo24HourFormat(slot.startTime);
      const end24 = convertTo24HourFormat(slot.endTime);

      if (start24 >= end24) {
        toast.error("End time must be after start time");
        return false;
      }
    }
    return true;
  };

  // ✅ FIX: Prepare data for API - Multiple days ke liye fix
  const prepareDataForAPI = (slots = timeSlots) => {
    const preparedTimeSlots = slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    if (bulkMode === "single") {
      // Single date format - check if selectedDate exists
      if (!selectedDate) {
        toast.error("Please select a date");
        return null;
      }
      return [
        {
          date: selectedDate,
          timeSlots: preparedTimeSlots
        }
      ];
    } else if (bulkMode === "multiple") {
      // Multiple dates format - check if selectedDates exist
      if (selectedDates.length === 0) {
        toast.error("Please select at least one date");
        return null;
      }
      return selectedDates.map(date => ({
        date: date,
        timeSlots: preparedTimeSlots
      }));
    }
    return null;
  };

  // ✅ FIX: Handle Add Availability - Better error handling
  const handleAddAvailability = async () => {
    if (!validateTimeSlots()) {
      return;
    }

    try {
      const preparedData = prepareDataForAPI();
      
      // Check if preparedData is valid
      if (!preparedData) {
        return; // Error already shown in prepareDataForAPI
      }

      console.log("Sending data to API:", preparedData);

      const result = await dispatch(
        addAvailability({
          doctorId: data._id,
          availabilityData: preparedData
        })
      ).unwrap();

      if (result) {
        toast.success(result.message);

        // Refresh availability data
        dispatch(getDoctorAvailability(data._id));

        if (bulkMode === "multiple") {
          setSelectedDates([]);
        }

        // Reset to single time slot after successful addition
        setTimeSlots([{ startTime: "09:00 AM", endTime: "05:00 PM", id: "1" }]);
      }
    } catch (error) {
      console.error("Error adding availability:", error);
      toast.error(error.message || "Failed to add availability");
    }
  };

  // ✅ FIX: Handle Delete Availability - Multiple days ke liye fix
  const handleDeleteAvailability = async (dateStr = null) => {
    let datesToDelete = [];
    let confirmationMessage = "";

    if (dateStr) {
      // Single date delete from calendar
      datesToDelete = [dateStr];
      confirmationMessage = "Are you sure you want to remove availability for this date?";
    } else if (bulkMode === "single" && selectedDate) {
      datesToDelete = [selectedDate];
      confirmationMessage = "Are you sure you want to remove availability for this date?";
    } else if (bulkMode === "multiple" && selectedDates.length > 0) {
      datesToDelete = selectedDates;
      confirmationMessage = `Are you sure you want to remove availability for ${selectedDates.length} selected dates?`;
    } else {
      toast.error("Please select at least one date");
      return;
    }

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      // Prepare delete data in same format
      const deleteData = datesToDelete.map(date => ({
        date: date,
        timeSlots: [] // Empty array to indicate deletion
      }));

      console.log("Deleting data:", deleteData);

      const result = await dispatch(
        removeAvailability({
          doctorId: data._id,
          availabilityData: deleteData
        })
      ).unwrap();

      toast.success(result.message);

      // Refresh availability data
      dispatch(getDoctorAvailability(data._id));

      if (bulkMode === "multiple" && !dateStr) {
        setSelectedDates([]);
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error(error.message || "Failed to delete availability");
    }
  };

  // Handle date selection
  const handleDateSelect = (dateStr) => {
    if (bulkMode === "single") {
      dispatch(setSelectedDate(dateStr));
    } else if (bulkMode === "multiple") {
      setSelectedDates((prev) => {
        const isAlreadySelected = prev.includes(dateStr);
        if (isAlreadySelected) {
          return prev.filter((date) => date !== dateStr);
        } else {
          return [...prev, dateStr];
        }
      });
    }
  };

  // Clear all selected dates
  const clearSelectedDates = () => {
    setSelectedDates([]);
    toast.success("Selection cleared");
  };

  // Start editing a date's availability
  const handleEditAvailability = (dateStr) => {
    const availability = getAvailabilityForDate(dateStr);
    if (availability) {
      setEditingDate(dateStr);
      setEditingTimeSlots(availability.timeSlots.map(slot => ({
        ...slot,
        id: slot.id || Date.now().toString()
      })));
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDate(null);
    setEditingTimeSlots([]);
  };

  // Save edited availability
  const handleSaveEdit = async () => {
    if (!validateTimeSlots(editingTimeSlots)) {
      return;
    }

    try {
      const preparedData = [{
        date: editingDate,
        timeSlots: editingTimeSlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      }];

      console.log("Saving edited data:", preparedData);

      const result = await dispatch(
        addAvailability({
          doctorId: data._id,
          availabilityData: preparedData
        })
      ).unwrap();

      if (result) {
        toast.success("Availability updated successfully");
        setEditingDate(null);
        setEditingTimeSlots([]);
        dispatch(getDoctorAvailability(data._id));
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Delete single time slot from a date
  const handleDeleteTimeSlot = async (dateStr, slotId) => {
    const availability = getAvailabilityForDate(dateStr);
    if (!availability) return;

    const updatedTimeSlots = availability.timeSlots.filter(slot => slot.id !== slotId);
    
    if (updatedTimeSlots.length === 0) {
      // If no slots left, delete the entire date
      if (window.confirm("No time slots left. Delete entire date?")) {
        const deleteData = [{
          date: dateStr,
          timeSlots: []
        }];

        const result = await dispatch(
          removeAvailability({
            doctorId: data._id,
            availabilityData: deleteData
          })
        ).unwrap();

        if (result) {
          toast.success("Availability deleted successfully");
          dispatch(getDoctorAvailability(data._id));
        }
      }
      return;
    }

    // Update with remaining slots
    const updateData = [{
      date: dateStr,
      timeSlots: updatedTimeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
    }];

    try {
      const result = await dispatch(
        addAvailability({
          doctorId: data._id,
          availabilityData: updateData
        })
      ).unwrap();

      if (result) {
        toast.success("Time slot deleted successfully");
        dispatch(getDoctorAvailability(data._id));
      }
    } catch (error) {
      toast.error(error);
    }
  };

  // Calendar functions
  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const dates = [];
    for (
      let day = new Date(firstDay);
      day <= lastDay;
      day.setDate(day.getDate() + 1)
    ) {
      dates.push(new Date(day));
    }
    return dates;
  };

  const navigateWeek = (direction) => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + direction * 7);
      return newDate;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // ✅ FIX: Ab localAvailability use karein - SAFE DATE COMPARISON
  const getAvailabilityForDate = (dateStr) => {
    if (!localAvailability || !Array.isArray(localAvailability)) {
      return null;
    }

    try {
      const found = localAvailability.find((avail) => {
        if (!avail.date) return false;
        
        try {
          // Compare dates after normalizing format - SAFE VERSION
          const availDate = new Date(avail.date);
          const targetDate = new Date(dateStr);
          
          // Check if dates are valid
          if (isNaN(availDate.getTime()) || isNaN(targetDate.getTime())) {
            return false;
          }
          
          const availDateStr = availDate.toISOString().split('T')[0];
          const targetDateStr = targetDate.toISOString().split('T')[0];
          return availDateStr === targetDateStr;
        } catch (error) {
          console.error("Error comparing dates:", error);
          return false;
        }
      });

      return found || null;
    } catch (error) {
      console.error("Error in getAvailabilityForDate:", error);
      return null;
    }
  };

  const refreshData = () => {
    dispatch(getDoctorAvailability(data._id));
    toast.success("Data refreshed successfully");
  };

  // ✅ FIX: Ab localAvailability use karein - SAFE DATE PROCESSING
  const getAvailabilityData = () => {
    const availabilityList = [];
    const today = new Date().toISOString().split("T")[0];

    try {
      // Use actual availability data from local state
      if (localAvailability && Array.isArray(localAvailability) && localAvailability.length > 0) {
        localAvailability.forEach(avail => {
          try {
            const dateStr = avail.date;
            if (!dateStr) return;

            const isToday = dateStr === today;
            const isUpcoming = new Date(dateStr) > new Date(today);

            if (isToday) {
              availabilityList.push({
                date: "Today",
                dateStr: dateStr,
                display: getDisplayFromAvailability(avail),
                type: "today",
                isActive: true,
                timeSlots: avail.timeSlots || []
              });
            } else if (isUpcoming) {
              const date = new Date(dateStr);
              availabilityList.push({
                date: date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }),
                dateStr: dateStr,
                display: getDisplayFromAvailability(avail),
                type: "upcoming",
                isActive: true,
                timeSlots: avail.timeSlots || []
              });
            } else {
              // Past dates
              const date = new Date(dateStr);
              availabilityList.push({
                date: date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }),
                dateStr: dateStr,
                display: getDisplayFromAvailability(avail),
                type: "past",
                isActive: false,
                timeSlots: avail.timeSlots || []
              });
            }
          } catch (error) {
            console.error("Error processing availability item:", error);
          }
        });
      }

      // Sort by date (newest first) - SAFE SORTING
      availabilityList.sort((a, b) => {
        try {
          return new Date(b.dateStr) - new Date(a.dateStr);
        } catch (error) {
          return 0;
        }
      });

      return availabilityList;
    } catch (error) {
      console.error("Error in getAvailabilityData:", error);
      return [];
    }
  };

  // ✅ FIX: Ab localAvailability use karein
  const getTotalAvailabilityDays = () => {
    return localAvailability?.length || 0;
  };

  const getUpcomingAvailability = () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      return localAvailability?.filter((avail) => {
        try {
          return avail.date >= today;
        } catch (error) {
          return false;
        }
      }).length || 0;
    } catch (error) {
      return 0;
    }
  };

  const getTodaysAvailability = () => {
    const today = new Date().toISOString().split("T")[0];
    try {
      return localAvailability?.some((avail) => avail.date === today) || false;
    } catch (error) {
      return false;
    }
  };

  const handleNoteClick = (dateStr, isActive = true) => {
    if (isActive) {
      if (bulkMode === "single") {
        dispatch(setSelectedDate(dateStr));
      } else if (bulkMode === "multiple") {
        handleDateSelect(dateStr);
      }
      setView("weekly");
    }
  };

  const weekDates = getWeekDates(currentWeek);
  const monthDates = getMonthDates(currentMonth);
  const availabilityData = getAvailabilityData();
  const selectedDateAvailability = getAvailabilityForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className=" mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Doctor Availability</h1>
          <p className="text-gray-600 mt-2">Manage your appointment availability</p>
        </div>

        {/* Message Alert */}
        {localMessage.text && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center ${localMessage.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
              }`}
          >
            {localMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            {localMessage.text}
          </div>
        )}

        {/* Edit Modal */}
        {editingDate && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Availability for {new Date(editingDate).toLocaleDateString()}
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Time Slots ({editingTimeSlots.length})
                    </label>
                    <button
                      onClick={addEditingTimeSlot}
                      className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Slot
                    </button>
                  </div>

                  {editingTimeSlots.map((slot, index) => (
                    <div key={slot.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Slot {index + 1}
                        </span>
                        <div className="flex space-x-2">
                          {editingTimeSlots.length > 1 && (
                            <button
                              onClick={() => removeEditingTimeSlot(slot.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Remove time slot"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={convertTo24HourFormat(slot.startTime)}
                            onChange={(e) => updateEditingTimeSlot(slot.id, 'startTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeForDisplay(slot.startTime)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={convertTo24HourFormat(slot.endTime)}
                            onChange={(e) => updateEditingTimeSlot(slot.id, 'endTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeForDisplay(slot.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Availability Management */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Add Availability Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Set Availability
                </h2>
                <button
                  onClick={addTimeSlot}
                  className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center text-sm"
                  title="Add another time slot"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Slot
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Bulk Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Set For
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setBulkMode("single");
                        setSelectedDates([]);
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center ${bulkMode === "single"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Single Day
                    </button>
                    <button
                      onClick={() => {
                        setBulkMode("multiple");
                        dispatch(setSelectedDate(""));
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-lg flex items-center justify-center ${bulkMode === "multiple"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      <CalendarRange className="w-3 h-3 mr-1" />
                      Multiple Days
                    </button>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Time Slots ({timeSlots.length})
                  </label>
                  {timeSlots.map((slot, index) => (
                    <div key={slot.id || index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Slot {index + 1}
                        </span>
                        {timeSlots.length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(slot.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove time slot"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={convertTo24HourFormat(slot.startTime)}
                            onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeForDisplay(slot.startTime)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={convertTo24HourFormat(slot.endTime)}
                            onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeForDisplay(slot.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Dates Info */}
                {bulkMode === "multiple" && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-yellow-700">
                        Selected Dates: {selectedDates.length}
                      </p>
                      {selectedDates.length > 0 && (
                        <button
                          onClick={clearSelectedDates}
                          className="text-xs text-yellow-600 hover:text-yellow-800"
                          title="Clear selection"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {selectedDates.length > 0 ? (
                      <div className="text-xs text-yellow-600 max-h-20 overflow-y-auto">
                        {selectedDates.map((date, index) => (
                          <span
                            key={index}
                            className="inline-block bg-white px-2 py-1 rounded mr-1 mb-1 border border-yellow-300"
                          >
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-yellow-600">
                        Click on dates in the calendar to select multiple days
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 sm:space-x-3">
                  <button
                    onClick={handleAddAvailability}
                    disabled={
                      loading ||
                      timeSlots.length === 0
                    }
                    className="flex-1 bg-green-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                    ) : (
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    )}
                    {bulkMode === "single"
                      ? `Set ${timeSlots.length} Slot${timeSlots.length > 1 ? 's' : ''}`
                      : `Set for ${selectedDates.length} Days`}
                  </button>

                  {(selectedDate && bulkMode === "single") ||
                    (selectedDates.length > 0 && bulkMode === "multiple") ? (
                    <button
                      onClick={() => handleDeleteAvailability()}
                      disabled={loading}
                      className="px-2 sm:px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center text-sm"
                      title={`Remove availability for ${bulkMode === "single" ? "this date" : "selected dates"
                        }`}
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                View Options
              </h3>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                <button
                  onClick={() => setView("weekly")}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center ${view === "weekly"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Weekly
                </button>
                <button
                  onClick={() => setView("monthly")}
                  className={`py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center ${view === "monthly"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Monthly
                </button>
                <button
                  onClick={refreshData}
                  className="py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Calendar Views */}
          <div className="lg:col-span-2">
            {/* Weekly View */}
            {view === "weekly" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Weekly Calendar
                  </h2>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={() => navigateWeek(-1)}
                      className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {currentWeek.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      - Week {Math.ceil(currentWeek.getDate() / 7)}
                    </span>
                    <button
                      onClick={() => navigateWeek(1)}
                      className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2 bg-gray-50 rounded"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-3  md:grid-cols-7 gap-1 sm:gap-2">
                  {weekDates.map((date, index) => {
                    const dateStr = formatDate(date);
                    const dayAvailability = getAvailabilityForDate(dateStr);
                    const isToday =
                      dateStr === new Date().toISOString().split("T")[0];
                    const isSelected =
                      bulkMode === "single"
                        ? dateStr === selectedDate
                        : selectedDates.includes(dateStr);
                    const hasAvailability = !!dayAvailability;
                    const slotCount = dayAvailability?.timeSlots?.length || 0;

                    return (
                      <div
                        key={index}
                        className={`min-h-24 sm:min-h-32 border-2 rounded-lg p-1 sm:p-2 cursor-pointer transition-all duration-200 ${isToday
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : isSelected
                              ? "border-green-500 bg-green-50 shadow-md"
                              : hasAvailability
                                ? "border-green-200 bg-green-25 hover:border-green-300"
                                : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => handleDateSelect(dateStr)}
                      >
                        <div className="text-center mb-1 sm:mb-2">
                          <div
                            className={`text-xs sm:text-sm font-medium ${isToday
                                ? "text-blue-700"
                                : isSelected
                                  ? "text-green-700"
                                  : "text-gray-700"
                              }`}
                          >
                            {date.getDate()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {hasAvailability ? (
                            <>
                              <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded text-center truncate">
                                {getDisplayFromAvailability(dayAvailability)}
                              </div>
                              {slotCount > 1 && (
                                <div className="text-xs text-green-600 font-medium text-center">
                                  {slotCount} slots available
                                </div>
                              )}
                              <div className="flex justify-center space-x-1 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditAvailability(dateStr);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Edit availability"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAvailability(dateStr);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Delete availability"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-gray-400 text-center py-4">
                              Not Set
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Monthly View */}
            {view === "monthly" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Monthly Calendar
                  </h2>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2 bg-gray-50 rounded"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-0.5 sm:gap-1">
                  {monthDates.map((date, index) => {
                    const dateStr = formatDate(date);
                    const dayAvailability = getAvailabilityForDate(dateStr);
                    const isToday =
                      dateStr === new Date().toISOString().split("T")[0];
                    const isSelected =
                      bulkMode === "single"
                        ? dateStr === selectedDate
                        : selectedDates.includes(dateStr);
                    const isCurrentMonth =
                      date.getMonth() === currentMonth.getMonth();
                    const hasAvailability = !!dayAvailability;
                    const slotCount = dayAvailability?.timeSlots?.length || 0;

                    return (
                      <div
                        key={index}
                        className={`min-h-12 sm:min-h-20 border rounded p-0.5 sm:p-1 cursor-pointer transition-all duration-200 ${isToday
                            ? "border-blue-500 bg-blue-50 shadow-inner"
                            : isSelected
                              ? "border-green-500 bg-green-50 shadow-inner"
                              : hasAvailability
                                ? "border-green-200 bg-green-25 hover:border-green-300"
                                : "border-gray-200 hover:border-gray-300"
                          } ${!isCurrentMonth ? "opacity-40 bg-gray-50" : ""}`}
                        onClick={() => handleDateSelect(dateStr)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-xs ${isToday
                                ? "bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                : isSelected
                                  ? "text-green-700 font-bold"
                                  : "text-gray-700"
                              }`}
                          >
                            {date.getDate()}
                          </span>
                          {hasAvailability && (
                            <span
                              className={`text-xs text-white rounded-full w-4 h-4 flex items-center justify-center ${slotCount > 1 ? 'bg-green-600' : 'bg-green-500'
                                }`}
                              title={slotCount > 1 ? `${slotCount} time slots` : '1 time slot'}
                            >
                              {slotCount > 1 ? slotCount : '✓'}
                            </span>
                          )}
                        </div>
                        {hasAvailability && isCurrentMonth && (
                          <div className="mt-1">
                            <div className="text-xs text-green-600 font-medium text-center truncate">
                              {slotCount > 1 ? `${slotCount} slots` : 'Available'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Availability Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Availability Summary
                </h2>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {getTotalAvailabilityDays()} days
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{getUpcomingAvailability()}</div>
                  <div className="text-xs text-green-600">Upcoming Days</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {getTodaysAvailability() ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-blue-600">Today Available</div>
                </div>
              </div>

              {availabilityData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No availability set yet</p>
                  <p className="text-xs mt-1">
                    Set your availability to see summary
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {availabilityData.map((avail, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer ${avail.type === "today"
                          ? "border-green-300 bg-green-50 hover:bg-green-100"
                          : avail.type === "yesterday"
                            ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            : avail.type === "upcoming"
                              ? "border-blue-300 bg-blue-50 hover:bg-blue-100"
                              : "border-orange-300 bg-orange-50 hover:bg-orange-100"
                        } ${avail.isActive ? "hover:shadow-md" : "opacity-70"}`}
                      onClick={() =>
                        handleNoteClick(avail.dateStr, avail.isActive)
                      }
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-sm font-medium ${avail.type === "today"
                              ? "text-green-800"
                              : avail.type === "yesterday"
                                ? "text-gray-700"
                                : avail.type === "upcoming"
                                  ? "text-blue-800"
                                  : "text-orange-800"
                            }`}
                        >
                          {avail.date}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${avail.type === "today"
                                ? "bg-green-200 text-green-800"
                                : avail.type === "yesterday"
                                  ? "bg-gray-200 text-gray-700"
                                  : avail.type === "upcoming"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-orange-200 text-orange-800"
                              }`}
                          >
                            {avail.timeSlots.length > 1
                              ? `${avail.timeSlots.length} slots`
                              : 'Available'
                            }
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAvailability(avail.dateStr);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit availability"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`text-xs ${avail.type === "today"
                            ? "text-green-600"
                            : avail.type === "yesterday"
                              ? "text-gray-600"
                              : avail.type === "upcoming"
                                ? "text-blue-600"
                                : "text-orange-600"
                          } font-medium`}
                      >
                        {avail.display}
                      </div>
                      
                      {/* Show individual time slots */}
                      {avail.timeSlots.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {avail.timeSlots.map((slot, slotIndex) => (
                            <div key={slot.id || slotIndex} className="flex justify-between items-center bg-white p-1 rounded border">
                              <span className="text-xs text-gray-700">
                                {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTimeSlot(avail.dateStr, slot.id);
                                }}
                                className="text-red-500 hover:text-red-700 p-0.5"
                                title="Delete this time slot"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {avail.timeSlots.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Click to view details
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;