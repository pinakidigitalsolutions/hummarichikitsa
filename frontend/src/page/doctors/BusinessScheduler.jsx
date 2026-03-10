import React, { useState, useEffect } from 'react';
import axiosInstance from '../../Helper/axiosInstance';
import toast from 'react-hot-toast'
import Dashboard from '../../components/Layout/Dashboard';
class Slot {
    constructor(startTime = "10:00", endTime = "20:00") {
        this.startTime = startTime;
        this.endTime = endTime;
        // Also store as open/close for compatibility with existing code
        this.open = startTime;
        this.close = endTime;
    }

    // Method to get time in open/close format for display
    getOpen() {
        return this.startTime;
    }

    getClose() {
        return this.endTime;
    }

    // Method to set time from open/close format
    setOpen(value) {
        this.startTime = value;
        this.open = value;
    }

    setClose(value) {
        this.endTime = value;
        this.close = value;
    }
}

class DaySchedule {
    constructor(name, data = null) {
        this.name = name;
        this._id = data?._id || null;
        this.enabled = data?.enabled || false;

        // Convert slots from backend format (startTime, endTime) to our Slot class
        if (data?.slots && Array.isArray(data.slots)) {
            this.slots = data.slots.map(slot =>
                new Slot(slot.startTime, slot.endTime)
            );

        } else {
            this.slots = [];

        }
    }

    enable(state) {
        this.enabled = state;
    }

    addSlot(startTime = "10:00", endTime = "20:00") {
        const newSlot = new Slot(startTime, endTime);
        this.slots.push(newSlot);
        console.log(`Added slot to ${this.name}:`, newSlot);
    }

    removeSlot(index) {
        console.log(`Removing slot ${index} from ${this.name}`);
        this.slots.splice(index, 1);
    }

    toJSON() {
        // Convert slots back to backend format (startTime, endTime)
        const slotsForBackend = this.slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime
        }));

        console.log(`Converting ${this.name} to JSON:`, {
            enabled: this.enabled,
            slots: slotsForBackend
        });

        return {
            enabled: this.enabled,
            slots: slotsForBackend
        };
    }
}

class BusinessSchedule {
    constructor(scheduleData = null) {
        this.days = {};
        const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];



        // If scheduleData is an array (from API), convert it to object format
        let dataObject = {};
        if (scheduleData && Array.isArray(scheduleData)) {

            scheduleData.forEach(day => {
                console.log(`Processing day: ${day.day}`, day);
                dataObject[day.day] = day;
            });
        } else if (scheduleData && typeof scheduleData === 'object') {
            dataObject = scheduleData;

        }

        weekDays.forEach(day => {
            if (dataObject[day]) {

                this.days[day] = new DaySchedule(day, dataObject[day]);
            } else {

                this.days[day] = new DaySchedule(day);
            }
        });


    }

    getSchedule() {
        return this.days;
    }

    toAPIFormat() {
        const scheduleObject = {};
        Object.entries(this.days).forEach(([dayName, dayObj]) => {
            scheduleObject[dayName] = dayObj.toJSON();
        });

        console.log("Schedule to API format:", { schedule: scheduleObject });

        return {
            schedule: scheduleObject
        };
    }

    // Clone method for proper state updates
    clone() {
        const clonedSchedule = new BusinessSchedule();
        Object.entries(this.days).forEach(([dayName, dayObj]) => {
            const clonedDay = new DaySchedule(dayName);
            clonedDay._id = dayObj._id;
            clonedDay.enabled = dayObj.enabled;
            clonedDay.slots = dayObj.slots.map(slot => new Slot(slot.startTime, slot.endTime));
            clonedSchedule.days[dayName] = clonedDay;
        });
        return clonedSchedule;
    }
}

const BusinessScheduler = () => {
    const [schedule, setSchedule] = useState(new BusinessSchedule());
    const [refresh, setRefresh] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const forceUpdate = () => setRefresh(!refresh);

    const timeToMinutes = (time) => {
        if (!time || !time.includes(':')) {
            return null;
        }

        const [hours, minutes] = time.split(':').map(Number);

        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
            return null;
        }

        return hours * 60 + minutes;
    };

    const hasConflictingSlot = (slots, startTime, endTime, excludeIndex = -1) => {
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
            return false;
        }

        return slots.some((slot, slotIndex) => {
            if (slotIndex === excludeIndex) {
                return false;
            }

            const slotStart = timeToMinutes(slot.startTime);
            const slotEnd = timeToMinutes(slot.endTime);

            if (slotStart === null || slotEnd === null) {
                return false;
            }

            return startMinutes < slotEnd && endMinutes > slotStart;
        });
    };

    const getNextAvailableSlot = (slots) => {
        if (!slots.length) {
            return { startTime: '10:00', endTime: '20:00' };
        }

        const sortedSlots = [...slots].sort((firstSlot, secondSlot) => {
            return timeToMinutes(firstSlot.startTime) - timeToMinutes(secondSlot.startTime);
        });

        const latestSlot = sortedSlots[sortedSlots.length - 1];
        const nextStartMinutes = timeToMinutes(latestSlot.endTime);

        if (nextStartMinutes === null || nextStartMinutes >= 23 * 60) {
            return null;
        }

        const nextEndMinutes = Math.min(nextStartMinutes + 60, 23 * 60 + 59);
        const formatMinutes = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
            const minutes = (totalMinutes % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        return {
            startTime: formatMinutes(nextStartMinutes),
            endTime: formatMinutes(nextEndMinutes)
        };
    };

    const validateSchedule = (scheduleToValidate) => {
        for (const [dayName, dayData] of Object.entries(scheduleToValidate.days)) {
            if (!dayData.enabled) {
                continue;
            }

            for (let slotIndex = 0; slotIndex < dayData.slots.length; slotIndex += 1) {
                const slot = dayData.slots[slotIndex];
                const startMinutes = timeToMinutes(slot.startTime);
                const endMinutes = timeToMinutes(slot.endTime);

                if (startMinutes === null || endMinutes === null) {
                    toast.error(`Invalid time selected for ${dayName}`);
                    return false;
                }

                if (startMinutes >= endMinutes) {
                    toast.error(`${dayName}: end time must be later than start time`);
                    return false;
                }

                if (hasConflictingSlot(dayData.slots, slot.startTime, slot.endTime, slotIndex)) {
                    toast.error(`${dayName}: this time slot overlaps an existing slot`);
                    return false;
                }
            }
        }

        return true;
    };

    const getSchedule = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axiosInstance.get('doctor/getDoctorSchedule');



            if (res.data && res.data.schedule) {

                const newSchedule = new BusinessSchedule(res.data.schedule);

                setSchedule(newSchedule);
            } else {

                setSchedule(new BusinessSchedule());
            }
        } catch (error) {

            setError("Failed to load schedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSchedule();
    }, []);

    const toggleDay = (day, state) => {
        console.log(`Toggling ${day} to ${state}`);
        const newSchedule = schedule.clone();
        newSchedule.days[day].enable(state);
        if (!state) {
            newSchedule.days[day].slots = [];
        }
        setSchedule(newSchedule);
        forceUpdate();
    };

    const addSlot = (day) => {
        console.log(`Adding slot to ${day}`);
        const newSchedule = schedule.clone();
        const dayObj = newSchedule.days[day];

        if (!dayObj.enabled) {
            alert("Please enable this day first!");
            return;
        }

        const nextSlot = getNextAvailableSlot(dayObj.slots);

        if (!nextSlot) {
            toast.error(`No more non-conflicting slots available for ${day}`);
            return;
        }

        dayObj.addSlot(nextSlot.startTime, nextSlot.endTime);
        console.log(`Added slot to ${day}, total slots now:`, dayObj.slots.length);
        setSchedule(newSchedule);
        forceUpdate();
    };

    const updateSlot = (day, index, type, value) => {
        console.log(`Updating slot ${index} ${type} to ${value} for ${day}`);
        const newSchedule = schedule.clone();
        const dayObj = newSchedule.days[day];

        const existingSlot = dayObj.slots[index];
        const nextStartTime = type === 'open' ? value : existingSlot.startTime;
        const nextEndTime = type === 'close' ? value : existingSlot.endTime;

        const startMinutes = timeToMinutes(nextStartTime);
        const endMinutes = timeToMinutes(nextEndTime);

        if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
            toast.error('End time must be later than start time');
            return;
        }

        if (hasConflictingSlot(dayObj.slots, nextStartTime, nextEndTime, index)) {
            toast.error(`${day}: this time slot is already selected`);
            return;
        }

        if (type === 'open') {
            dayObj.slots[index].setOpen(value);
        } else {
            dayObj.slots[index].setClose(value);
        }

        setSchedule(newSchedule);
        forceUpdate();
    };

    const removeSlot = (day, index) => {
        console.log(`Removing slot ${index} from ${day}`);
        const newSchedule = schedule.clone();
        newSchedule.days[day].removeSlot(index);
        setSchedule(newSchedule);
        forceUpdate();
    };

    const saveSchedule = async () => {
        try {
            if (!validateSchedule(schedule)) {
                return;
            }

            setLoading(true);


            const scheduleBody = {};

            Object.keys(schedule.days).forEach(day => {
                const dayData = schedule.days[day];

                scheduleBody[day] = {
                    enabled: dayData.enabled,
                    slots: dayData.slots.map(slot => ({
                        open: slot.startTime || slot.open,
                        close: slot.endTime || slot.close
                    }))
                };
            });


            const res = await axiosInstance.post('doctor/updateDoctorSchedule', {
                 schedule: scheduleBody
            });

            if (res.data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
                toast.success("Schedule saved successfully!");
                getSchedule();
            } else {
                throw new Error(res.data.message || "Failed to save schedule");
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("Failed to save schedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const scheduleData = schedule.toAPIFormat();
        navigator.clipboard.writeText(JSON.stringify(scheduleData, null, 2));
        alert("Schedule data copied to clipboard!");
    };

    const resetSchedule = () => {
        setSchedule(new BusinessSchedule());
        forceUpdate();
    };



    if (error) {
        return (
            <Dashboard>
                <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={getSchedule}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </Dashboard>
        );
    }

    return (
        <Dashboard>
        <div className="max-h-screen bg-slate-50 p-4 sm:p-6">
    <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Business Hours Scheduler
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">Set your business operating hours for each day</p>
        </div>
        
        {/* Schedule Container */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="grid gap-4 sm:gap-6">
                {Object.values(schedule.days).map(dayObj => (
                    <div key={dayObj.name} className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 transition-all duration-300 hover:border-slate-300">
                        {/* Day Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
                                <div className="relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={dayObj.enabled}
                                        onChange={(e) => toggleDay(dayObj.name, e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 ${dayObj.enabled ? 'bg-blue-600' : 'bg-slate-300'
                                        }`}>
                                        <div className={`absolute top-0.5 sm:top-1 w-3 sm:w-4 h-3 sm:h-4 rounded-full bg-white transition-all duration-300 ${dayObj.enabled ? 'left-5 sm:left-7' : 'left-0.5 sm:left-1'
                                            }`} />
                                    </div>
                                </div>
                                <span className={`text-base sm:text-lg font-semibold transition-all duration-300 ${dayObj.enabled
                                        ? 'text-slate-800'
                                        : 'text-slate-400'
                                    } group-hover:text-slate-800`}>
                                    {dayObj.name}
                                </span>
                            </label>

                            {dayObj.enabled && (
                                <span className="self-start sm:self-auto px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                                    {dayObj.slots.length} slot(s)
                                </span>
                            )}
                        </div>

                        {/* Slots Container */}
                        <div className={`transition-all duration-300 ${!dayObj.enabled ? 'opacity-40 pointer-events-none' : ''
                            }`}>
                            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                                {dayObj.slots.map((slot, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white rounded-lg p-2 sm:p-3 border border-slate-200">
                                        <div className="flex-1 w-full sm:w-auto flex items-center gap-2 sm:gap-3">
                                            <input
                                                type="time"
                                                value={slot.getOpen()}
                                                onChange={(e) => updateSlot(dayObj.name, index, 'open', e.target.value)}
                                                className="flex-1 sm:flex-none bg-white border border-slate-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                            <span className="text-slate-500 font-medium hidden sm:block">to</span>
                                            <span className="text-slate-500 font-medium text-xs sm:hidden">→</span>
                                            <input
                                                type="time"
                                                value={slot.getClose()}
                                                onChange={(e) => updateSlot(dayObj.name, index, 'close', e.target.value)}
                                                className="flex-1 sm:flex-none bg-white border border-slate-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                            />
                                        </div>
                                        <button
                                            className="w-full sm:w-auto sm:ml-auto px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 border border-red-200 text-sm sm:text-base"
                                            onClick={() => removeSlot(dayObj.name, index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Slot Button */}
                            {dayObj.enabled && (
                                <button
                                    onClick={() => addSlot(dayObj.name)}
                                    className="w-full py-2 sm:py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all duration-300 font-medium flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Add Time Slot</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
                <button
                    onClick={saveSchedule}
                    disabled={loading}
                    className={`flex-1 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 ${saved
                            ? 'bg-green-600 hover:bg-green-700'
                            : loading
                                ? 'bg-blue-500/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } text-white flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base`}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white"></div>
                            <span>Saving...</span>
                        </>
                    ) : saved ? (
                        <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Schedule Saved!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Save Schedule</span>
                        </>
                    )}
                </button>
            </div>

            {/* Status Message */}
            {saved && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center text-sm sm:text-base">
                    Schedule saved successfully!
                </div>
            )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-4 sm:mt-6 text-slate-500 text-xs sm:text-sm">
            <p>You can edit the schedule above and save changes. Data will be sent in the correct format to the API.</p>
        </div>
    </div>
</div>
        </Dashboard>
    );
};

export default BusinessScheduler;