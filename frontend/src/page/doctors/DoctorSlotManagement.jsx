import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

const DoctorSlotManagement = ({ doctor, onSaveSlots }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkDays, setBulkDays] = useState([]);
  const [bulkManualTimes, setBulkManualTimes] = useState(['']);

  // Initialize with doctor's existing slots
  useEffect(() => {
    if (doctor && doctor.availableSlots) {
      setAvailableSlots(doctor.availableSlots);
    }
  }, [doctor]);

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const calendar = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      calendar.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const hasSlots = availableSlots.some(slot => slot.date === dateString);
      calendar.push({
        date: dateString,
        day: i,
        hasSlots,
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < new Date().setHours(0, 0, 0, 0)
      });
    }

    return calendar;
  };

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Validate time format (HH:MM-HH:MM)
  const validateTimeFormat = (timeString) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])-([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeString)) {
      return { isValid: false, error: 'Invalid format. Use HH:MM-HH:MM (e.g., 09:00-04:00)' };
    }

    const [startTime, endTime] = timeString.split('-');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
      return { isValid: false, error: 'End time must be after start time' };
    }

    return { isValid: true, startTime, endTime };
  };

  // Slot management
  const addDateSlot = (date) => {
    if (!date) return;

    const existingDateIndex = availableSlots.findIndex(slot => slot.date === date);
    
    if (existingDateIndex === -1) {
      const newSlot = {
        date: date,
        slots: []
      };
      setAvailableSlots([...availableSlots, newSlot]);
    }
    setSelectedDate(date);
  };

  const addManualTimeSlot = () => {
    if (!selectedDate || !manualTimeInput.trim()) {
      alert('Please select a date and enter time slot');
      return;
    }

    const validation = validateTimeFormat(manualTimeInput.trim());
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const dateIndex = availableSlots.findIndex(slot => slot.date === selectedDate);
    if (dateIndex === -1) return;

    const updatedSlots = [...availableSlots];
    const timeSlot = manualTimeInput.trim();

    if (!updatedSlots[dateIndex].slots.includes(timeSlot)) {
      updatedSlots[dateIndex].slots.push(timeSlot);
      setAvailableSlots(updatedSlots);
      setManualTimeInput('');
    } else {
      alert('This time slot already exists for this date');
    }
  };

  const removeTimeSlot = (dateIndex, slotIndex) => {
    const updatedSlots = [...availableSlots];
    updatedSlots[dateIndex].slots.splice(slotIndex, 1);
    
    if (updatedSlots[dateIndex].slots.length === 0) {
      updatedSlots.splice(dateIndex, 1);
    }
    
    setAvailableSlots(updatedSlots);
  };

  const removeDateSlot = (dateIndex) => {
    const updatedSlots = [...availableSlots];
    updatedSlots.splice(dateIndex, 1);
    setAvailableSlots(updatedSlots);
    if (availableSlots[dateIndex]?.date === selectedDate) {
      setSelectedDate('');
    }
  };

  // Bulk operations
  const addBulkManualTime = () => {
    setBulkManualTimes([...bulkManualTimes, '']);
  };

  const updateBulkManualTime = (index, value) => {
    const updatedTimes = [...bulkManualTimes];
    updatedTimes[index] = value;
    setBulkManualTimes(updatedTimes);
  };

  const removeBulkManualTime = (index) => {
    if (bulkManualTimes.length > 1) {
      const updatedTimes = bulkManualTimes.filter((_, i) => i !== index);
      setBulkManualTimes(updatedTimes);
    }
  };

  const addBulkSlots = () => {
    if (bulkDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const validTimes = bulkManualTimes.filter(time => {
      if (!time.trim()) return false;
      const validation = validateTimeFormat(time.trim());
      if (!validation.isValid) {
        alert(`Invalid time format: ${time}. ${validation.error}`);
        return false;
      }
      return true;
    });

    if (validTimes.length === 0) {
      alert('Please enter at least one valid time slot');
      return;
    }

    const updatedSlots = [...availableSlots];
    
    bulkDays.forEach(day => {
      const dateIndex = updatedSlots.findIndex(slot => slot.date === day);
      
      if (dateIndex === -1) {
        updatedSlots.push({
          date: day,
          slots: [...validTimes]
        });
      } else {
        validTimes.forEach(time => {
          if (!updatedSlots[dateIndex].slots.includes(time)) {
            updatedSlots[dateIndex].slots.push(time);
          }
        });
      }
    });

    setAvailableSlots(updatedSlots);
    setShowBulkModal(false);
    setBulkDays([]);
    setBulkManualTimes(['']);
  };

  const toggleBulkDay = (date) => {
    setBulkDays(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  // Save all slots
  const handleSaveAll = () => {
    if (onSaveSlots) {
      onSaveSlots(availableSlots);
    }
    alert('Slots saved successfully!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calendar = generateCalendar();
  const selectedDateSlots = availableSlots.find(slot => slot.date === selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Your Availability
          </h1>
          <p className="text-lg text-gray-600">
            Add and edit your available time slots in HH:MM-HH:MM format (e.g., 09:00-04:00)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Bulk Add Slots
              </button>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[60px] p-1 border border-gray-200 rounded-lg
                    ${!day ? 'bg-gray-50' : ''}
                    ${day?.isPast ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                    ${day?.date === selectedDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${day?.hasSlots ? 'bg-green-50 border-green-200' : ''}
                    ${day?.isToday ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  onClick={() => !day?.isPast && addDateSlot(day?.date)}
                >
                  {day && (
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${
                        day.isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day.day}
                      </span>
                      {day.hasSlots && (
                        <div className="flex-1 flex items-end justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {selectedDate ? formatDate(selectedDate) : 'Select a Date'}
            </h2>

            {selectedDate ? (
              <>
                {/* Manual Time Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Time Slot (HH:MM-HH:MM)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualTimeInput}
                      onChange={(e) => setManualTimeInput(e.target.value)}
                      placeholder="09:00-04:00"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={addManualTimeSlot}
                      disabled={!manualTimeInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: StartTime-EndTime (e.g., 09:00-04:00, 13:30-17:45)
                  </p>
                </div>

                {/* Time Slots List */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Available Slots</h3>
                  {selectedDateSlots?.slots.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedDateSlots.slots.map((slot, slotIndex) => (
                        <div
                          key={slot}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <ClockIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{slot}</span>
                          </div>
                          <button
                            onClick={() => {
                              const dateIndex = availableSlots.findIndex(s => s.date === selectedDate);
                              removeTimeSlot(dateIndex, slotIndex);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No time slots added for this date</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a date from the calendar to manage time slots</p>
              </div>
            )}
          </div>
        </div>

        {/* All Slots Overview */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Scheduled Slots</h2>
            <button
              onClick={handleSaveAll}
              disabled={availableSlots.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
              Save All Changes
            </button>
          </div>

          {availableSlots.length > 0 ? (
            <div className="grid gap-4">
              {availableSlots.map((dateSlot, dateIndex) => (
                <div key={dateSlot.date} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {formatDate(dateSlot.date)}
                    </h3>
                    <button
                      onClick={() => removeDateSlot(dateIndex)}
                      className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove Date
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dateSlot.slots.map((slot, slotIndex) => (
                      <div
                        key={slot}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                      >
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-medium">{slot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CalendarDaysIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No slots scheduled yet</p>
              <p className="text-sm">Use the calendar to add available dates and time slots</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Bulk Add Time Slots</h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Dates</h4>
                <div className="grid grid-cols-7 gap-2">
                  {calendar.map((day, index) => (
                    day && !day.isPast && (
                      <button
                        key={index}
                        onClick={() => toggleBulkDay(day.date)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          bulkDays.includes(day.date)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {day.day}
                      </button>
                    )
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {bulkDays.length} date(s)
                </p>
              </div>

              {/* Manual Time Input for Bulk */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Time Slots (HH:MM-HH:MM)</h4>
                  <button
                    onClick={addBulkManualTime}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Another
                  </button>
                </div>
                
                <div className="space-y-3">
                  {bulkManualTimes.map((time, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => updateBulkManualTime(index, e.target.value)}
                        placeholder="09:00-04:00"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {bulkManualTimes.length > 1 && (
                        <button
                          onClick={() => removeBulkManualTime(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Format: StartTime-EndTime (e.g., 09:00-04:00, 13:30-17:45)
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addBulkSlots}
                disabled={bulkDays.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Slots to {bulkDays.length} Date(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSlotManagement;