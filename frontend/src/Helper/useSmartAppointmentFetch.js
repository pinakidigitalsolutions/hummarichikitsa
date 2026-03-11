import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAppointment, todayAppointment } from '../Redux/appointment';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration

export const useSmartAppointmentFetch = () => {
  const dispatch = useDispatch();
  const { appointment, todayAppointments, todayFetchTime, lastFetchDate } = useSelector((state) => state.appointment);
  const lastFetchDateRef = useRef(new Date().toISOString().split('T')[0]);
  const isFetchingRef = useRef(false);

  // Check if cache is stale
  const isCacheStale = (fetchTime) => {
    if (!fetchTime) return true;
    return new Date().getTime() - fetchTime > CACHE_DURATION;
  };

  // Check if date has changed (new day)
  const isNewDay = () => {
    const today = new Date().toISOString().split('T')[0];
    return today !== lastFetchDateRef.current;
  };

  // Fetch all appointments
  const refetchAllAppointments = async () => {
    if (!isFetchingRef.current) {
      isFetchingRef.current = true;
      try {
        await dispatch(getAllAppointment());
      } finally {
        isFetchingRef.current = false;
      }
    }
  };

  // Fetch today's appointments
  const refetchTodayAppointments = async () => {
    if (!isFetchingRef.current) {
      isFetchingRef.current = true;
      try {
        await dispatch(todayAppointment());
      } finally {
        isFetchingRef.current = false;
      }
    }
  };

  // Initial fetch and setup
  useEffect(() => {
    // Fetch all appointments if empty or cache is stale
    if (!appointment || appointment.length === 0 || isCacheStale(new Date(lastFetchDate + 'T00:00:00').getTime())) {
      refetchAllAppointments();
    }

    // Fetch today's appointments if empty or cache is stale
    if (!todayAppointments || todayAppointments.length === 0 || isCacheStale(todayFetchTime)) {
      refetchTodayAppointments();
    }

    // Update lastFetchDateRef
    lastFetchDateRef.current = new Date().toISOString().split('T')[0];
  }, []);

  // Refresh on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible - refresh if cache is stale or new day
        if (isNewDay() || isCacheStale(todayFetchTime)) {
          refetchTodayAppointments();
          lastFetchDateRef.current = new Date().toISOString().split('T')[0];
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh when window gets focus
    const handleFocus = () => {
      if (isNewDay() || isCacheStale(todayFetchTime)) {
        refetchTodayAppointments();
        lastFetchDateRef.current = new Date().toISOString().split('T')[0];
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [todayFetchTime]);

  return {
    appointments: appointment,
    todayAppointments,
    loading: false,
    todayLoading: false,
    refetchAllAppointments,
    refetchTodayAppointments,
  };
};
