import React, { useEffect, useState } from 'react';
import { format, parseISO, addDays, addWeeks, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { FaCalendarAlt, FaClock, FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetDoctor } from '../../Redux/doctorSlice';
import axiosInstance from '../../Helper/axiosInstance';

const Schedule = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [bulkAddMode, setBulkAddMode] = useState(false);
  const [bulkAddDuration, setBulkAddDuration] = useState('1week');
  const [selectedDays, setSelectedDays] = useState([]);
  const [recurringSlots, setRecurringSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const dispatch = useDispatch();

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // API functions
  // const getDoctorSlots = async (doctorId) => {
  //   try {
  //     const response = await axios.get(`/api/v1/doctor/${doctorId}/slots`);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  const addDoctorSlot = async (doctorId, date, slot) => {
    try {
     const  data = {
          date: date,
          slots: Array.isArray(slot) ? slot : [slot]
        }
      
      const response = await axiosInstance.post(`doctor/${doctorId}/slots`,data);

    } catch (error) {
      throw error;
    }
  };

  const removeDoctorSlot = async (doctorId, date, slot) => {
    try {

      const response = await axiosInstance.delete(`doctor/${doctorId}/slots`, {
        data: {
          date: date,
          slots: Array.isArray(slot) ? slot : [slot]
        }
      });

      // console.log(response.data);

      // console.log(await response.data)
      return await response.data;
    } catch (error) {
      console.log(error.message)
      // throw error;
    }
  };

  // const updateDoctorSlots = async (doctorId, slots) => {
  //   try {
  //     const response = await axios.put(`/api/v1/doctor/${doctorId}`, { availableSlots: slots });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // Helper functions
  const getMonthDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getSlotsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotData = availableSlots.find(slot => slot.date === dateStr);
    return slotData ? slotData.slots : [];
  };

  // Data fetching
  const fetchDoctorSlots = async () => {

    setIsLoading(true);
    try {
      const res = await dispatch(GetDoctor(id));
      // const slots = await getDoctorSlots(id);


      setAvailableSlots(res?.payload?.availableSlots);
    } catch (error) {
      toast.error('Failed to fetch schedule');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Slot operations
  const handleAddSlot = async () => {
    if (!newSlotDate) {
      toast.warn('Please select a date');
      return;
    }

    if (!newSlotTime) {
      toast.warn('Please select a time slot');
      return;
    }

    setIsLoading(true);
    try {
      await addDoctorSlot(id, newSlotDate, newSlotTime);

      const existingDateIndex = availableSlots.findIndex(
        slot => slot.date === newSlotDate
      );

      const updatedSlots = [...availableSlots];

      if (existingDateIndex >= 0) {
        if (!updatedSlots[existingDateIndex].slots.includes(newSlotTime)) {
          updatedSlots[existingDateIndex].slots.push(newSlotTime);
          updatedSlots[existingDateIndex].slots.sort((a, b) => {
            return timeSlots.indexOf(a) - timeSlots.indexOf(b);
          });
        }
      } else {
        updatedSlots.push({
          date: newSlotDate,
          slots: [newSlotTime]
        });
        updatedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      setAvailableSlots(updatedSlots);
      setNewSlotTime('');
      toast.success('Time slot added successfully');
    } catch (error) {
      toast.error('Failed to add time slot');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSlot = async (date, time) => {
    setIsLoading(true);
    try {
      await removeDoctorSlot(id, date, time);

      const dateStr = format(parseISO(date), 'yyyy-MM-dd');
      const dateIndex = availableSlots.findIndex(slot => slot.date === dateStr);

      if (dateIndex >= 0) {
        const updatedSlots = [...availableSlots];
        const timeIndex = updatedSlots[dateIndex].slots.indexOf(time);

        if (timeIndex >= 0) {
          updatedSlots[dateIndex].slots.splice(timeIndex, 1);

          if (updatedSlots[dateIndex].slots.length === 0) {
            updatedSlots.splice(dateIndex, 1);
          }

          setAvailableSlots(updatedSlots);
          toast.success('Time slot removed');
        }
      }
    } catch (error) {
      toast.error('Failed to remove time slot');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!newSlotDate) {
      toast.warn('Please select a start date');
      return;
    }

    if (selectedDays.length === 0) {
      toast.warn('Please select at least one day');
      return;
    }

    if (recurringSlots.length === 0) {
      toast.warn('Please select at least one time slot');
      return;
    }

    let endDate;
    const startDate = parseISO(newSlotDate);

    switch (bulkAddDuration) {
      case '1week': endDate = addDays(startDate, 6); break;
      case '2weeks': endDate = addDays(startDate, 13); break;
      case '1month': endDate = addMonths(startDate, 1); break;
      default: endDate = addDays(startDate, 6);
    }

    const datesToAdd = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dayOfWeek = format(currentDate, 'EEE');
      if (selectedDays.includes(dayOfWeek)) {
        datesToAdd.push(format(currentDate, 'yyyy-MM-dd'));
      }
      currentDate = addDays(currentDate, 1);
    }

    setIsLoading(true);
    try {
      // Add slots for each date
      for (const date of datesToAdd) {
        for (const time of recurringSlots) {
          await addDoctorSlot(id, date, time);
        }
      }

      // Update local state
      const updatedSlots = [...availableSlots];

      datesToAdd.forEach(date => {
        const existingDateIndex = updatedSlots.findIndex(slot => slot.date === date);

        if (existingDateIndex >= 0) {
          recurringSlots.forEach(time => {
            if (!updatedSlots[existingDateIndex].slots.includes(time)) {
              updatedSlots[existingDateIndex].slots.push(time);
            }
          });
          updatedSlots[existingDateIndex].slots.sort((a, b) =>
            timeSlots.indexOf(a) - timeSlots.indexOf(b)
          );
        } else {
          updatedSlots.push({
            date,
            slots: [...recurringSlots].sort((a, b) =>
              timeSlots.indexOf(a) - timeSlots.indexOf(b)
            )
          });
        }
      });

      updatedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAvailableSlots(updatedSlots);
      setRecurringSlots([]);
      setSelectedDays([]);
      toast.success(`${datesToAdd.length} days with ${recurringSlots.length} slots each added`);
    } catch (error) {
      toast.error('Failed to add bulk slots');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers
  const toggleDaySelection = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleRecurringSlot = (time) => {
    setRecurringSlots(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev =>
      direction === 'prev'
        ? addMonths(prev, -1)
        : addMonths(prev, 1)
    );
  };

  useEffect(() => {
    fetchDoctorSlots();
  }, [id]);

  return (
    <Dashboard>
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Manage Doctor's Schedule</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setBulkAddMode(false)}
              className={`px-3 py-1 rounded-md ${!bulkAddMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Single Day
            </button>
            <button
              onClick={() => setBulkAddMode(true)}
              className={`px-3 py-1 rounded-md ${bulkAddMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Multiple Days
            </button>
          </div>
        </div>

        {!bulkAddMode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10 w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time Slot</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="text-gray-400" />
                </div>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddSlot}
                disabled={!newSlotDate || !newSlotTime || isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaPlus className="mr-1" />
                )}
                Add Slot
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={newSlotDate}
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="pl-10 w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <select
                  value={bulkAddDuration}
                  onChange={(e) => setBulkAddDuration(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1week">1 Week</option>
                  <option value="2weeks">2 Weeks</option>
                  <option value="1month">1 Month</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Days of Week</label>
              <div className="flex space-x-2">
                {weekDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDaySelection(day)}
                    className={`w-12 h-12 rounded-full ${selectedDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleRecurringSlot(time)}
                    className={`py-2 px-3 rounded-md text-sm ${recurringSlots.includes(time) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={!newSlotDate || selectedDays.length === 0 || recurringSlots.length === 0 || isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 flex justify-center items-center"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaPlus className="mr-1" />
                )}
                Add {selectedDays.length} Day(s) × {recurringSlots.length} Slot(s)
              </button>
            </div>
          </div>
        )}

        {/* Month View Calendar */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <FaChevronLeft />
            </button>
            <h4 className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <FaChevronRight />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 p-2 bg-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 p-2">
            {getMonthDays().map(day => {
              const daySlots = getSlotsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-16 p-1 border rounded cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="text-right text-sm mb-1">
                    {format(day, 'd')}
                  </div>
                  {daySlots.length > 0 && (
                    <div className="text-xs space-y-1">
                      {daySlots.slice(0, 2).map(slot => (
                        <div key={slot} className="bg-blue-100 text-blue-800 px-1 rounded truncate">
                          {slot}
                        </div>
                      ))}
                      {daySlots.length > 2 && (
                        <div className="text-gray-500">+{daySlots.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Slots View */}
        {selectedDate && (
          <div className="border rounded-lg overflow-hidden mt-4">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-medium">
                {format(selectedDate, 'EEEE, MMMM do yyyy')}
              </h4>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {getSlotsForDate(selectedDate).length > 0 ? (
                getSlotsForDate(selectedDate).map((time) => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const slotData = availableSlots.find(slot => slot.date === dateStr);
                  return (
                    <div key={time} className="relative">
                      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm flex items-center justify-between">
                        <span>{time}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(dateStr, time)}
                          className="text-blue-500 hover:text-blue-700 ml-2"
                          disabled={isLoading}
                        >
                          {isLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-500 py-4">
                  No slots scheduled for this day
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default Schedule;