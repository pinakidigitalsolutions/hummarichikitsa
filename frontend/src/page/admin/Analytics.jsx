
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (startDate = '', endDate = '') => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const res = await axiosInstance.get('/dashboard', { params });
      setDashboardData(res.data.data);
      const totalRevenu = res.data.data
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleDateFilter = () => {
    if (dateRange.start_date && dateRange.end_date) {
      fetchDashboardData(dateRange.start_date, dateRange.end_date);
    }
  };

  const handleClearFilter = () => {
    setDateRange({ start_date: '', end_date: '' });
    fetchDashboardData();
  };

  // Prepare chart data from actual API response
  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    const { total_appointments, today_appointments, completed_appointments, check_in_appointments, confirmed_appointments, total_revenue, revenue_by_status } = dashboardData;

    // Status distribution for pie chart
    const appointmentStatusData = [
      { name: 'Completed', value: completed_appointments, color: '#10B981' },
      { name: 'Check-in', value: check_in_appointments, color: '#3B82F6' },
      { name: 'Confirmed', value: confirmed_appointments, color: '#F59E0B' },
    ];

    // Revenue by status for bar chart
    const revenueData = [
      { name: 'Check-in', revenue: revenue_by_status.check_in, color: '#3B82F6' },
      { name: 'Confirmed', revenue: revenue_by_status.confirmed, color: '#F59E0B' },
      { name: 'Completed', revenue: revenue_by_status.completed, color: '#10B981' },
    ];

    // Appointment distribution for bar chart
    const appointmentDistributionData = [
      { name: 'Total', count: total_appointments, color: '#6366F1' },
      { name: 'Today', count: today_appointments, color: '#8B5CF6' },
      { name: 'Completed', count: completed_appointments, color: '#10B981' },
    ];

    return {
      appointmentStatusData,
      revenueData,
      appointmentDistributionData,
    };
  }, [dashboardData]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  // KPI Cards Component
  const KPICard = ({ title, value, color, prefix = '', suffix = '' }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -2 }}
    >
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-600 mb-1`}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
    </motion.div>
  );

  // Show loading/empty state
  if (!dashboardData || !chartData) {
    return (
      <Dashboard>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No data available</p>
            <button 
              onClick={() => fetchDashboardData()}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Track appointments, revenue, and performance metrics
                </p>
                {dashboardData.today_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Today's Date: {dashboardData.today_date}
                  </p>
                )}
              </div>
              
              {/* Date Range Filter */}
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={dateRange.start_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={dateRange.end_date}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleDateFilter}
                    disabled={!dateRange.start_date || !dateRange.end_date}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Apply Filter
                  </button>
                  <button
                    onClick={handleClearFilter}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
          >
            <KPICard
              title="Total Appointments"
              value={dashboardData.total_appointments}
              color="blue"
            />
            <KPICard
              title="Today's Appointments"
              value={dashboardData.today_appointments}
              color="green"
            />
            <KPICard
              title="Completed Appointments"
              value={dashboardData.completed_appointments}
              color="green"
            />
            <KPICard
              title="Total Revenue"
              value={dashboardData.total_revenue}
              prefix="₹"
              color="purple"
            />
          </motion.div>

          

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart - Appointment Status */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Appointment Status Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Appointments']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Appointment Distribution Bar Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appointment Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.appointmentDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Appointments']} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Appointments"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.appointmentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Dashboard>
  );
};

export default AnalyticsDashboard;