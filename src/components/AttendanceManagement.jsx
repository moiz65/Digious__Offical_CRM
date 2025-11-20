import { useState, useEffect, useRef } from 'react';
import { 
  Clock, Calendar, Users, CheckCircle, XCircle, Plus, 
  Search, Filter, Download, MoreVertical, Eye, Edit, 
  RefreshCw, TrendingUp, BarChart3, Coffee, LogIn, LogOut,
  ChevronDown, ChevronUp, MapPin, Smartphone, Monitor,
  FileText, Printer, Mail, UserCheck, AlertTriangle,
  Play, Square, Pause, Circle, Camera, Video, Mic, 
  Zap, Battery, Wifi, Cloud, Shield, Lock, Unlock,
  Bell, MessageCircle, Phone, Map, Navigation,
  PieChart, BarChart, LineChart, Target, Award,
  Settings, RotateCw, Power, WifiOff, Bluetooth,
  Heart, Activity, Thermometer, Gauge,
  DownloadCloud, UploadCloud, Database, Server,
  Smartphone as Mobile,
  Laptop, Tablet, Watch, Headphones,
  X, SlidersHorizontal,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  UserCheck as UserCheckIcon,
  XCircle as XCircleIcon,
  Coffee as CoffeeIcon,
  Heart as HeartIcon,
  Umbrella,
  Sun
} from 'lucide-react';

// Import Chart.js properly
import Chart from 'chart.js/auto';

// Data normalization function
const normalizeAttendanceData = (data) => {
  return data.map(record => ({
    id: record.id || Date.now(),
    employeeId: record.employeeId || 0,
    employee: {
      id: record.employee?.id || 0,
      name: record.employee?.name || 'Unknown Employee',
      department: record.employee?.department || 'Unknown',
      position: record.employee?.position || 'Unknown',
      avatar: record.employee?.avatar || '',
      email: record.employee?.email || '',
      phone: record.employee?.phone || '',
      team: record.employee?.team || 'Unknown'
    },
    date: record.date || new Date().toISOString().split('T')[0],
    checkIn: record.checkIn || null,
    checkOut: record.checkOut || null,
    status: record.status || 'Unknown',
    hours: record.hours || 0,
    location: {
      type: record.location?.type || 'Unknown',
      coordinates: record.location?.coordinates || {},
      address: record.location?.address || 'N/A',
      accuracy: record.location?.accuracy || 'Unknown'
    },
    device: {
      type: record.device?.type || 'Unknown',
      model: record.device?.model || 'N/A',
      os: record.device?.os || 'N/A',
      ip: record.device?.ip || 'N/A',
      browser: record.device?.browser || 'N/A'
    },
    verification: {
      method: record.verification?.method || 'Manual',
      confidence: record.verification?.confidence || 100,
      timestamp: record.verification?.timestamp || 'N/A'
    },
    breaks: record.breaks || [],
    overtime: record.overtime || 0,
    productivity: record.productivity || 0,
    focusSessions: record.focusSessions || [],
    notes: record.notes || '',
    alerts: record.alerts || [],
    sessionQuality: record.sessionQuality || 'Unknown',
    leaveType: record.leaveType || null
  }));
};

// Filter Configuration
const filterConfig = {
  departments: ['All', 'Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'],
  statuses: ['All', 'Present', 'Active', 'Late', 'Absent', 'Remote'],
  locations: ['All', 'Office', 'Remote', 'Unknown'],
  devices: ['All', 'Desktop', 'Laptop', 'Mobile', 'Tablet', 'Unknown'],
  sessionQualities: ['All', 'Excellent', 'Good', 'Average', 'Poor', 'Unknown'],
  verificationMethods: ['All', 'Manual', 'Mobile App', 'Web Portal', 'Biometric', 'None'],
  timeRanges: [
    'All Time',
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'This Month',
    'Last Month'
  ],
  productivityRanges: [
    { label: 'All', min: 0, max: 100 },
    { label: 'Excellent (90-100%)', min: 90, max: 100 },
    { label: 'Good (75-89%)', min: 75, max: 89 },
    { label: 'Average (60-74%)', min: 60, max: 74 },
    { label: 'Poor (0-59%)', min: 0, max: 59 }
  ]
};

// Enhanced Pie Chart with Chart.js
const EnhancedAttendancePieChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Enhanced statistics with more categories
  const enhancedStats = {
    present: data.filter(a => a.status === 'Present').length,
    active: data.filter(a => a.status === 'Active').length,
    late: data.filter(a => a.status === 'Late').length,
    absent: data.filter(a => a.status === 'Absent').length,
    remote: data.filter(a => a.location?.type === 'Remote' && (a.status === 'Present' || a.status === 'Active')).length
  };

  const total = data.length;

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      
      const chartData = {
        labels: ['Present', 'Active', 'Late', 'Absent', 'Remote'],
        datasets: [
          {
            data: [
              enhancedStats.present,
              enhancedStats.active,
              enhancedStats.late,
              enhancedStats.absent,
              enhancedStats.remote
            ],
            backgroundColor: [
              '#10B981', // green - present
              '#3B82F6', // blue - active
              '#F59E0B', // blue - late
              '#EF4444', // red - absent
              '#8B5CF6'  // violet - remote
            ],
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 15
          }
        ]
      };

      const config = {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '65%',
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, enhancedStats, total]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl shadow-xl p-6 border border-blue-100 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          Attendance Overview
        </h4>

        {/* FILTER */}
        <select className="px-4 py-2 text-sm border rounded-xl border-blue-200 bg-white text-gray-700 hover:bg-blue-50 transition shadow-sm">
          <option value="all">All Departments</option>
          <option value="engineering">Engineering</option>
          <option value="sales">Sales</option>
          <option value="hr">HR</option>
        </select>
      </div>

      {/* CHART */}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-inner mb-6">
        <div className="relative w-64 h-64">
          <canvas ref={chartRef} />
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">Team</div>
              <div className="text-lg font-bold text-gray-900">Attendance</div>
              <div className="text-xs text-gray-600 mt-1">{total} Employees</div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {Object.entries(enhancedStats).map(([status, count]) =>
          count > 0 ? (
            <div
              key={status}
              className="flex justify-between items-center p-4 rounded-xl bg-white shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full shadow-sm"
                  style={{ 
                    backgroundColor: 
                      status === 'present' ? '#10B981' :
                      status === 'active' ? '#3B82F6' :
                      status === 'late' ? '#F59E0B' :
                      status === 'absent' ? '#EF4444' : '#8B5CF6'
                  }}
                />
                <span className="font-semibold text-gray-900 capitalize">
                  {status === 'present' ? 'Present' :
                   status === 'active' ? 'Active' :
                   status === 'late' ? 'Late' :
                   status === 'absent' ? 'Absent' : 'Remote'}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 text-lg">{count}</div>
                <div className="text-sm text-gray-500">
                  {total > 0 ? Math.round((count / total) * 100) : 0}%
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* INSIGHT */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-100 border border-blue-200 shadow-inner">
        <p className="text-blue-800 font-semibold text-sm">
          <span className="font-bold">Insight:</span>{" "}
          {enhancedStats.present + enhancedStats.active} employees (
          {total > 0
            ? Math.round(
                ((enhancedStats.present + enhancedStats.active) / total) * 100
              )
            : 0}
          %) are currently working
        </p>
      </div>
    </div>
  );
};

// Line Chart Component for Analytics
const AttendanceTrendChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const ctx = chartRef.current.getContext('2d');
      
      // Sample trend data - in a real app, this would come from props
      const trendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Attendance Rate',
            data: [92, 88, 94, 96, 90, 85, 82],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          }
        ]
      };

      const config = {
        type: 'line',
        data: trendData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              min: 70,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg h-64">
      <h4 className="font-bold text-gray-900 mb-6 text-lg">Attendance Trend</h4>
      <canvas ref={chartRef} />
    </div>
  );
};

// Bar Chart Component for Department Performance
const DepartmentPerformanceChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const ctx = chartRef.current.getContext('2d');
      
      // Sample department data
      const departmentData = {
        labels: ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance'],
        datasets: [
          {
            label: 'Productivity Score',
            data: [88, 92, 95, 85, 90],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.6)'
            ],
            borderColor: [
              '#3B82F6',
              '#10B981',
              '#8B5CF6',
              '#F59E0B',
              '#3B82F6'
            ],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }
        ]
      };

      const config = {
        type: 'bar',
        data: departmentData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg h-64">
      <h4 className="font-bold text-gray-900 mb-6 text-lg">Department Performance</h4>
      <canvas ref={chartRef} />
    </div>
  );
};

// Location Distribution Chart
const LocationDistributionChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const ctx = chartRef.current.getContext('2d');
      
      const locationStats = {
        office: data.filter(a => a.location?.type === 'Office').length,
        remote: data.filter(a => a.location?.type === 'Remote').length,
        unknown: data.filter(a => a.location?.type === 'Unknown').length
      };

      const locationData = {
        labels: ['Office', 'Remote', 'Unknown'],
        datasets: [
          {
            data: [locationStats.office, locationStats.remote, locationStats.unknown],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(148, 163, 184, 0.8)'
            ],
            borderColor: [
              '#3B82F6',
              '#10B981',
              '#94A3B8'
            ],
            borderWidth: 2,
            hoverOffset: 15
          }
        ]
      };

      const config = {
        type: 'pie',
        data: locationData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      };

      chartInstance.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg h-64">
      <h4 className="font-bold text-gray-900 mb-6 text-lg">Work Location Distribution</h4>
      <canvas ref={chartRef} />
    </div>
  );
};

// Advanced Filters Component
function AdvancedFilters({ filters, onFiltersChange, onClearAll }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterType, value) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }
    return count + (value && value !== 'All' && value !== '' ? 1 : 0);
  }, 0);

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl border border-blue-100 shadow-lg mb-8">
      {/* Filters Header */}
      <div className="flex items-center gap-3 p-6 border-b border-blue-100">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="font-bold text-white">Filters</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Department
            </label>
            <select
              value={filters.department || 'All'}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Break Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Break Status
            </label>
            <select
              value={filters.breakStatus || 'All'}
              onChange={(e) => handleFilterChange('breakStatus', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              <option value="All">All</option>
              <option value="On Break">On Break</option>
              <option value="Not On Break">Not On Break</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Status
            </label>
            <select
              value={filters.status || 'All'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Time
            </label>
            <select
              value={filters.timeRange || 'All Time'}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Chip Component
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-2 rounded-full font-medium shadow-md transition-all duration-200 hover:shadow-lg">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-white/20 rounded-full p-0.5 transition-all duration-200"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// Enhanced Employee Detail Modal Component with Advanced Analytics and Filtering
function EnhancedEmployeeDetailModal({ employee, onClose, attendanceData }) {
  // Safe employee data with defaults
  const safeEmployee = {
    ...employee,
    employee: employee.employee || {},
    location: employee.location || { type: 'Unknown', coordinates: {}, address: 'N/A', accuracy: 'Unknown' },
    device: employee.device || { type: 'Unknown', model: 'N/A', os: 'N/A', ip: 'N/A', browser: 'N/A' },
    verification: employee.verification || { method: 'Manual', confidence: 100, timestamp: 'N/A' },
    breaks: employee.breaks || [],
    focusSessions: employee.focusSessions || [],
    alerts: employee.alerts || [],
    notes: employee.notes || '',
    sessionQuality: employee.sessionQuality || 'Unknown',
    productivity: employee.productivity || 0,
    overtime: employee.overtime || 0,
    hours: employee.hours || 0,
    checkIn: employee.checkIn || 'N/A',
    checkOut: employee.checkOut || 'N/A',
    status: employee.status || 'Unknown',
    date: employee.date || 'Unknown Date'
  };

  // State for filters
  const [filters, setFilters] = useState({
    timeRange: 'All Time',
    status: 'All',
    leaveType: 'All',
    minProductivity: 0,
    maxProductivity: 100,
    hasAlerts: 'All'
  });

  // Filter configuration
  const filterConfig = {
    timeRanges: [
      'All Time',
      'Last 7 Days',
      'Last 30 Days',
      'Last 90 Days',
      'This Month',
      'Last Month',
      'This Quarter',
      'Last Quarter'
    ],
    statuses: ['All', 'Present', 'Active', 'Late', 'Absent', 'Remote'],
    leaveTypes: ['All', 'None', 'Sick', 'Casual', 'Annual', 'Other']
  };

  // Filter employee records
  const filterEmployeeRecords = (records) => {
    return records.filter(record => {
      // Time range filter
      const recordDate = new Date(record.date);
      const now = new Date();
      let timeRangeMatch = true;

      switch (filters.timeRange) {
        case 'Last 7 Days':
          timeRangeMatch = (now - recordDate) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'Last 30 Days':
          timeRangeMatch = (now - recordDate) <= 30 * 24 * 60 * 60 * 1000;
          break;
        case 'Last 90 Days':
          timeRangeMatch = (now - recordDate) <= 90 * 24 * 60 * 60 * 1000;
          break;
        case 'This Month':
          timeRangeMatch = recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear();
          break;
        case 'Last Month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          timeRangeMatch = recordDate.getMonth() === lastMonth.getMonth() && 
                         recordDate.getFullYear() === lastMonth.getFullYear();
          break;
        case 'This Quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          timeRangeMatch = Math.floor(recordDate.getMonth() / 3) === currentQuarter && 
                         recordDate.getFullYear() === now.getFullYear();
          break;
        case 'Last Quarter':
          const lastQuarter = Math.floor((now.getMonth() - 3) / 3);
          timeRangeMatch = Math.floor(recordDate.getMonth() / 3) === lastQuarter && 
                         recordDate.getFullYear() === lastQuarter.getFullYear();
          break;
        default:
          timeRangeMatch = true;
      }

      // Status filter
      const statusMatch = filters.status === 'All' || record.status === filters.status;

      // Leave type filter
      const leaveTypeMatch = filters.leaveType === 'All' || 
                           (filters.leaveType === 'None' && !record.leaveType) ||
                           record.leaveType === filters.leaveType;

      // Productivity range filter
      const productivityMatch = (record.productivity || 0) >= filters.minProductivity && 
                              (record.productivity || 0) <= filters.maxProductivity;

      // Alerts filter
      const alertsMatch = filters.hasAlerts === 'All' ||
                         (filters.hasAlerts === 'With Alerts' && record.alerts && record.alerts.length > 0) ||
                         (filters.hasAlerts === 'Without Alerts' && (!record.alerts || record.alerts.length === 0));

      return timeRangeMatch && statusMatch && leaveTypeMatch && productivityMatch && alertsMatch;
    });
  };

  // Calculate comprehensive analytics for the employee
  const employeeRecords = attendanceData.filter(record => record.employeeId === safeEmployee.employeeId);
  const filteredRecords = filterEmployeeRecords(employeeRecords);
  
  const analytics = {
    // Basic Metrics
    totalWorkingDays: filteredRecords.length,
    totalPresentDays: filteredRecords.filter(record => 
      record.status === 'Present' || record.status === 'Active' || record.status === 'Late'
    ).length,
    totalAbsentDays: filteredRecords.filter(record => record.status === 'Absent').length,
    totalLateDays: filteredRecords.filter(record => record.status === 'Late').length,
    
    // Time-based Metrics
    totalOvertime: filteredRecords.reduce((sum, record) => sum + (record.overtime || 0), 0),
    averageProductivity: filteredRecords.length > 0 
      ? filteredRecords.reduce((sum, record) => sum + (record.productivity || 0), 0) / filteredRecords.length
      : 0,
    
    // Leave Metrics
    sickLeaves: filteredRecords.filter(record => record.leaveType === 'Sick').length,
    casualLeaves: filteredRecords.filter(record => record.leaveType === 'Casual').length,
    annualLeaves: filteredRecords.filter(record => record.leaveType === 'Annual').length,
    
    // Inactivity & Performance
    totalInactivity: filteredRecords.filter(record => 
      record.status === 'Absent' || (record.hours || 0) < 4
    ).length,
    
    // Derived Metrics
    attendanceRate: filteredRecords.length > 0 
      ? (filteredRecords.filter(record => 
          record.status === 'Present' || record.status === 'Active' || record.status === 'Late'
        ).length / filteredRecords.length) * 100 
      : 0,
    
    punctualityRate: filteredRecords.length > 0
      ? ((filteredRecords.filter(record => record.status === 'Present' || record.status === 'Active').length) / 
         filteredRecords.length) * 100
      : 0,
    
    totalHoursWorked: filteredRecords.reduce((sum, record) => sum + (record.hours || 0), 0),
    averageDailyHours: filteredRecords.length > 0 
      ? filteredRecords.reduce((sum, record) => sum + (record.hours || 0), 0) / filteredRecords.length
      : 0,

    // Additional metrics for filtered data
    totalRecords: employeeRecords.length,
    filteredRecords: filteredRecords.length,
    recordsWithAlerts: filteredRecords.filter(record => record.alerts && record.alerts.length > 0).length
  };

  const totalHours = safeEmployee.hours;
  const totalBreaks = safeEmployee.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
  const productiveHours = totalHours - (totalBreaks / 60);
  
  // Safe calculation for focus score
  const focusSessions = safeEmployee.focusSessions;
  const focusScore = focusSessions.length > 0 
    ? focusSessions.reduce((sum, session) => sum + (session.score || 0), 0) / focusSessions.length 
    : 0;

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      timeRange: 'All Time',
      status: 'All',
      leaveType: 'All',
      minProductivity: 0,
      maxProductivity: 100,
      hasAlerts: 'All'
    });
  };

  // Analytics Cards Component
  const AnalyticsCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm opacity-90">{title}</p>
        </div>
        <div className="p-2 bg-white bg-opacity-20 rounded-xl">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subtitle && (
        <div className="flex items-center justify-between">
          <span className="text-xs opacity-90">{subtitle}</span>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${
              trend > 0 ? 'text-emerald-200' : trend < 0 ? 'text-red-200' : 'text-gray-200'
            }`}>
              {trend > 0 ? <TrendingUpIcon className="h-3 w-3" /> : 
               trend < 0 ? <TrendingDownIcon className="h-3 w-3" /> : null}
              {trend !== 0 && `${Math.abs(trend)}%`}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== 'All Time' && value !== 'All' && value !== 0 && value !== 100
  ).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-blue-100">

        {/* HEADER */}
        <div className="flex justify-between items-center p-8 border-b border-blue-100 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold">Employee Performance Report</h3>
            <p className="text-blue-100 mt-2 text-sm">
              {safeEmployee.employee.name} • {safeEmployee.employee.department} • 
              Showing {analytics.filteredRecords} of {analytics.totalRecords} records
            </p>
          </div>

          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* FILTERS SECTION */}
        <div className="p-8 border-b border-blue-100 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filter Analytics
              {activeFilterCount > 0 && (
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {activeFilterCount} active
                </span>
              )}
            </h4>
            {activeFilterCount > 0 && (
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-blue-100"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              >
                {filterConfig.timeRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              >
                {filterConfig.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Leave Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Leave Type
              </label>
              <select
                value={filters.leaveType}
                onChange={(e) => handleFilterChange('leaveType', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              >
                {filterConfig.leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Alerts Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Alerts
              </label>
              <select
                value={filters.hasAlerts}
                onChange={(e) => handleFilterChange('hasAlerts', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
              >
                <option value="All">All Records</option>
                <option value="With Alerts">With Alerts Only</option>
                <option value="Without Alerts">Without Alerts</option>
              </select>
            </div>
          </div>

          {/* Productivity Range Filter */}
          {/* <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Productivity Range: {filters.minProductivity}% - {filters.maxProductivity}%
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minProductivity}
                  onChange={(e) => handleFilterChange('minProductivity', parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minProductivity}
                  onChange={(e) => handleFilterChange('minProductivity', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white shadow-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.maxProductivity}
                  onChange={(e) => handleFilterChange('maxProductivity', parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white shadow-sm"
                />
              </div>
            </div>
          </div> */}

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">Active Filters:</span>
              {filters.timeRange !== 'All Time' && (
                <FilterChip
                  label={`Time: ${filters.timeRange}`}
                  onRemove={() => handleFilterChange('timeRange', 'All Time')}
                />
              )}
              {filters.status !== 'All' && (
                <FilterChip
                  label={`Status: ${filters.status}`}
                  onRemove={() => handleFilterChange('status', 'All')}
                />
              )}
              {filters.leaveType !== 'All' && (
                <FilterChip
                  label={`Leave: ${filters.leaveType}`}
                  onRemove={() => handleFilterChange('leaveType', 'All')}
                />
              )}
              {filters.hasAlerts !== 'All' && (
                <FilterChip
                  label={`Alerts: ${filters.hasAlerts}`}
                  onRemove={() => handleFilterChange('hasAlerts', 'All')}
                />
              )}
              {(filters.minProductivity > 0 || filters.maxProductivity < 100) && (
                <FilterChip
                  label={`Productivity: ${filters.minProductivity}%-${filters.maxProductivity}%`}
                  onRemove={() => {
                    handleFilterChange('minProductivity', 0);
                    handleFilterChange('maxProductivity', 100);
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="p-8 space-y-8 bg-[#fff]">

          {/* TOP METRICS */}
          <section>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Key Performance Indicators</h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnalyticsCard title="Working Days" value={analytics.totalWorkingDays} subtitle="Total tracked" icon={CalendarIcon} color="from-blue-500 to-blue-700"/>
              <AnalyticsCard title="Present Days" value={analytics.totalPresentDays} subtitle={`${analytics.attendanceRate.toFixed(1)}% rate`} icon={UserCheckIcon} color="from-blue-500 to-blue-700"/>
              <AnalyticsCard title="Total Absents" value={analytics.totalAbsentDays} subtitle="Total absence" icon={XCircleIcon} color="from-rose-500 to-rose-700"/>
              <AnalyticsCard title="Total Lates " value={analytics.totalLateDays} subtitle={`${analytics.punctualityRate.toFixed(1)}% punctual`} icon={ClockIcon} color="from-blue-500 to-blue-700"/>
              <AnalyticsCard title="Overtime Hours" value={analytics.totalOvertime.toFixed(1)} subtitle="Extra hours" icon={ClockIcon} color="from-blue-500 to-blue-700"/>
              <AnalyticsCard title="Productivity" value={`${analytics.averageProductivity.toFixed(1)}%`} subtitle="Avg score" icon={TrendingUpIcon} color="from-emerald-500 to-emerald-700"/>
              <AnalyticsCard title="Inactivity" value={analytics.totalInactivity} subtitle="Low activity" icon={CoffeeIcon} color="from-slate-500 to-slate-700"/>
              <AnalyticsCard title="Sick Leaves" value={analytics.sickLeaves} subtitle="Medical leave" icon={HeartIcon} color="from-cyan-500 to-cyan-700"/>
            </div>
          </section>

          {/* LEAVE + HOURS SUMMARY */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard title="Casual Leaves" value={analytics.casualLeaves} subtitle="Personal leave" icon={Sun} color="from-blue-500 to-blue-700"/>
            <AnalyticsCard title="Annual Leaves" value={analytics.annualLeaves} subtitle="Vacations" icon={Umbrella} color="from-blue-500 to-blue-700"/>

            <div className="p-6 rounded-2xl bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalHoursWorked.toFixed(1)}h</p>
                  <p className="text-sm text-gray-600">Total Hours Worked</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Avg: {analytics.averageDailyHours.toFixed(1)}h per day
              </p>
            </div>
          </section>

          {/* LEAVES OVERVIEW */}
          {/* <section className="p-6 rounded-2xl bg-white shadow-lg border border-blue-100">
            <h4 className="font-bold text-gray-900 mb-6">Leave Overview</h4>

            <div className="space-y-4">
              {[ 
                { label: "Sick Leaves", value: analytics.sickLeaves },
                { label: "Casual Leaves", value: analytics.casualLeaves },
                { label: "Annual Leaves", value: analytics.annualLeaves },
              ].map((l, i) => (
                <div key={i} className="flex justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 text-blue-700 border border-blue-100">
                  <span className="font-medium">{l.label}</span>
                  <span className="font-bold">{l.value}</span>
                </div>
              ))}

              <div className="flex justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                <span>Total Leave Days</span>
                {analytics.sickLeaves + analytics.casualLeaves + analytics.annualLeaves}
              </div>
            </div>
          </section> */}

          {/* SESSION SUMMARY */}
          {/* <section className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border border-blue-100">
            <h4 className="text-gray-900 font-bold mb-6">
              Session Summary — {safeEmployee.date}
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { label: "Check In", value: safeEmployee.checkIn || "N/A" },
                { label: "Check Out", value: safeEmployee.checkOut || "N/A" },
                { label: "Total Hours", value: `${safeEmployee.hours || 0}h` },
                { label: "Overtime", value: `${safeEmployee.overtime || 0}h` },
                { label: "Productivity", value: `${safeEmployee.productivity || 0}%`, color: "text-blue-700" },
                { label: "Quality", value: safeEmployee.sessionQuality },
                { label: "Focus Score", value: `${focusScore.toFixed(1)}%`, color: "text-blue-700" },
                { label: "Breaks", value: safeEmployee.breaks.length },
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow border border-blue-100 hover:shadow-md transition-all duration-200">
                  <div className="text-xs text-gray-600">{item.label}</div>
                  <div className={`text-lg font-bold mt-1 ${item.color || "text-gray-900"}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </section> */}

        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center p-6 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50 rounded-b-3xl">
          <div className="text-sm text-gray-600">
            Showing {analytics.filteredRecords} of {analytics.totalRecords} records
            {activeFilterCount > 0 && ` • ${activeFilterCount} filter(s) active`}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 text-gray-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium">
              Close
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md">
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Attendance Table Component
function EnhancedAttendanceTable({ data, onStartBreak, onEndBreak, onViewDetails, onForceCheckout, activeBreak }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50">
          <th className="text-left py-5 px-6 text-sm font-bold text-gray-800">Employee</th>
          <th className="text-left py-5 px-6 text-sm font-bold text-gray-800">Check In/Out</th>
          <th className="text-left py-5 px-6 text-sm font-bold text-gray-800">Breaks</th>
          <th className="text-left py-5 px-6 text-sm font-bold text-gray-800">Status</th>
          <th className="text-left py-5 px-6 text-sm font-bold text-gray-800">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-blue-100">
        {data.map((record) => (
          <EnhancedAttendanceRow 
            key={record.id}
            record={record}
            onStartBreak={onStartBreak}
            onEndBreak={onEndBreak}
            onViewDetails={onViewDetails}
            onForceCheckout={onForceCheckout}
            activeBreak={activeBreak}
          />
        ))}
      </tbody>
    </table>
  );
}

// Enhanced Attendance Row Component
function EnhancedAttendanceRow({ record, onStartBreak, onEndBreak, onViewDetails, onForceCheckout, activeBreak }) {
  const activeBreakForEmployee = (record.breaks || []).find(b => b.status === 'active');
  const totalBreakTime = (record.breaks || []).reduce((sum, breakItem) => sum + (breakItem.duration || 0), 0);

  return (
    <tr className="hover:bg-gradient-to-r from-blue-25 to-blue-25 transition-all duration-300 group">
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
              {record.employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            {record.status === 'Active' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900">{record.employee.name}</div>
            <div className="text-sm text-gray-600">{record.employee.department} • {record.employee.team}</div>
          </div>
        </div>
      </td>
      
      <td className="py-5 px-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <LogIn className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold">{record.checkIn || '--:--'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <LogOut className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm">{record.checkOut || '--:--'}</span>
          </div>
        </div>
      </td>
      
      <td className="py-5 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Coffee className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold">{(record.breaks || []).length}</span>
        </div>
        {totalBreakTime > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {Math.floor(totalBreakTime / 60)}h {totalBreakTime % 60}m
          </div>
        )}
      </td>
      
      <td className="py-5 px-6">
        <div className="space-y-2">
          <EnhancedStatusBadge status={record.status} />
          {record.sessionQuality && (
            <div className={`text-xs font-semibold ${
              record.sessionQuality === 'Excellent' ? 'text-emerald-600' :
              record.sessionQuality === 'Good' ? 'text-blue-600' :
              'text-blue-600'
            }`}>
              {record.sessionQuality}
            </div>
          )}
        </div>
      </td>
      
      <td className="py-5 px-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewDetails(record)}
            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          {record.status === 'Active' && !activeBreakForEmployee && (
            <button 
              onClick={() => onStartBreak(record.employeeId)}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              title="Start Break"
            >
              <Coffee className="h-5 w-5" />
            </button>
          )}
          
          {activeBreakForEmployee && (
            <button 
              onClick={() => onEndBreak(record.employeeId, activeBreakForEmployee.id)}
              className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200"
              title="End Break"
            >
              <Square className="h-5 w-5" />
            </button>
          )}
          
          {record.status === 'Active' && (
            <button 
              onClick={() => onForceCheckout(record.employeeId)}
              className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
              title="Force Checkout"
            >
              <Power className="h-5 w-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// Enhanced Status Badge Component
function EnhancedStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Present':
        return { color: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600', icon: CheckCircle };
      case 'Active':
        return { color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600', icon: Activity };
      case 'Late':
        return { color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600', icon: Clock };
      case 'Absent':
        return { color: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white border-rose-600', icon: XCircle };
      case 'Remote':
        return { color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600', icon: Smartphone };
      default:
        return { color: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-600', icon: Circle };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md ${config.color}`}>
      <IconComponent className="h-4 w-4" />
      {status}
    </span>
  );
}

// Notifications Panel Component
function NotificationsPanel({ notifications, onClearAll, onMarkAsRead }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl border border-blue-100 p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
            <Bell className="h-5 w-5 text-white" />
          </div>
          Notifications
          {unreadCount > 0 && (
            <span className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm px-3 py-1 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </h3>
        <button 
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
              notification.read 
                ? 'bg-white border-blue-100' 
                : 'bg-gradient-to-r from-blue-50 to-blue-50 border-blue-200 shadow-md'
            }`}
            onClick={() => onMarkAsRead(notification.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm text-gray-900">
                {notification.title}
              </span>
              <span className="text-xs text-gray-500">
                {notification.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Break Management Modal Component
function EnhancedBreakManagementModal({ onClose, attendanceData, onEndBreak }) {
  const activeBreaks = attendanceData.flatMap(record => 
    (record.breaks || []).filter(b => b.status === 'active').map(b => ({
      ...b,
      employee: record.employee,
      recordId: record.id,
      employeeId: record.employeeId
    }))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl w-full max-w-4xl shadow-2xl border border-blue-100">
        <div className="flex justify-between items-center p-8 border-b border-blue-100 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold">Break Management Center</h3>
            <p className="text-blue-100">Monitor and manage all active employee breaks in real-time</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8">
          {activeBreaks.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-lg">Active Breaks</h4>
                <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full font-medium">{activeBreaks.length} ongoing</span>
              </div>
              {activeBreaks.map((breakItem) => (
                <div key={`${breakItem.recordId}-${breakItem.id}`} 
                     className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-md" />
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-md">
                      {breakItem.employee?.name?.split(' ').map(n => n[0]).join('') || 'EE'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{breakItem.employee?.name || 'Unknown Employee'}</div>
                      <div className="text-sm text-gray-600">
                        Started at {breakItem.start} • {breakItem.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full">
                      Ongoing • {Math.floor((new Date() - new Date(`2000-01-01 ${breakItem.start}`)) / (1000 * 60))}m
                    </span>
                    <button 
                      onClick={() => onEndBreak(breakItem.employeeId, breakItem.id)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md font-medium"
                    >
                      End Break
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-blue-100 to-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Coffee className="h-10 w-10 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">No Active Breaks</h4>
              <p className="text-gray-600">All employees are currently working.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4 p-8 border-t border-blue-100">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium"
          >
            Close
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md">
            Break Policy Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Geo Location Modal Component
function GeoLocationModal({ onClose, attendanceData }) {
  const locations = attendanceData.map(record => ({
    ...record,
    coordinates: record.location?.coordinates || {}
  }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl w-full max-w-6xl h-[80vh] shadow-2xl border border-blue-100">
        <div className="flex justify-between items-center p-8 border-b border-blue-100 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
          <div>
            <h3 className="text-2xl font-bold">Employee Location Map</h3>
            <p className="text-blue-100">Real-time geographic distribution of your team</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8 h-[calc(100%-80px)]">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl w-full h-full flex items-center justify-center relative shadow-inner">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Map className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Location Tracking Map</h4>
              <p className="text-gray-600 mb-8">Interactive map showing employee locations</p>
              
              <div className="flex justify-center gap-6">
                {locations.slice(0, 3).map((location, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full shadow-md ${
                        location.location?.type === 'Office' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-emerald-400 to-cyan-500'
                      }`}></div>
                      <span className="font-bold text-sm text-gray-900">{location.employee.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">{location.location?.address || 'Unknown location'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard({ onClose, attendanceData }) {
  const productivityData = attendanceData.map(record => record.productivity || 0);
  const averageProductivity = productivityData.length > 0 
    ? productivityData.reduce((a, b) => a + b, 0) / productivityData.length 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl w-full max-w-7xl h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="flex justify-between items-center p-8 border-b border-blue-100 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-3xl">
          <div>
            <h3 className="text-3xl font-bold">Advanced Analytics Dashboard</h3>
            <p className="text-blue-100">Comprehensive insights into team attendance and productivity</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold">94%</div>
              <div className="text-sm opacity-90">Attendance Rate</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold">{averageProductivity.toFixed(1)}%</div>
              <div className="text-sm opacity-90">Avg Productivity</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold">2.3h</div>
              <div className="text-sm opacity-90">Avg Daily Overtime</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-3xl font-bold">87%</div>
              <div className="text-sm opacity-90">Remote Work Efficiency</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <EnhancedAttendancePieChart data={attendanceData} />

            {/* Line Chart */}
            <AttendanceTrendChart data={attendanceData} />

            {/* Bar Chart */}
            <DepartmentPerformanceChart data={attendanceData} />

            {/* Location Chart */}
            <LocationDistributionChart data={attendanceData} />
          </div>

          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 shadow-lg">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              AI-Powered Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="text-lg font-semibold text-gray-900 mb-3">Optimize Work Hours</div>
                <div className="text-sm text-gray-600">Consider flexible scheduling based on attendance patterns</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="text-lg font-semibold text-gray-900 mb-3">Team Performance</div>
                <div className="text-sm text-gray-600">Review department-specific attendance trends</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function AdvancedAttendanceManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: 'All',
    status: 'All',
    location: 'All',
    timeRange: 'All Time',
    device: 'All',
    sessionQuality: 'All',
    productivityRange: 'All',
    verificationMethod: 'All',
    hasAlerts: 'All',
    breakStatus: 'All',
    minOvertime: 0,
    maxOvertime: 10
  });
  const [viewMode, setViewMode] = useState('daily');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Sample data with all required fields
  const sampleData = [
    {
      id: 1,
      employeeId: 1,
      employee: {
        id: 1,
        name: 'John Smith',
        department: 'Sales',
        position: 'Manager',
        avatar: '/avatars/john.jpg',
        email: 'john@company.com',
        phone: '+1 (555) 123-4567',
        team: 'Enterprise Sales'
      },
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '17:30',
      status: 'Present',
      hours: 8.5,
      location: {
        type: 'Office',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        address: '123 Main St, New York, NY',
        accuracy: 'High'
      },
      device: {
        type: 'Desktop',
        model: 'Dell Precision 5560',
        os: 'Windows 11',
        ip: '192.168.1.100',
        browser: 'Chrome 120'
      },
      verification: {
        method: 'Manual',
        confidence: 100,
        timestamp: '08:59:45'
      },
      breaks: [
        { 
          id: 1, 
          type: 'Lunch', 
          start: '12:00', 
          end: '12:45', 
          duration: 45, 
          status: 'completed',
          location: 'Cafeteria',
          autoDetected: true
        },
        { 
          id: 2, 
          type: 'Coffee', 
          start: '15:30', 
          end: '15:45', 
          duration: 15, 
          status: 'completed',
          location: 'Break Room',
          autoDetected: true
        }
      ],
      overtime: 0.5,
      productivity: 92,
      focusSessions: [
        { start: '09:15', end: '11:45', duration: 150, score: 95 },
        { start: '13:00', end: '16:30', duration: 210, score: 88 }
      ],
      notes: 'High productivity day',
      alerts: [],
      sessionQuality: 'Excellent',
      leaveType: null
    },
    {
      id: 2,
      employeeId: 2,
      employee: {
        id: 2,
        name: 'Sarah Johnson',
        department: 'Marketing',
        position: 'Director',
        avatar: '/avatars/sarah.jpg',
        email: 'sarah@company.com',
        phone: '+1 (555) 123-4568',
        team: 'Digital Marketing'
      },
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '17:45',
      status: 'Late',
      hours: 8.5,
      location: {
        type: 'Remote',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        address: '456 Park Ave, New York, NY',
        accuracy: 'Medium'
      },
      device: {
        type: 'Laptop',
        model: 'MacBook Pro 16"',
        os: 'macOS Sonoma',
        ip: '192.168.1.101',
        browser: 'Safari 17'
      },
      verification: {
        method: 'Mobile App',
        confidence: 100,
        timestamp: '09:14:30'
      },
      breaks: [
        { 
          id: 1, 
          type: 'Lunch', 
          start: '12:30', 
          end: '13:15', 
          duration: 45, 
          status: 'completed',
          location: 'Home',
          autoDetected: false
        }
      ],
      overtime: 0.75,
      productivity: 85,
      focusSessions: [
        { start: '09:30', end: '12:00', duration: 150, score: 82 },
        { start: '13:30', end: '17:00', duration: 210, score: 87 }
      ],
      notes: 'Working from home - video calls',
      alerts: ['Late check-in'],
      sessionQuality: 'Good',
      leaveType: null
    },
    {
      id: 3,
      employeeId: 3,
      employee: {
        id: 3,
        name: 'Mike Chen',
        department: 'Engineering',
        position: 'Senior Developer',
        avatar: '/avatars/mike.jpg',
        email: 'mike@company.com',
        phone: '+1 (555) 123-4569',
        team: 'Backend Team'
      },
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: null,
      status: 'Active',
      hours: 0,
      location: {
        type: 'Office',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        address: '123 Main St, New York, NY',
        accuracy: 'High'
      },
      device: {
        type: 'Desktop',
        model: 'Custom Workstation',
        os: 'Ubuntu 22.04',
        ip: '192.168.1.102',
        browser: 'Firefox 121'
      },
      verification: {
        method: 'Web Portal',
        confidence: 100,
        timestamp: '08:44:20'
      },
      breaks: [
        { 
          id: 1, 
          type: 'Break', 
          start: '16:00', 
          end: null, 
          duration: 0, 
          status: 'active',
          location: 'Break Room',
          autoDetected: true
        }
      ],
      overtime: 0,
      productivity: 78,
      focusSessions: [
        { start: '09:00', end: '12:00', duration: 180, score: 92 },
        { start: '13:00', end: '16:00', duration: 180, score: 85 }
      ],
      notes: 'Currently working on project deadline',
      alerts: [],
      sessionQuality: 'Good',
      leaveType: null
    },
    {
      id: 4,
      employeeId: 4,
      employee: {
        id: 4,
        name: 'Emily Davis',
        department: 'HR',
        position: 'HR Specialist',
        avatar: '/avatars/emily.jpg',
        email: 'emily@company.com',
        phone: '+1 (555) 123-4570',
        team: 'Recruitment'
      },
      date: '2024-01-15',
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      hours: 0,
      location: {
        type: 'Unknown',
        coordinates: {},
        address: 'N/A',
        accuracy: 'Unknown'
      },
      device: {
        type: 'Unknown',
        model: 'N/A',
        os: 'N/A',
        ip: 'N/A',
        browser: 'N/A'
      },
      verification: {
        method: 'None',
        confidence: 0,
        timestamp: 'N/A'
      },
      breaks: [],
      overtime: 0,
      productivity: 0,
      focusSessions: [],
      notes: 'Sick leave',
      alerts: ['No check-in recorded'],
      sessionQuality: 'Unknown',
      leaveType: 'Sick'
    },
    // Additional sample records for better analytics
    {
      id: 5,
      employeeId: 1,
      employee: {
        id: 1,
        name: 'John Smith',
        department: 'Sales',
        position: 'Manager',
        avatar: '/avatars/john.jpg',
        email: 'john@company.com',
        phone: '+1 (555) 123-4567',
        team: 'Enterprise Sales'
      },
      date: '2024-01-14',
      checkIn: '08:55',
      checkOut: '17:25',
      status: 'Present',
      hours: 8.5,
      overtime: 0.25,
      productivity: 88,
      leaveType: null
    },
    {
      id: 6,
      employeeId: 1,
      employee: {
        id: 1,
        name: 'John Smith',
        department: 'Sales',
        position: 'Manager',
        avatar: '/avatars/john.jpg',
        email: 'john@company.com',
        phone: '+1 (555) 123-4567',
        team: 'Enterprise Sales'
      },
      date: '2024-01-13',
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      hours: 0,
      overtime: 0,
      productivity: 0,
      leaveType: 'Annual'
    },
    {
      id: 7,
      employeeId: 2,
      employee: {
        id: 2,
        name: 'Sarah Johnson',
        department: 'Marketing',
        position: 'Director',
        avatar: '/avatars/sarah.jpg',
        email: 'sarah@company.com',
        phone: '+1 (555) 123-4568',
        team: 'Digital Marketing'
      },
      date: '2024-01-14',
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      hours: 0,
      overtime: 0,
      productivity: 0,
      leaveType: 'Casual'
    }
  ];

  const [attendanceData, setAttendanceData] = useState(normalizeAttendanceData(sampleData));

  // Real-time simulation
  useEffect(() => {
    if (realTimeUpdates && autoRefresh) {
      const interval = setInterval(() => {
        simulateRealTimeUpdates();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates, autoRefresh]);

  const simulateRealTimeUpdates = () => {
    setAttendanceData(prev => prev.map(record => {
      if (record.status === 'Active' && Math.random() > 0.7) {
        const hasActiveBreak = record.breaks.some(b => b.status === 'active');
        if (!hasActiveBreak && Math.random() > 0.5) {
          return {
            ...record,
            breaks: [...record.breaks, {
              id: Date.now(),
              type: 'Break',
              start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              end: null,
              duration: 0,
              status: 'active',
              location: record.location.type === 'Office' ? 'Break Room' : 'Home',
              autoDetected: true
            }]
          };
        }
      }
      return record;
    }));
  };

  // Enhanced filtering function
  const filteredData = attendanceData.filter(record => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.position.toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    const matchesDepartment = filters.department === 'All' || 
      record.employee.department === filters.department;

    // Status filter
    const matchesStatus = filters.status === 'All' || 
      record.status === filters.status;

    // Location filter
    const matchesLocation = filters.location === 'All' || 
      record.location?.type === filters.location;

    // Device filter
    const matchesDevice = filters.device === 'All' || 
      record.device?.type === filters.device;

    // Session quality filter
    const matchesSessionQuality = filters.sessionQuality === 'All' || 
      record.sessionQuality === filters.sessionQuality;

    // Productivity range filter
    const productivityRange = filterConfig.productivityRanges.find(
      range => range.label === filters.productivityRange
    );
    const matchesProductivity = !productivityRange || productivityRange.label === 'All' ||
      (record.productivity >= productivityRange.min && record.productivity <= productivityRange.max);

    // Verification method filter
    const matchesVerification = filters.verificationMethod === 'All' || 
      record.verification?.method === filters.verificationMethod;

    // Alerts filter
    const matchesAlerts = filters.hasAlerts === 'All' ||
      (filters.hasAlerts === 'With Alerts' && record.alerts.length > 0) ||
      (filters.hasAlerts === 'Without Alerts' && record.alerts.length === 0);

    // Break status filter
    const hasActiveBreak = record.breaks.some(b => b.status === 'active');
    const matchesBreakStatus = filters.breakStatus === 'All' ||
      (filters.breakStatus === 'On Break' && hasActiveBreak) ||
      (filters.breakStatus === 'Not On Break' && !hasActiveBreak);

    // Overtime filter
    const matchesOvertime = (record.overtime >= (filters.minOvertime || 0)) && 
      (record.overtime <= (filters.maxOvertime || 10));

    return matchesSearch && matchesDepartment && matchesStatus && matchesLocation &&
           matchesDevice && matchesSessionQuality && matchesProductivity &&
           matchesVerification && matchesAlerts && matchesBreakStatus && matchesOvertime;
  });

  // Statistics with safe calculations
  const stats = {
    totalEmployees: attendanceData.length,
    present: attendanceData.filter(a => a.status === 'Present' || a.status === 'Active').length,
    absent: attendanceData.filter(a => a.status === 'Absent').length,
    late: attendanceData.filter(a => a.status === 'Late').length,
    active: attendanceData.filter(a => a.status === 'Active').length,
    inactive: attendanceData.filter(a => a.status === 'Absent' || a.checkOut !== null).length,
    activeBreaks: attendanceData.reduce((count, record) => 
      count + (record.breaks || []).filter(b => b.status === 'active').length, 0
    ),
    remoteWorkers: attendanceData.filter(a => a.location?.type === 'Remote').length,
    averageProductivity: attendanceData.length > 0 
      ? (attendanceData.reduce((sum, record) => sum + (record.productivity || 0), 0) / attendanceData.length).toFixed(1)
      : 0,
    totalOvertime: attendanceData.reduce((sum, record) => sum + (record.overtime || 0), 0).toFixed(1),
    verifiedCheckins: attendanceData.filter(a => (a.verification?.confidence || 0) > 95).length
  };

  // Recent Activities
  const recentActivities = [
    {
      id: 1,
      employee: 'John Smith',
      action: 'checked out',
      time: '2 minutes ago',
      type: 'checkout',
      icon: LogOut
    },
    {
      id: 2,
      employee: 'Sarah Johnson',
      action: 'started a break',
      time: '5 minutes ago',
      type: 'break',
      icon: Coffee
    },
    {
      id: 3,
      employee: 'Mike Chen',
      action: 'checked in',
      time: '1 hour ago',
      type: 'checkin',
      icon: LogIn
    },
    {
      id: 4,
      employee: 'Emily Davis',
      action: 'reported sick leave',
      time: '2 hours ago',
      type: 'absence',
      icon: AlertTriangle
    }
  ];

  // Enhanced break management
  const handleStartBreak = (employeeId) => {
    setAttendanceData(prev => prev.map(att => 
      att.employeeId === employeeId && att.status === 'Active' 
        ? {
            ...att,
            breaks: [...(att.breaks || []), {
              id: Date.now(),
              type: 'Break',
              start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              end: null,
              duration: 0,
              status: 'active',
              location: att.location?.type === 'Office' ? 'Break Room' : 'Remote',
              autoDetected: false
            }]
          }
        : att
    ));
    
    addNotification('Break Started', `${getEmployeeName(employeeId)} started a break`, 'info');
  };

  const handleEndBreak = (employeeId, breakId) => {
    setAttendanceData(prev => prev.map(att => 
      att.employeeId === employeeId 
        ? {
            ...att,
            breaks: (att.breaks || []).map(b => 
              b.id === breakId 
                ? {
                    ...b,
                    end: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    duration: Math.round((new Date() - new Date(`${att.date} ${b.start}`)) / (1000 * 60)),
                    status: 'completed'
                  }
                : b
            )
          }
        : att
    ));
    
    addNotification('Break Ended', `${getEmployeeName(employeeId)} ended their break`, 'success');
    setActiveBreak(null);
  };

  const handleForceCheckout = (employeeId) => {
    setAttendanceData(prev => prev.map(att => 
      att.employeeId === employeeId && att.status === 'Active'
        ? {
            ...att,
            checkOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Present',
            hours: calculateHours(att.checkIn, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          }
        : att
    ));
    
    addNotification('Forced Checkout', `${getEmployeeName(employeeId)} was automatically checked out`, 'warning');
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const getEmployeeName = (employeeId) => {
    const employee = attendanceData.find(a => a.employeeId === employeeId)?.employee;
    return employee?.name || 'Employee';
  };

  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01 ${start}`);
    const endTime = new Date(`2000-01-01 ${end}`);
    return (endTime - startTime) / (1000 * 60 * 60);
  };

  const clearAllFilters = () => {
    setFilters({
      department: 'All',
      status: 'All',
      location: 'All',
      timeRange: 'All Time',
      device: 'All',
      sessionQuality: 'All',
      productivityRange: 'All',
      verificationMethod: 'All',
      hasAlerts: 'All',
      breakStatus: 'All',
      minOvertime: 0,
      maxOvertime: 10
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
              Advanced Attendance Management
            </h1>
            <p className="text-gray-600 mt-3 text-lg">Comprehensive attendance tracking with real-time monitoring and analytics</p>
          </div>
          <div className="flex gap-4">
            {/* <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Live Updates</span>
            </div> */}
            {/* <button 
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-3 px-5 py-3 border border-blue-200 rounded-xl hover:bg-white transition-all duration-200 bg-white shadow-md hover:shadow-lg font-medium"
            >
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Analytics
            </button> */}
            {/* <button 
              onClick={() => setShowGeoModal(true)}
              className="flex items-center gap-3 px-5 py-3 border border-blue-200 rounded-xl hover:bg-white transition-all duration-200 bg-white shadow-md hover:shadow-lg font-medium"
            >
              <Map className="h-5 w-5 text-blue-600" />
              Geo View
            </button> */}
            <button className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-medium">
              <Download className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.present}</p>
                <p className="text-sm font-semibold text-gray-600">Present</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-md">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full inline-block">+2 from yesterday</div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.absent}</p>
                <p className="text-sm font-semibold text-gray-600">Absent</p>
              </div>
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-3 rounded-xl shadow-md">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-full inline-block">+1 from yesterday</div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm font-semibold text-gray-600">Active</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full inline-block">Currently working</div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-25 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-sm font-semibold text-gray-600">Inactive</p>
              </div>
              <div className="bg-gradient-to-r from-slate-500 to-slate-600 p-3 rounded-xl shadow-md">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 font-semibold bg-slate-50 px-2 py-1 rounded-full inline-block">Checked out or absent</div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters 
          filters={filters}
          onFiltersChange={setFilters}
          onClearAll={clearAllFilters}
        />

        {/* Filters and Recent Activities in same row */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Filters Section - 3 columns */}
          <div className="xl:col-span-3">
            <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl border border-blue-100 shadow-lg mb-8">
      {/* Filters Header */}
      <div className="flex items-center gap-3 p-6 border-b border-blue-100">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="font-bold text-white">Filters</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Department
            </label>
            <select
              value={filters.department || 'All'}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Break Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Break Status
            </label>
            <select
              value={filters.breakStatus || 'All'}
              onChange={(e) => handleFilterChange('breakStatus', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              <option value="All">All</option>
              <option value="On Break">On Break</option>
              <option value="Not On Break">Not On Break</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Status
            </label>
            <select
              value={filters.status || 'All'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Time
            </label>
            <select
              value={filters.timeRange || 'All Time'}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
            >
              {filterConfig.timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
            
            <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl p-6 border border-blue-100 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div className="flex flex-col sm:flex-row gap-6 flex-1">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
                    <input
                      type="text"
                      placeholder="Search employees, departments, teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-xl">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{filteredData.length} of {attendanceData.length} records</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-3 text-sm text-gray-700 bg-white px-4 py-2 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      checked={realTimeUpdates}
                      onChange={(e) => setRealTimeUpdates(e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    Live Updates
                  </label>
                  <label className="flex items-center gap-3 text-sm text-gray-700 bg-white px-4 py-2 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    Auto Refresh
                  </label>
                  {/* <button 
                    onClick={() => setShowBreakModal(true)}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md font-medium"
                  >
                    <Coffee className="h-5 w-5" />
                    Breaks
                  </button> */}
                </div>
              </div>
            </div>

            {/* Enhanced Attendance Table */}
            <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl border border-blue-100 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <EnhancedAttendanceTable 
                  data={filteredData}
                  onStartBreak={handleStartBreak}
                  onEndBreak={handleEndBreak}
                  onViewDetails={setSelectedEmployee}
                  onForceCheckout={handleForceCheckout}
                  activeBreak={activeBreak}
                />
              </div>
            </div>
          </div>

          {/* Sidebar with Pie Chart and Activities */}
          <div className="space-y-8">
            {/* Pie Chart */}
            <EnhancedAttendancePieChart data={filteredData} />

            {/* Recent Activities Sidebar */}
            <div className="bg-gradient-to-br from-white to-blue-25 rounded-3xl p-6 border border-blue-100 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-all duration-300 hover:shadow-md">
                    <div className={`p-3 rounded-xl shadow-md ${
                      activity.type === 'checkin' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                      activity.type === 'checkout' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      activity.type === 'break' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      'bg-gradient-to-r from-rose-500 to-rose-600'
                    }`}>
                      <activity.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{activity.employee}</div>
                      <div className="text-sm text-gray-600">{activity.action}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Panel */}
            <NotificationsPanel 
              notifications={notifications}
              onClearAll={() => setNotifications([])}
              onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
            />
          </div>
        </div>

        {/* Enhanced Modals */}
        {selectedEmployee && (
          <EnhancedEmployeeDetailModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            attendanceData={attendanceData}
          />
        )}

        {showBreakModal && (
          <EnhancedBreakManagementModal
            onClose={() => setShowBreakModal(false)}
            attendanceData={attendanceData}
            onEndBreak={handleEndBreak}
          />
        )}

        {showGeoModal && (
          <GeoLocationModal
            onClose={() => setShowGeoModal(false)}
            attendanceData={attendanceData}
          />
        )}

        {showAnalytics && (
          <AnalyticsDashboard
            onClose={() => setShowAnalytics(false)}
            attendanceData={attendanceData}
          />
        )}
      </div>
    </div>
  );
}

export default AdvancedAttendanceManagement;