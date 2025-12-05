import { useState, useEffect } from 'react';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, FileText, Download, 
  Filter, Plus, Search, AlertCircle, ChevronDown, Settings, Eye, 
  Edit3, Trash2, MoreVertical, UserPlus, RotateCcw, BarChart3,
  Send, Mail, Bell, Shield, Zap, Crown, Coffee, Sun, Moon,
  ArrowLeft, ArrowRight, User, Target, PieChart, ChevronUp,
  Building, Grid, List, X, MessageCircle, UserCheck, UserX,
  Utensils,Sparkle, Cigarette, Wifi, Activity
} from 'lucide-react';
import TopNavMenu from './TopNavMenu';

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Break Types Configuration
const BREAK_TYPES = {
  Cigarette: { label: 'Cigarette Break', icon: Cigarette, color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  Pray: { label: 'Pray Break', icon: Sparkle, color: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  dinner: { label: 'Dinner Break', icon: Utensils, color: 'bg-red-100 text-red-800', border: 'border-red-200' },
  lunch: { label: 'Lunch Break', icon: Coffee, color: 'bg-green-100 text-green-800', border: 'border-green-200' },
  washroom: { label: 'Washroom Break', icon: Wifi, color: 'bg-blue-100 text-blue-800', border: 'border-blue-200' },
  short: { label: 'Short Break', icon: Activity, color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' }
};

// Enhanced Column Chart Component with Chart.js
const ColumnChartComponent = ({ data, title, height = 300, stacked = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        mode: stacked ? 'index' : 'nearest',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const chartData = stacked ? {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Present',
        data: data.map(item => item.present),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: 'Leaves',
        data: data.map(item => item.leave),
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 1,
      },
      {
        label: 'Half Days',
        data: data.map(item => item.halfday),
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
      {
        label: 'Absent',
        data: data.map(item => item.absent),
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
    ],
  } : {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex flex-col w-full" style={{ height: `${height}px` }}>
      <Bar 
        data={chartData} 
        options={{
          ...options,
          scales: {
            ...options.scales,
            x: {
              ...options.scales.x,
              stacked: stacked,
            },
            y: {
              ...options.scales.y,
              stacked: stacked,
            },
          },
        }} 
      />
    </div>
  );
};

// Doughnut Chart Component for Status Distribution
const StatusDistributionChart = ({ data, title }) => {
  const chartData = {
    labels: ['Present', 'Leaves', 'Half Days', 'Absent'],
    datasets: [
      {
        data: [data.present, data.leave, data.halfday, data.absent],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#3b82f6',
          '#ef4444',
        ],
        borderColor: [
          '#0f966c',
          '#d97706',
          '#2563eb',
          '#dc2626',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: title,
      },
    },
    cutout: '60%',
  };

  return (
    <div className="flex flex-col w-full" style={{ height: '300px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

// Break Details Modal Component
const BreakDetailsModal = ({ isOpen, onClose, breaks, date, employeeName }) => {
  if (!isOpen) return null;

  const formatTime = (timeString) => {
    if (!timeString || timeString === '-') return 'N/A';
    return timeString;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end || start === '-' || end === '-') return 'N/A';
    
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const durationMs = endTime - startTime;
    const durationMins = Math.floor(durationMs / (1000 * 60));
    
    return `${durationMins} min`;
  };

  const getBreakStats = () => {
    const totalBreaks = breaks.length;
    const totalDuration = breaks.reduce((total, breakItem) => {
      if (breakItem.breakStart && breakItem.breakEnd && breakItem.breakStart !== '-' && breakItem.breakEnd !== '-') {
        const start = new Date(`2000-01-01T${breakItem.breakStart}`);
        const end = new Date(`2000-01-01T${breakItem.breakEnd}`);
        return total + (end - start) / (1000 * 60);
      }
      return total;
    }, 0);

    return {
      totalBreaks,
      totalDuration: Math.round(totalDuration),
      averageDuration: totalBreaks > 0 ? Math.round(totalDuration / totalBreaks) : 0
    };
  };

  const breakStats = getBreakStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Break Details</h2>
            <p className="text-gray-600">
              {employeeName} • {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition duration-300"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Break Statistics */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{breakStats.totalBreaks}</div>
              <div className="text-sm text-blue-800 font-medium">Total Breaks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-2xl font-bold text-green-600">{breakStats.totalDuration}</div>
              <div className="text-sm text-green-800 font-medium">Total Minutes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">{breakStats.averageDuration}</div>
              <div className="text-sm text-purple-800 font-medium">Avg per Break</div>
            </div>
          </div>
        </div>

        {/* Breaks List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {breaks.length > 0 ? (
            <div className="space-y-4">
              {breaks.map((breakItem, index) => {
                const breakType = BREAK_TYPES[breakItem.type] || BREAK_TYPES.short;
                const IconComponent = breakType.icon;
                const duration = calculateDuration(breakItem.breakStart, breakItem.breakEnd);

                return (
                  <div 
                    key={breakItem.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition duration-300"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${breakType.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{breakType.label}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${breakType.color}`}>
                            {breakItem.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Start: {formatTime(breakItem.breakStart)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>End: {formatTime(breakItem.breakEnd)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span>Duration: {duration}</span>
                          </div>
                          {breakItem.notes && (
                            <div className="flex items-center space-x-2 col-span-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span>Notes: {breakItem.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {duration}
                      </div>
                      <div className="text-xs text-gray-500">
                        Break #{index + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Breaks Recorded</h3>
              <p className="text-gray-500">No break data available for this day.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Uninformed Tracking Component
const UnexplainedAbsenceTracking = ({ 
  attendanceData, 
  employees, 
  selectedDate,
  onMarkAsExplained,
  onSendReminder 
}) => {
  const [selectedAbsences, setSelectedAbsences] = useState([]);

  // Get Uninformed for the selected date
  const getUnexplainedAbsences = () => {
    const todayAttendance = attendanceData.filter(item => item.date === selectedDate);
    
    return employees
      .map(employee => {
        const attendance = todayAttendance.find(a => a.employeeId === employee.id);
        const isAbsent = attendance?.status === 'absent';
        const isUnexplained = isAbsent && (!attendance?.notes || attendance.notes === 'No notification' || attendance.notes.includes('No explanation'));
        
        return isUnexplained ? {
          employee,
          attendance,
          date: selectedDate,
          reason: 'No explanation provided'
        } : null;
      })
      .filter(Boolean);
  };

  const unexplainedAbsences = getUnexplainedAbsences();

  const handleSelectAll = () => {
    if (selectedAbsences.length === unexplainedAbsences.length) {
      setSelectedAbsences([]);
    } else {
      setSelectedAbsences(unexplainedAbsences.map((_, index) => index));
    }
  };

  const handleSelectAbsence = (index) => {
    setSelectedAbsences(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleBulkMarkAsExplained = () => {
    selectedAbsences.forEach(index => {
      const absence = unexplainedAbsences[index];
      onMarkAsExplained(absence.employee.id, selectedDate, 'Employee provided explanation');
    });
    setSelectedAbsences([]);
  };

  const handleBulkSendReminder = () => {
    selectedAbsences.forEach(index => {
      const absence = unexplainedAbsences[index];
      onSendReminder(absence.employee.id, absence.employee.name);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Uninformed</h2>
          <p className="text-gray-600">
            Employees who haven't reported their absence for {new Date(selectedDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedAbsences.length > 0 && (
            <>
              <button
                onClick={handleBulkMarkAsExplained}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition duration-300"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Explained ({selectedAbsences.length})
              </button>
              <button
                onClick={handleBulkSendReminder}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition duration-300"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Reminder ({selectedAbsences.length})
              </button>
            </>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            unexplainedAbsences.length > 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {unexplainedAbsences.length} unexplained
          </span>
        </div>
      </div>

      {unexplainedAbsences.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              checked={selectedAbsences.length === unexplainedAbsences.length && unexplainedAbsences.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-4"
            />
            <div className="flex-1 grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
              <span>Employee</span>
              <span>Department</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
          </div>

          {unexplainedAbsences.map((absence, index) => (
            <div 
              key={absence.employee.id} 
              className="flex items-center p-4 bg-red-50 rounded-xl border border-red-200 hover:border-red-300 transition duration-300"
            >
              <input
                type="checkbox"
                checked={selectedAbsences.includes(index)}
                onChange={() => handleSelectAbsence(index)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mr-4"
              />
              
              <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-semibold">
                    {absence.employee.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{absence.employee.name}</h4>
                    <p className="text-sm text-gray-600">{absence.employee.position}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-700">{absence.employee.department}</span>
                </div>
                
                <div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Uninformed
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onMarkAsExplained(absence.employee.id, absence.date, 'Employee provided explanation')}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition duration-200"
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Mark Explained
                  </button>
                  <button
                    onClick={() => onSendReminder(absence.employee.id, absence.employee.name)}
                    className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition duration-200"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Remind
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All absences explained</h3>
          <p className="text-gray-500">Great! All employees have reported their absences for today.</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Monthly Overview Component
const MonthlyOverview = ({ 
  currentDate, 
  monthlyStats,
  attendanceData,
  employees,
  onFilterChange,
  activeFilter,
  timeRange,
  onTimeRangeChange,
  filters,
  onCustomDateRangeChange
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: filters.dateRange.start,
    end: filters.dateRange.end
  });

  const filterOptions = [
    { value: 'attendance', label: 'Attendance', icon: Users },
    { value: 'leaves', label: 'Leaves', icon: Calendar },
    { value: 'overtime', label: 'Overtime', icon: Clock },
    { value: 'late', label: 'Late Arrivals', icon: AlertCircle },
    { value: 'stacked', label: 'All Status', icon: BarChart3 }
  ];

  const timeRangeOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Calculate data based on time range
  const getChartData = () => {
    switch (timeRange) {
      case 'weekly':
        return getWeeklyData();
      case 'monthly':
        return getMonthlyComparisonData();
      case 'quarterly':
        return getQuarterlyData();
      case 'custom':
        return getCustomRangeData();
      default:
        return getWeeklyData();
    }
  };

  // Get data for custom date range
  const getCustomRangeData = () => {
    const startDate = new Date(customRange.start);
    const endDate = new Date(customRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return getDailyData(startDate, endDate);
    } else if (daysDiff <= 31) {
      return getWeeklyCustomData(startDate, endDate);
    } else {
      return getMonthlyCustomData(startDate, endDate);
    }
  };

  // Daily data for custom range
  const getDailyData = (startDate, endDate) => {
    const data = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayRecords = attendanceData.filter(record => record.date === dateStr);
      
      let presentCount = 0;
      let leaveCount = 0;
      let halfdayCount = 0;
      let absentCount = 0;
      let overtimeHours = 0;
      let lateCount = 0;
      
      dayRecords.forEach(record => {
        if (record.status === 'present') presentCount++;
        if (record.status === 'leave') leaveCount++;
        if (record.status === 'halfday') halfdayCount++;
        if (record.status === 'absent') absentCount++;
        if (record.overtime && record.overtime !== '0.0') {
          overtimeHours += parseFloat(record.overtime);
        }
        if (record.late && record.late !== '-') lateCount++;
      });
      
      if (activeFilter === 'stacked') {
        data.push({
          name: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          present: presentCount,
          leave: leaveCount,
          halfday: halfdayCount,
          absent: absentCount,
          color: '#10b981'
        });
      } else {
        let value, color;
        switch (activeFilter) {
          case 'attendance':
            value = presentCount;
            color = '#10b981';
            break;
          case 'leaves':
            value = leaveCount;
            color = '#f59e0b';
            break;
          case 'overtime':
            value = Math.round(overtimeHours);
            color = '#3b82f6';
            break;
          case 'late':
            value = lateCount;
            color = '#ef4444';
            break;
          default:
            value = presentCount;
            color = '#10b981';
        }
        
        data.push({
          name: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          value: value,
          color: color
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  // Weekly data for custom range
  const getWeeklyCustomData = (startDate, endDate) => {
    const data = [];
    const currentDate = new Date(startDate);
    let weekNumber = 1;
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
      
      let presentCount = 0;
      let leaveCount = 0;
      let halfdayCount = 0;
      let absentCount = 0;
      let overtimeHours = 0;
      let lateCount = 0;
      
      const tempDate = new Date(weekStart);
      while (tempDate <= weekEnd) {
        const dateStr = tempDate.toISOString().split('T')[0];
        const dayRecords = attendanceData.filter(record => record.date === dateStr);
        
        dayRecords.forEach(record => {
          if (record.status === 'present') presentCount++;
          if (record.status === 'leave') leaveCount++;
          if (record.status === 'halfday') halfdayCount++;
          if (record.status === 'absent') absentCount++;
          if (record.overtime && record.overtime !== '0.0') {
            overtimeHours += parseFloat(record.overtime);
          }
          if (record.late && record.late !== '-') lateCount++;
        });
        
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      if (activeFilter === 'stacked') {
        data.push({
          name: `Week ${weekNumber}`,
          present: presentCount,
          leave: leaveCount,
          halfday: halfdayCount,
          absent: absentCount,
          color: '#10b981'
        });
      } else {
        let value, color;
        switch (activeFilter) {
          case 'attendance':
            value = presentCount;
            color = '#10b981';
            break;
          case 'leaves':
            value = leaveCount;
            color = '#f59e0b';
            break;
          case 'overtime':
            value = Math.round(overtimeHours);
            color = '#3b82f6';
            break;
          case 'late':
            value = lateCount;
            color = '#ef4444';
            break;
          default:
            value = presentCount;
            color = '#10b981';
        }
        
        data.push({
          name: `Week ${weekNumber}`,
          value: value,
          color: color
        });
      }
      
      weekNumber++;
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return data;
  };

  // Monthly data for custom range
  const getMonthlyCustomData = (startDate, endDate) => {
    const data = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      if (monthEnd > endDate) monthEnd.setTime(endDate.getTime());
      
      let presentCount = 0;
      let leaveCount = 0;
      let halfdayCount = 0;
      let absentCount = 0;
      let overtimeHours = 0;
      let lateCount = 0;
      
      const tempDate = new Date(monthStart);
      while (tempDate <= monthEnd) {
        const dateStr = tempDate.toISOString().split('T')[0];
        const dayRecords = attendanceData.filter(record => record.date === dateStr);
        
        dayRecords.forEach(record => {
          if (record.status === 'present') presentCount++;
          if (record.status === 'leave') leaveCount++;
          if (record.status === 'halfday') halfdayCount++;
          if (record.status === 'absent') absentCount++;
          if (record.overtime && record.overtime !== '0.0') {
            overtimeHours += parseFloat(record.overtime);
          }
          if (record.late && record.late !== '-') lateCount++;
        });
        
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      if (activeFilter === 'stacked') {
        data.push({
          name: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          present: presentCount,
          leave: leaveCount,
          halfday: halfdayCount,
          absent: absentCount,
          color: '#10b981'
        });
      } else {
        let value, color;
        switch (activeFilter) {
          case 'attendance':
            value = presentCount;
            color = '#10b981';
            break;
          case 'leaves':
            value = leaveCount;
            color = '#f59e0b';
            break;
          case 'overtime':
            value = Math.round(overtimeHours);
            color = '#3b82f6';
            break;
          case 'late':
            value = lateCount;
            color = '#ef4444';
            break;
          default:
            value = presentCount;
            color = '#10b981';
        }
        
        data.push({
          name: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: value,
          color: color
        });
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return data;
  };

  // Enhanced weekly data calculation with stacked bars
  const getWeeklyData = () => {
    const weeklyData = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get all dates for the current month
    const monthDates = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      monthDates.push(new Date(d));
    }
    
    // Group by weeks
    const weeks = [];
    let currentWeek = [];
    
    monthDates.forEach(date => {
      currentWeek.push(date);
      if (date.getDay() === 6 || date.getDate() === lastDay.getDate()) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Calculate metrics for each week
    weeks.forEach((week, weekIndex) => {
      const weekDates = week.map(d => d.toISOString().split('T')[0]);
      
      let presentCount = 0;
      let leaveCount = 0;
      let halfdayCount = 0;
      let absentCount = 0;
      let overtimeHours = 0;
      let lateCount = 0;
      
      weekDates.forEach(date => {
        const dayRecords = attendanceData.filter(record => record.date === date);
        
        dayRecords.forEach(record => {
          if (record.status === 'present') presentCount++;
          if (record.status === 'leave') leaveCount++;
          if (record.status === 'halfday') halfdayCount++;
          if (record.status === 'absent') absentCount++;
          if (record.overtime && record.overtime !== '0.0') {
            overtimeHours += parseFloat(record.overtime);
          }
          if (record.late && record.late !== '-') lateCount++;
        });
      });
      
      if (activeFilter === 'stacked') {
        weeklyData.push({
          name: `Week ${weekIndex + 1}`,
          present: presentCount,
          leave: leaveCount,
          halfday: halfdayCount,
          absent: absentCount,
          color: '#10b981'
        });
      } else {
        let value, color;
        switch (activeFilter) {
          case 'attendance':
            value = presentCount;
            color = '#10b981';
            break;
          case 'leaves':
            value = leaveCount;
            color = '#f59e0b';
            break;
          case 'overtime':
            value = Math.round(overtimeHours);
            color = '#3b82f6';
            break;
          case 'late':
            value = lateCount;
            color = '#ef4444';
            break;
          default:
            value = presentCount;
            color = '#10b981';
        }
        
        weeklyData.push({
          name: `Week ${weekIndex + 1}`,
          value: value,
          color: color
        });
      }
    });
    
    // Fill remaining weeks with zero values if needed
    while (weeklyData.length < 5) {
      if (activeFilter === 'stacked') {
        weeklyData.push({
          name: `Week ${weeklyData.length + 1}`,
          present: 0,
          leave: 0,
          halfday: 0,
          absent: 0,
          color: '#10b981'
        });
      } else {
        weeklyData.push({
          name: `Week ${weeklyData.length + 1}`,
          value: 0,
          color: activeFilter === 'attendance' ? '#10b981' : 
                 activeFilter === 'leaves' ? '#f59e0b' :
                 activeFilter === 'overtime' ? '#3b82f6' : '#ef4444'
        });
      }
    }
    
    return weeklyData.slice(0, 5);
  };

  // Calculate monthly comparison data
  const getMonthlyComparisonData = () => {
    const currentMonth = currentDate.getMonth();
    const prevMonthPresent = Math.round(monthlyStats.present * 0.85);
    const prevMonthLeaves = Math.round(monthlyStats.leave * 0.9);
    const prevMonthOvertime = 42;
    const prevMonthLate = Math.round(monthlyStats.monthlyLate * 1.1);
    
    let currentValue, previousValue;
    
    switch (activeFilter) {
      case 'attendance':
        currentValue = monthlyStats.present;
        previousValue = prevMonthPresent;
        break;
      case 'leaves':
        currentValue = monthlyStats.leave;
        previousValue = prevMonthLeaves;
        break;
      case 'overtime':
        currentValue = 53;
        previousValue = prevMonthOvertime;
        break;
      case 'late':
        currentValue = monthlyStats.monthlyLate;
        previousValue = prevMonthLate;
        break;
      case 'stacked':
        // For stacked view, return current month data
        return [{
          name: 'Current',
          present: monthlyStats.present,
          leave: monthlyStats.leave,
          halfday: monthlyStats.halfday,
          absent: monthlyStats.absent,
          color: '#10b981'
        }];
      default:
        currentValue = monthlyStats.present;
        previousValue = prevMonthPresent;
    }
    
    return [
      {
        name: 'Previous',
        value: previousValue,
        color: '#9ca3af'
      },
      {
        name: 'Current',
        value: currentValue,
        color: activeFilter === 'attendance' ? '#10b981' : 
               activeFilter === 'leaves' ? '#f59e0b' :
               activeFilter === 'overtime' ? '#3b82f6' : '#ef4444'
      }
    ];
  };

  // Calculate quarterly data
  const getQuarterlyData = () => {
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const quarterMonths = [(quarter - 1) * 3, (quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2];
    const currentYear = currentDate.getFullYear();
    
    const quarterlyData = quarterMonths.map(month => {
      const monthData = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === month && recordDate.getFullYear() === currentYear;
      });
      
      let presentCount = 0;
      let leaveCount = 0;
      let halfdayCount = 0;
      let absentCount = 0;
      let overtimeHours = 0;
      let lateCount = 0;
      
      monthData.forEach(record => {
        if (record.status === 'present') presentCount++;
        if (record.status === 'leave') leaveCount++;
        if (record.status === 'halfday') halfdayCount++;
        if (record.status === 'absent') absentCount++;
        if (record.overtime && record.overtime !== '0.0') {
          overtimeHours += parseFloat(record.overtime);
        }
        if (record.late && record.late !== '-') lateCount++;
      });
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (activeFilter === 'stacked') {
        return {
          name: monthNames[month],
          present: presentCount,
          leave: leaveCount,
          halfday: halfdayCount,
          absent: absentCount,
          color: '#10b981'
        };
      } else {
        let value, color;
        switch (activeFilter) {
          case 'attendance':
            value = presentCount;
            color = '#10b981';
            break;
          case 'leaves':
            value = leaveCount;
            color = '#f59e0b';
            break;
          case 'overtime':
            value = Math.round(overtimeHours);
            color = '#3b82f6';
            break;
          case 'late':
            value = lateCount;
            color = '#ef4444';
            break;
          default:
            value = presentCount;
            color = '#10b981';
        }
        
        return {
          name: monthNames[month],
          value: value,
          color: color
        };
      }
    });
    
    return quarterlyData;
  };

  const getChartTitle = () => {
    const baseTitle = activeFilter === 'stacked' ? 'All Status' : 
                     activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
    
    switch (timeRange) {
      case 'weekly':
        return `Weekly ${baseTitle} Trend`;
      case 'monthly':
        return `Monthly ${baseTitle} Comparison`;
      case 'quarterly':
        return `Quarterly ${baseTitle} Overview`;
      case 'custom':
        return `Custom Range ${baseTitle} Analysis`;
      default:
        return `${baseTitle} Distribution`;
    }
  };

  const getStatsCards = () => {
    const weeklyData = getWeeklyData();
    const currentWeekValue = weeklyData[weeklyData.length - 1]?.value || 0;
    const previousWeekValue = weeklyData[weeklyData.length - 2]?.value || 0;
    const trend = currentWeekValue - previousWeekValue;
    const trendPercentage = previousWeekValue > 0 ? ((trend / previousWeekValue) * 100).toFixed(1) : 0;

    switch (activeFilter) {
      case 'attendance':
        return [
          { 
            label: 'Current Week', 
            value: `${currentWeekValue}`, 
            color: 'text-green-600', 
            bg: 'bg-green-50',
            trend: trend,
            trendText: `${trend >= 0 ? '+' : ''}${trendPercentage}% from last week`
          },
          { 
            label: 'Monthly Average', 
            value: `${monthlyStats.attendanceRate}%`, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Total Present', 
            value: monthlyStats.present, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { 
            label: 'Attendance Goal', 
            value: '95%', 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
          }
        ];
      case 'leaves':
        return [
          { 
            label: 'Current Week', 
            value: currentWeekValue, 
            color: 'text-orange-600', 
            bg: 'bg-orange-50',
            trend: trend,
            trendText: `${trend >= 0 ? '+' : ''}${trend} from last week`
          },
          { 
            label: 'Monthly Total', 
            value: monthlyStats.leave, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
          { 
            label: 'Sick Leaves', 
            value: Math.floor(monthlyStats.leave * 0.4), 
            color: 'text-red-600', 
            bg: 'bg-red-50' 
          },
          { 
            label: 'Casual Leaves', 
            value: Math.floor(monthlyStats.leave * 0.6), 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50' 
          }
        ];
      case 'overtime':
        return [
          { 
            label: 'Current Week', 
            value: `${currentWeekValue}h`, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            trend: trend,
            trendText: `${trend >= 0 ? '+' : ''}${trend}h from last week`
          },
          { 
            label: 'Monthly Total', 
            value: '53h', 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            label: 'Avg Daily OT', 
            value: '2.4h', 
            color: 'text-cyan-600', 
            bg: 'bg-cyan-50' 
          },
          { 
            label: 'OT Cost', 
            value: '$1,325', 
            color: 'text-violet-600', 
            bg: 'bg-violet-50' 
          }
        ];
      case 'late':
        return [
          { 
            label: 'Current Week', 
            value: currentWeekValue, 
            color: 'text-red-600', 
            bg: 'bg-red-50',
            trend: trend,
            trendText: `${trend >= 0 ? '+' : ''}${trend} from last week`
          },
          { 
            label: 'Monthly Total', 
            value: monthlyStats.monthlyLate, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50' 
          },
          { 
            label: 'On-time Rate', 
            value: '94.2%', 
            color: 'text-green-600', 
            bg: 'bg-green-50' 
          },
          { 
            label: 'Most Late Dept', 
            value: 'Sales', 
            color: 'text-orange-600', 
            bg: 'bg-orange-50' 
          }
        ];
      case 'stacked':
        return [
          { 
            label: 'Total Present', 
            value: monthlyStats.present, 
            color: 'text-green-600', 
            bg: 'bg-green-50'
          },
          { 
            label: 'Total Leaves', 
            value: monthlyStats.leave, 
            color: 'text-orange-600', 
            bg: 'bg-orange-50' 
          },
          { 
            label: 'Half Days', 
            value: monthlyStats.halfday, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Absent', 
            value: monthlyStats.absent, 
            color: 'text-red-600', 
            bg: 'bg-red-50' 
          }
        ];
      default:
        return [];
    }
  };

  const handleCustomRangeApply = () => {
    onCustomDateRangeChange(customRange);
    setShowCustomRange(false);
  };

  const chartData = getChartData();
  const isStacked = activeFilter === 'stacked';
  const statsCards = getStatsCards();

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monthly Overview</h2>
          <p className="text-gray-600">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Performance Analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Filter */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {timeRangeOptions.map(option => {
                const IconComponent = option.value === 'weekly' ? Calendar : 
                                    option.value === 'monthly' ? BarChart3 : 
                                    option.value === 'quarterly' ? Users : Filter;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onTimeRangeChange(option.value);
                      if (option.value === 'custom') {
                        setShowCustomRange(true);
                      }
                    }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
                      timeRange === option.value 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Data Type Filter */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {filterOptions.map(option => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onFilterChange(option.value)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition duration-300 ${
                    activeFilter === option.value 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomRange && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-900">Custom Date Range</h3>
            <button 
              onClick={() => setShowCustomRange(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">End Date</label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setShowCustomRange(false)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomRangeApply}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Column Chart */}
        <div className="lg:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <ColumnChartComponent 
            data={chartData}
            title={getChartTitle()}
            height={300}
            stacked={isStacked}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced Employee Detail View Component with Notes Editing
const EmployeeDetailView = ({ 
  employee, 
  onBack, 
  attendanceData, 
  holidays, 
  employeeLeaves, 
  onMarkAsExplained,
  onUpdateAttendanceNotes 
}) => {
  const [isEditingAttendance, setIsEditingAttendance] = useState(null);
  const [selectedDateBreaks, setSelectedDateBreaks] = useState([]);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [selectedBreakDate, setSelectedBreakDate] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Get employee's breaks for a specific date
  const getEmployeeBreaksForDate = (employeeId, date) => {
    const breakTypes = ['Cigarette', 'Pray', 'lunch', 'dinner', 'washroom', 'short'];
    const breakCount = Math.floor(Math.random() * 4) + 1;
    
    return Array.from({ length: breakCount }, (_, index) => {
      const breakType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
      const breakStartHour = 9 + Math.floor(Math.random() * 8);
      const breakStartMinute = Math.floor(Math.random() * 60);
      const breakDuration = [5, 10, 15, 30, 45, 60][Math.floor(Math.random() * 6)];
      
      const breakStart = `${breakStartHour.toString().padStart(2, '0')}:${breakStartMinute.toString().padStart(2, '0')}`;
      const breakEndHour = breakStartHour + Math.floor(breakDuration / 60);
      const breakEndMinute = (breakStartMinute + (breakDuration % 60)) % 60;
      const breakEnd = `${breakEndHour.toString().padStart(2, '0')}:${breakEndMinute.toString().padStart(2, '0')}`;
      
      return {
        id: `${employeeId}-${date}-break-${index}`,
        employeeId,
        date,
        type: breakType,
        breakStart,
        breakEnd,
        duration: breakDuration,
        notes: BREAK_TYPES[breakType].label
      };
    });
  };

  const handleViewBreaks = (date) => {
    const breaks = getEmployeeBreaksForDate(employee.id, date);
    setSelectedDateBreaks(breaks);
    setSelectedBreakDate(date);
    setIsBreakModalOpen(true);
  };

  const getEmployeeAttendance = (employeeId) => {
    return attendanceData.filter(att => att.employeeId === employeeId);
  };

  const getEmployeeStats = (employeeId) => {
    const empAttendance = getEmployeeAttendance(employeeId);
    const present = empAttendance.filter(a => a.status === 'present').length;
    const leave = empAttendance.filter(a => a.status === 'leave').length;
    const halfday = empAttendance.filter(a => a.status === 'halfday').length;
    const absent = empAttendance.filter(a => a.status === 'absent').length;
    const totalHours = empAttendance.reduce((sum, a) => sum + parseFloat(a.hours), 0);
    const totalOvertime = empAttendance.reduce((sum, a) => sum + parseFloat(a.overtime), 0);

    return {
      present,
      leave,
      halfday,
      absent,
      totalHours: totalHours.toFixed(1),
      totalOvertime: totalOvertime.toFixed(1),
      attendanceRate: empAttendance.length > 0 ? ((present / empAttendance.length) * 100).toFixed(1) : '0.0'
    };
  };

  const getUnexplainedAbsences = () => {
    return attendanceData
      .filter(att => 
        att.employeeId === employee.id && 
        att.status === 'absent' && 
        (!att.notes || att.notes === 'No notification' || att.notes.includes('No explanation'))
      )
      .slice(0, 5);
  };

  const handleSaveNotes = (recordId, notes) => {
    onUpdateAttendanceNotes(recordId, notes);
    setIsEditingAttendance(null);
    setEditingNotes('');
  };

  const handleEditNotes = (record) => {
    setIsEditingAttendance(record.id);
    setEditingNotes(record.notes || '');
  };

  const empAttendance = getEmployeeAttendance(employee.id);
  const empStats = getEmployeeStats(employee.id);
  const empLeaves = employeeLeaves.find(l => l.employeeId === employee.id);
  const unexplainedAbsences = getUnexplainedAbsences();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <BreakDetailsModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        breaks={selectedDateBreaks}
        date={selectedBreakDate}
        employeeName={employee.name}
      />

      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {employee.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-600">{employee.position} • {employee.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-[#349dff] text-white rounded-xl hover:bg-[#2980db] transition duration-300">
              <Send className="h-4 w-4 mr-2" />
              Send Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{empStats.present}</div>
            <div className="text-sm text-green-800">Present</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{empStats.leave}</div>
            <div className="text-sm text-orange-800">Leaves</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{empStats.halfday}</div>
            <div className="text-sm text-blue-800">Half Days</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{empStats.absent}</div>
            <div className="text-sm text-red-800">Absent</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{empStats.attendanceRate}%</div>
            <div className="text-sm text-purple-800">Attendance Rate</div>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">{empStats.totalOvertime}h</div>
            <div className="text-sm text-cyan-800">Overtime</div>
          </div>
        </div>

        {/* Uninformed Section */}
        {unexplainedAbsences.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900">Uninformed</h3>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {unexplainedAbsences.length} need explanation
              </span>
            </div>
            
            <div className="space-y-3">
              {unexplainedAbsences.map(absence => (
                <div key={absence.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(absence.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        No explanation provided
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onMarkAsExplained(employee.id, absence.date, 'Employee provided explanation later')}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition duration-200"
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Mark Explained
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Leaves Summary</h3>
          
          {/* Overall Leaves Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{employee.totalLeaves}</div>
                <div className="text-xs text-blue-700 font-medium mt-1">Total Leaves</div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{employee.leavesTaken}</div>
                <div className="text-xs text-orange-700 font-medium mt-1">Leaves Taken</div>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{employee.leavesRemaining}</div>
                <div className="text-xs text-green-700 font-medium mt-1">Leaves Remaining</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((employee.leavesTaken / employee.totalLeaves) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-purple-700 font-medium mt-1">Utilization</div>
              </div>
            </div>
          </div>

          {/* Detailed Leave Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Casual Leaves Block */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">Casual Leaves</h4>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-sm text-blue-100 mb-1">Total / Used</div>
                  <div className="text-3xl font-bold">{empLeaves?.casualLeavesTaken || 0}/{empLeaves?.casualLeaves || 8}</div>
                </div>
                
                
                
                
              </div>
            </div>

            {/* Sick Leaves Block */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">Sick Leaves</h4>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-sm text-red-100 mb-1">Total / Used</div>
                  <div className="text-3xl font-bold">{empLeaves?.sickLeavesTaken || 0}/{empLeaves?.sickLeaves || 8}</div>
                </div>
                
                
                
                
              </div>
            </div>

            {/* Annual Leaves Block */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">Annual Leaves</h4>
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="text-sm text-green-100 mb-1">Total / Used</div>
                  <div className="text-3xl font-bold">{empLeaves?.annualLeavesTaken || 0}/{empLeaves?.annualLeaves || 12}</div>
                </div>
                
                
                
                
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance</h3>
          <div className="grid grid-cols-7 gap-5 mb-8">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-s font-bold tracking-wide uppercase text-black py-2"
              >
                {day}
              </div>
            ))}
            
            {empAttendance.map((dayData) => {
              const isHoliday = holidays.some(h => h.date === dayData.date);
              const isUnexplained = dayData.status === 'absent' && (!dayData.notes || dayData.notes === 'No notification');
              const date = new Date(dayData.date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              // Calculate a simple status indicator for progress
              const statusPercent = isHoliday ? 0 : isUnexplained ? 20 : dayData.status === 'present' ? 100 : dayData.status === 'halfday' ? 50 : 0;
              
              return (
                <div
                  key={dayData.id}
                  className={`
                    group relative p-4 rounded-2xl cursor-pointer border transition-all duration-300 min-h-[110px]
                    bg-white/80 backdrop-blur-md shadow-sm
                    hover:shadow-lg hover:-translate-y-0.5
                    ${isWeekend ? 'border-gray-300 bg-gray-100/80' :
                      isHoliday ? 'border-purple-200 bg-purple-50/80' :
                      isUnexplained ? 'border-red-300 bg-red-50/80' :
                      'border-slate-200'}
                  `}
                  title={`${dayData.date}: ${isWeekend ? 'Off Day' : isHoliday ? 'Holiday' : isUnexplained ? 'Unexplained' : dayData.status} - ${dayData.notes || 'No notes'}`}
                >
                  {/* Accent gradient bar */}
                  <div className={`
                    absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl
                    ${isWeekend ? 'bg-gradient-to-r from-gray-400 to-gray-300' :
                      isHoliday ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                      isUnexplained ? 'bg-gradient-to-r from-red-500 to-red-400' :
                      dayData.status === 'present' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      dayData.status === 'leave' ? 'bg-gradient-to-r from-orange-500 to-amber-400' :
                      dayData.status === 'halfday' ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                      dayData.status === 'absent' ? 'bg-gradient-to-r from-red-500 to-rose-400' :
                      'bg-gradient-to-r from-gray-400 to-gray-300'}
                  `}></div>

                  <div className="flex flex-col h-full justify-between">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <span className={`
                        text-base font-semibold
                        ${isWeekend ? 'text-gray-500' :
                          isHoliday ? 'text-purple-600' :
                          isUnexplained ? 'text-red-600' :
                          dayData.status === 'present' ? 'text-emerald-600' :
                          dayData.status === 'leave' ? 'text-orange-600' :
                          dayData.status === 'halfday' ? 'text-blue-600' :
                          dayData.status === 'absent' ? 'text-red-600' :
                          'text-slate-800'}
                      `}>
                        {date.getDate()}
                      </span>

                      {new Date(dayData.date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium shadow">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Center Info */}
                    <div className="text-center mt-2">
                      {isWeekend ? (
                        <span className="text-xs font-medium text-gray-600 bg-gray-200/60 px-2 py-1 rounded-lg">
                          Off Day
                        </span>
                      ) : isHoliday ? (
                        <span className="text-xs font-medium text-purple-600">
                          Holiday
                        </span>
                      ) : isUnexplained ? (
                        <span className="text-xs font-medium text-red-600">
                          No Explanation
                        </span>
                      ) : (
                        <>
                          <div className="text-sm font-semibold text-slate-700 capitalize">
                            {dayData.status}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {dayData.notes ? dayData.notes.substring(0, 15) + '...' : 'No notes'}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {/* {!isHoliday && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isHoliday ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                              isUnexplained ? 'bg-gradient-to-r from-red-500 to-red-400' :
                              dayData.status === 'present' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                              dayData.status === 'leave' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                              dayData.status === 'halfday' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              dayData.status === 'absent' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                              'bg-gradient-to-r from-gray-400 to-gray-300'
                            }`}
                            style={{ width: `${statusPercent}%` }}
                          />
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Attendance Log</h3>
          </div>

          <div className="space-y-3">
            {empAttendance.slice(0, 10).map((record) => {
              const isUnexplained = record.status === 'absent' && (!record.notes || record.notes === 'No notification');
              const breaksForDay = getEmployeeBreaksForDate(employee.id, record.date);
              const totalBreakTime = breaksForDay.reduce((total, breakItem) => total + breakItem.duration, 0);
              
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      isUnexplained ? 'bg-red-500' :
                      record.status === 'present' ? 'bg-green-500' :
                      record.status === 'leave' ? 'bg-orange-500' :
                      record.status === 'halfday' ? 'bg-blue-500' :
                      record.status === 'absent' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      {isEditingAttendance === record.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            placeholder="Enter reason for leave, half-day, or absence..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                            rows="2"
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleSaveNotes(record.id, editingNotes)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setIsEditingAttendance(null)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">
                          {record.notes || 'No additional notes'}
                        </div>
                      )}
                      {breaksForDay.length > 0 && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Coffee className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {breaksForDay.length} breaks • {totalBreakTime} min total
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isEditingAttendance === record.id ? (
                      <div className="flex items-center space-x-2">
                        <select 
                          defaultValue={record.status}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="present">Present</option>
                          <option value="leave">Leave</option>
                          <option value="halfday">Half Day</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isUnexplained ? 'bg-red-100 text-red-800' :
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'leave' ? 'bg-orange-100 text-orange-800' :
                          record.status === 'halfday' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {isUnexplained ? 'Unexplained' : record.status}
                        </span>
                        
                        {/* View Breaks Button */}
                        {breaksForDay.length > 0 && (
                          <button
                            onClick={() => handleViewBreaks(record.date)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition duration-200"
                          >
                            <Coffee className="h-3 w-3 mr-1" />
                            View Breaks ({breaksForDay.length})
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleEditNotes(record)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition duration-300"
                          title="Edit Notes"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee List View Component
const EmployeeListView = ({ 
  employees, 
  setSelectedEmployee, 
  setEmployeeView, 
  attendanceData, 
  employeeLeaves,
  selectedEmployees,
  toggleEmployeeSelection,
  selectAllEmployees,
  onEditEmployee,
  onDeleteEmployee,
  searchTerm,
  onSearchChange,
  onAddEmployee
}) => {
  const getEmployeeStats = (employeeId) => {
    const empAttendance = attendanceData.filter(att => att.employeeId === employeeId);
    const present = empAttendance.filter(a => a.status === 'present').length;
    const leave = empAttendance.filter(a => a.status === 'leave').length;
    const halfday = empAttendance.filter(a => a.status === 'halfday').length;
    const absent = empAttendance.filter(a => a.status === 'absent').length;
    const totalHours = empAttendance.reduce((sum, a) => sum + parseFloat(a.hours), 0);
    const totalOvertime = empAttendance.reduce((sum, a) => sum + parseFloat(a.overtime), 0);

    return {
      present,
      leave,
      halfday,
      absent,
      totalHours: totalHours.toFixed(1),
      totalOvertime: totalOvertime.toFixed(1),
      attendanceRate: empAttendance.length > 0 ? ((present / empAttendance.length) * 100).toFixed(1) : '0.0'
    };
  };

  const allSelected = employees.length > 0 && selectedEmployees.length === employees.length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Employee Attendance</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={onAddEmployee}
            className="flex items-center px-4 py-2 bg-[#349dff] text-white rounded-xl hover:bg-[#2980db] transition duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-800">
              {selectedEmployees.length} employees selected
            </span>
            <select className="px-3 py-1 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">Bulk Actions</option>
              <option value="approve-leave">Approve Leave</option>
              <option value="export-data">Export Data</option>
              <option value="send-reminder">Send Reminder</option>
            </select>
            <button className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Apply
            </button>
          </div>
          <button
            onClick={() => selectedEmployees.length = []}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      )}
      
      <div className="space-y-4">
        {employees.map(employee => {
          const empStats = getEmployeeStats(employee.id);
          const empLeaves = employeeLeaves.find(l => l.employeeId === employee.id);
          const isSelected = selectedEmployees.includes(employee.id);
          
          return (
            <div 
              key={employee.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition duration-300 cursor-pointer ${
                isSelected 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-[#349dff] hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleEmployeeSelection(employee.id)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div 
                  className="flex items-center space-x-4 flex-1"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setEmployeeView('detail');
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                    {employee.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.department} • {employee.position}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{empStats.present}</div>
                    <div className="text-xs text-gray-600">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{empStats.leave}</div>
                    <div className="text-xs text-gray-600">Leaves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{empStats.absent}</div>
                    <div className="text-xs text-gray-600">Absent</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-blue-600">{employee.leavesRemaining}</div>
                    <div className="text-xs text-gray-600">Leaves Left</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-purple-600">{empStats.attendanceRate}%</div>
                    <div className="text-xs text-gray-600">Attendance</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployee(employee);
                      setEmployeeView('detail');
                    }}
                    className="p-2 text-gray-400 hover:text-[#349dff] transition duration-300"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEmployee(employee);
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 transition duration-300"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEmployee(employee.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Overview Tab Component with Notes Editing
const OverviewTab = ({ 
  currentDate, 
  setCurrentDate, 
  selectedDate, 
  setSelectedDate, 
  filters, 
  handleFilterChange, 
  handleDateRangeChange, 
  getFilteredAttendanceData, 
  getFilteredEmployees, 
  stats, 
  holidays,
  attendanceSearch,
  setAttendanceSearch,
  attendanceFilter,
  setAttendanceFilter,
  attendanceSort,
  setAttendanceSort,
  getFilteredAndSortedAttendance,
  editingAttendance,
  setEditingAttendance,
  employees,
  attendanceData,
  onMarkAsExplained,
  onSendReminder,
  onUpdateAttendanceNotes
}) => {
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }
    
    return days;
  };

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Production', label: 'Production' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'HR', label: 'HR' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Operations', label: 'Operations' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'leave', label: 'On Leave' },
    { value: 'halfday', label: 'Half Day' },
    { value: 'late', label: 'Late' }
  ];

  return (
    <div className="space-y-6">
      {/* Uninformed Tracking */}
      <UnexplainedAbsenceTracking
        attendanceData={attendanceData}
        employees={employees}
        selectedDate={selectedDate}
        onMarkAsExplained={onMarkAsExplained}
        onSendReminder={onSendReminder}
      />

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filters.timeRange === 'custom' && (
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">Showing:</span>
          <span>{getFilteredEmployees().length} employees</span>
          <span>{getFilteredAttendanceData().length} records</span>
          {filters.department !== 'all' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {filters.department}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              {filters.status}
            </span>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[30px] font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Calendar
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-300"
            >
              Today
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-300"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-5 mb-8">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-s font-bold tracking-wide uppercase text-black py-2"
            >
              {day}
            </div>
          ))}

          {getDaysInMonth().map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="h-[110px]"></div>;

            const dateStr = date.toISOString().split('T')[0];
            const dayAttendance = getFilteredAttendanceData().filter(att => att.date === dateStr);
            const presentCount = dayAttendance.filter(a => a.status === 'present').length;
            const totalCount = getFilteredEmployees().length;

            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            const percentage = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  group relative p-4 rounded-2xl cursor-pointer border transition-all duration-300
                  bg-white/80 backdrop-blur-md shadow-sm

                  hover:shadow-lg hover:-translate-y-0.5

                  ${isWeekend ? 'border-gray-300 bg-gray-100/80' :
                    isSelected 
                    ? 'border-blue-300 ring-1 ring-blue-200' 
                    : 'border-slate-200'}
                `}
              >
                {/* Accent gradient bar */}
                <div className={`
                  absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl
                  ${isWeekend 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-300'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'}
                `}></div>

                <div className="flex flex-col h-full justify-between">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <span className={`
                      text-base font-semibold
                      ${isWeekend ? 'text-gray-500' : 'text-slate-800'}
                    `}>
                      {date.getDate()}
                    </span>

                    {isToday && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-medium shadow">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Center Info */}
                  <div className="text-center mt-2">
                    {isWeekend ? (
                      <span className="text-xs font-medium text-gray-600 bg-gray-200/60 px-2 py-1 rounded-lg">
                        Off Day
                      </span>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-slate-700">
                          {presentCount} / {totalCount}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Present
                        </div>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!isWeekend && (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Details Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {getFilteredAttendanceData().filter(item => item.date === selectedDate).length} of {getFilteredEmployees().length} employees
            </span>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#349dff] focus:border-transparent text-sm w-48"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
            <div className="text-xs text-gray-600 font-medium">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-xs text-gray-600 font-medium">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.onLeave}</div>
            <div className="text-xs text-gray-600 font-medium">On Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.lateToday}</div>
            <div className="text-xs text-gray-600 font-medium">Late</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">On Leave</option>
              <option value="halfday">Half Day</option>
              <option value="unexplained">Uninformed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={attendanceSort}
              onChange={(e) => setAttendanceSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="department">Department</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {getFilteredAndSortedAttendance().map(employee => {
            const todayAttendance = getFilteredAttendanceData().filter(item => item.date === selectedDate);
            const attendance = todayAttendance.find(a => a.employeeId === employee.id);
            const status = attendance?.status || 'not-recorded';
            const isHoliday = holidays.some(h => h.date === selectedDate);
            const isUnexplained = status === 'absent' && (!attendance?.notes || attendance.notes === 'No notification');

            return (
              <div 
                key={employee.id} 
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                      {employee.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isUnexplained ? 'bg-red-500' :
                      status === 'present' ? 'bg-green-500' :
                      status === 'absent' ? 'bg-red-500' :
                      status === 'leave' ? 'bg-orange-500' :
                      status === 'halfday' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                      {isUnexplained && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center">
                          <UserX className="h-3 w-3 mr-1" />
                          Unexplained
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {employee.department}
                      </span>
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {employee.position}
                      </span>
                    </div>
                    {attendance?.notes && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {attendance.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                    isUnexplained ? 'bg-red-100 text-red-800 border border-red-200' :
                    isHoliday ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    status === 'present' ? 'bg-green-100 text-green-800 border border-green-200' :
                    status === 'leave' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                    status === 'halfday' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    status === 'absent' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {isUnexplained ? (
                      <>
                        <UserX className="h-3 w-3" />
                        <span>UNEXPLAINED</span>
                      </>
                    ) : isHoliday ? (
                      <>
                        <Calendar className="h-3 w-3" />
                        <span>HOLIDAY</span>
                      </>
                    ) : (
                      <>
                        {status === 'present' && <CheckCircle className="h-3 w-3" />}
                        {status === 'absent' && <XCircle className="h-3 w-3" />}
                        {status === 'leave' && <Calendar className="h-3 w-3" />}
                        {status === 'halfday' && <Clock className="h-3 w-3" />}
                        <span>{status.replace('-', ' ').toUpperCase()}</span>
                      </>
                    )}
                  </span>

                  {!isHoliday && attendance && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => {
                          const newNotes = prompt('Enter notes/reason:', attendance.notes || '');
                          if (newNotes !== null) {
                            onUpdateAttendanceNotes(attendance.id, newNotes);
                          }
                        }}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition duration-200"
                        title="Add/Edit Notes"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {attendance.notes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {getFilteredAndSortedAttendance().length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setAttendanceSearch('');
                setAttendanceFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Breaks Management Component
const BreaksManagement = ({ breaks, employees, onAddBreak, onDeleteBreak }) => {
  const [isAddBreakModalOpen, setIsAddBreakModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Breaks Management</h2>
        <button 
          onClick={() => setIsAddBreakModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#349dff] text-white rounded-xl hover:bg-[#2980db] transition duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Break
        </button>
      </div>
      
      <div className="space-y-4">
        {breaks.map(breakItem => {
          const employee = employees.find(emp => emp.id === breakItem.employeeId);
          const breakType = BREAK_TYPES[breakItem.type] || BREAK_TYPES.short;
          const IconComponent = breakType.icon;
          
          return (
            <div key={breakItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#349dff] transition duration-300">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${breakType.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{employee?.name || 'Employee'}</h4>
                  <p className="text-sm text-gray-600">
                    {breakItem.breakStart} - {breakItem.breakEnd || 'Ongoing'} • {breakItem.duration}min • {breakType.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${breakType.color}`}>
                  {breakItem.type}
                </span>
                <button 
                  onClick={() => onDeleteBreak(breakItem.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isAddBreakModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Break</h2>
              <button onClick={() => setIsAddBreakModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Break Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {Object.entries(BREAK_TYPES).map(([key, breakType]) => (
                    <option key={key} value={key}>{breakType.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setIsAddBreakModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAddBreak({
                      employeeId: employees[0]?.id,
                      type: 'lunch',
                      breakStart: '13:00',
                      breakEnd: '14:00',
                      duration: 60
                    });
                    setIsAddBreakModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#349dff] text-white rounded-lg hover:bg-[#2980db] transition duration-300"
                >
                  Add Break
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Holidays Management Component
const HolidaysManagement = ({ holidays, onAddHoliday, onDeleteHoliday }) => {
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Holidays Management</h2>
        <button 
          onClick={() => setIsAddHolidayModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#349dff] text-white rounded-xl hover:bg-[#2980db] transition duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </button>
      </div>
      
      <div className="space-y-4">
        {holidays.map(holiday => (
          <div key={holiday.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#349dff] transition duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(holiday.date).toLocaleDateString()} • {holiday.type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                holiday.type === 'public' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {holiday.type}
              </span>
              <button 
                onClick={() => onDeleteHoliday(holiday.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition duration-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddHolidayModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Holiday</h2>
              <button onClick={() => setIsAddHolidayModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                  placeholder="Enter holiday name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setIsAddHolidayModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAddHoliday({
                      name: 'New Holiday',
                      date: new Date().toISOString().split('T')[0],
                      type: 'public'
                    });
                    setIsAddHolidayModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-[#349dff] text-white rounded-lg hover:bg-[#2980db] transition duration-300"
                >
                  Add Holiday
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Leaves Summary Component
const LeavesSummary = ({ employees, employeeLeaves, onApproveLeave }) => {
  const handleApproveLeave = (employeeId) => {
    onApproveLeave(employeeId);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Employee Leaves Summary</h2>
      
      <div className="space-y-4">
        {employees.map(employee => {
          const leaves = employeeLeaves.find(l => l.employeeId === employee.id);
          return (
            <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#349dff] transition duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {employee.avatar}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{employee.name}</h4>
                  <p className="text-sm text-gray-600">{employee.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{employee.leavesRemaining}</div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{employee.leavesTaken}</div>
                  <div className="text-xs text-gray-600">Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{employee.totalLeaves}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {leaves && (
                  <>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-600">{leaves.casualLeaves}</div>
                      <div className="text-xs text-gray-600">Casual</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">{leaves.sickLeaves}</div>
                      <div className="text-xs text-gray-600">Sick</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-600">{leaves.annualLeaves}</div>
                      <div className="text-xs text-gray-600">Annual</div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => handleApproveLeave(employee.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
              >
                Approve Leave
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modal Components
const AddEmployeeModal = ({ isOpen, onClose, onAddEmployee, editingEmployee }) => {
  const [formData, setFormData] = useState(editingEmployee || {
    name: '',
    department: 'Production',
    position: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEmployee(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingEmployee ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              <option value="Production">Production</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#349dff] text-white rounded-lg hover:bg-[#2980db] transition duration-300"
            >
              {editingEmployee ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Notification Component
const NotificationContainer = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-500 text-red-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main HR Attendance Page Component
export function HrAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceRules, setAttendanceRules] = useState({});
  const [breaks, setBreaks] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeView, setEmployeeView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [isAddBreakModalOpen, setIsAddBreakModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [notifications, setNotifications] = useState([]);

  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [attendanceSort, setAttendanceSort] = useState('name');
  const [editingAttendance, setEditingAttendance] = useState(null);

  // Add monthly filter state
  const [monthlyFilter, setMonthlyFilter] = useState('stacked');
  const [timeRange, setTimeRange] = useState('weekly');

  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    timeRange: 'today',
    viewType: 'calendar',
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    }
  });

  // Enhanced stats calculation to include Uninformed
  const calculateStats = () => {
    const filteredData = getFilteredAttendanceData();
    const filteredEmployees = getFilteredEmployees();
    
    const today = new Date().toISOString().split('T')[0];
    const todayData = filteredData.filter(item => item.date === today);
    
    const presentCount = todayData.filter(item => item.status === 'present').length;
    const leaveCount = todayData.filter(item => item.status === 'leave').length;
    const halfdayCount = todayData.filter(item => item.status === 'halfday').length;
    const absentCount = todayData.filter(item => item.status === 'absent').length;
    const lateCount = todayData.filter(item => item.late !== '-').length;
    
    // Calculate Uninformed
    const unexplainedAbsences = todayData.filter(item => 
      item.status === 'absent' && (!item.notes || item.notes === 'No notification' || item.notes.includes('No explanation'))
    ).length;

    const totalBreaks = breaks.length;
    const totalHolidays = holidays.length;
    const totalLeavesTaken = employeeLeaves.reduce((sum, leave) => sum + leave.totalTaken, 0);

    const monthlyData = filteredData.filter(item => 
      new Date(item.date).getMonth() === currentDate.getMonth() &&
      new Date(item.date).getFullYear() === currentDate.getFullYear()
    );

    const monthlyPresent = monthlyData.filter(item => item.status === 'present').length;
    const monthlyLeave = monthlyData.filter(item => item.status === 'leave').length;
    const monthlyHalfday = monthlyData.filter(item => item.status === 'halfday').length;
    const monthlyAbsent = monthlyData.filter(item => item.status === 'absent').length;
    const monthlyLate = monthlyData.filter(item => item.late !== '-').length;

    return {
      presentToday: presentCount,
      onLeave: leaveCount,
      halfDays: halfdayCount,
      absent: absentCount,
      lateToday: lateCount,
      unexplainedAbsences: unexplainedAbsences,
      totalEmployees: filteredEmployees.length,
      activeEmployees: filteredEmployees.filter(emp => emp.status === 'active').length,
      totalBreaks: totalBreaks,
      totalHolidays: totalHolidays,
      totalLeavesTaken: totalLeavesTaken,
      monthlyPresent,
      monthlyLeave,
      monthlyHalfday,
      monthlyAbsent,
      monthlyLate,
      monthlyAttendanceRate: filteredEmployees.length > 0 ? 
        ((monthlyPresent / monthlyData.length) * 100).toFixed(1) : '0.0'
    };
  };

  const getFilteredAndSortedAttendance = () => {
    const filteredEmployees = getFilteredEmployees();
    const todayAttendanceData = getFilteredAttendanceData().filter(item => item.date === selectedDate);
    
    let filtered = filteredEmployees;
    
    if (attendanceSearch) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(attendanceSearch.toLowerCase())
      );
    }
    
    if (attendanceFilter !== 'all') {
      filtered = filtered.filter(emp => {
        const attendance = todayAttendanceData.find(a => a.employeeId === emp.id);
        const status = attendance?.status || 'not-recorded';
        
        if (attendanceFilter === 'late') {
          return attendance?.checkIn !== '-' && attendance?.checkIn > '9:15 AM';
        }
        if (attendanceFilter === 'not-recorded') {
          return !attendance;
        }
        if (attendanceFilter === 'unexplained') {
          return status === 'absent' && (!attendance?.notes || attendance.notes === 'No notification');
        }
        return status === attendanceFilter;
      });
    }
    
    filtered.sort((a, b) => {
      const attendanceA = todayAttendanceData.find(att => att.employeeId === a.id);
      const attendanceB = todayAttendanceData.find(att => att.employeeId === b.id);
      
      switch (attendanceSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'department':
          return a.department.localeCompare(b.department);
        case 'checkIn':
          return (attendanceA?.checkIn || '').localeCompare(attendanceB?.checkIn || '');
        case 'status':
          return (attendanceA?.status || 'not-recorded').localeCompare(attendanceB?.status || 'not-recorded');
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Add functions for handling Uninformed
  const handleMarkAsExplained = (employeeId, date, explanation) => {
    setAttendanceData(prev => prev.map(att => 
      att.employeeId === employeeId && att.date === date 
        ? { ...att, notes: explanation }
        : att
    ));
    addNotification('Absence marked as explained', 'success');
  };

  const handleSendReminder = (employeeId, employeeName) => {
    // In a real app, this would send an email or notification
    console.log(`Sending reminder to ${employeeName} (ID: ${employeeId})`);
    addNotification(`Reminder sent to ${employeeName}`, 'info');
  };

  // Updated handleManualAttendance function (simplified without check-in/check-out)
  const handleManualAttendance = (employeeId, date, status, notes = '') => {
    const existingRecord = attendanceData.find(att => 
      att.employeeId === employeeId && att.date === date
    );

    if (existingRecord) {
      setAttendanceData(prev => prev.map(att => 
        att.id === existingRecord.id ? {
          ...att,
          status,
          notes: notes || att.notes
        } : att
      ));
    } else {
      const newAttendance = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        status,
        checkIn: '-',
        checkOut: '-',
        hours: '0.0',
        breaks: 0,
        breakDuration: 0,
        late: '-',
        overtime: '0.0',
        notes: notes
      };
      setAttendanceData(prev => [...prev, newAttendance]);
    }
    addNotification('Attendance updated successfully', 'success');
  };

  // Add function to handle notes updates
  const handleUpdateAttendanceNotes = (attendanceId, notes) => {
    setAttendanceData(prev => prev.map(att => 
      att.id === attendanceId ? { ...att, notes } : att
    ));
    addNotification('Notes updated successfully', 'success');
  };

  // Enhanced sample breaks generation
  const generateSampleBreaks = () => {
    const breaks = [];
    const breakTypes = ['Cigarette', 'Pray', 'lunch', 'dinner', 'washroom', 'short'];
    
    employees.forEach(employee => {
      for (let i = 1; i <= 30; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Skip weekends for more realistic data
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        const breakCount = Math.floor(Math.random() * 3) + 1; // 1-3 breaks per day
        
        for (let j = 0; j < breakCount; j++) {
          const breakType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
          const breakStartHour = 9 + Math.floor(Math.random() * 8); // Between 9 AM and 5 PM
          const breakStartMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
          const breakDuration = [5, 10, 15, 30, 45, 60][Math.floor(Math.random() * 6)];
          
          const breakStart = `${breakStartHour.toString().padStart(2, '0')}:${breakStartMinute.toString().padStart(2, '0')}`;
          const breakEndHour = breakStartHour + Math.floor((breakStartMinute + breakDuration) / 60);
          const breakEndMinute = (breakStartMinute + breakDuration) % 60;
          const breakEnd = `${breakEndHour.toString().padStart(2, '0')}:${breakEndMinute.toString().padStart(2, '0')}`;
          
          breaks.push({
            id: `${employee.id}-${dateStr}-break-${j}`,
            employeeId: employee.id,
            date: dateStr,
            type: breakType,
            breakStart,
            breakEnd,
            duration: breakDuration,
            notes: BREAK_TYPES[breakType].label
          });
        }
      }
    });
    
    return breaks;
  };

  useEffect(() => {
    const sampleEmployees = [
      { 
        id: 1, 
        name: 'Muhammad Hamza', 
        department: 'Production', 
        position: 'Developer', 
        email: 'hamza@company.com', 
        status: 'active', 
        joinDate: '2023-01-15', 
        avatar: 'MH',
        totalLeaves: 20,
        leavesTaken: 8,
        leavesRemaining: 12,
        phone: '+1-555-0101'
      },
      { 
        id: 2, 
        name: 'Mike Chen', 
        department: 'Marketing', 
        position: 'Marketing Manager', 
        email: 'mike@company.com', 
        status: 'active', 
        joinDate: '2023-03-20', 
        avatar: 'MC',
        totalLeaves: 20,
        leavesTaken: 12,
        leavesRemaining: 8,
        phone: '+1-555-0102'
      },
      { 
        id: 3, 
        name: 'Emma Davis', 
        department: 'HR', 
        position: 'Junior HR', 
        email: 'emma@company.com', 
        status: 'active', 
        joinDate: '2023-02-10', 
        avatar: 'ED',
        totalLeaves: 20,
        leavesTaken: 5,
        leavesRemaining: 15,
        phone: '+1-555-0103'
      },
      { 
        id: 4, 
        name: 'Alex Kim', 
        department: 'Sales', 
        position: 'Sales Executive', 
        email: 'alex@company.com', 
        status: 'active', 
        joinDate: '2023-04-05', 
        avatar: 'AK',
        totalLeaves: 20,
        leavesTaken: 15,
        leavesRemaining: 5,
        phone: '+1-555-0104'
      },
      { 
        id: 5, 
        name: 'David Wilson', 
        department: 'Production', 
        position: 'Frontend Developer', 
        email: 'david@company.com', 
        status: 'active', 
        joinDate: '2023-05-15', 
        avatar: 'DW',
        totalLeaves: 20,
        leavesTaken: 3,
        leavesRemaining: 17,
        phone: '+1-555-0105'
      },
      { 
        id: 6, 
        name: 'Lisa Brown', 
        department: 'Operations', 
        position: 'Operations Manager', 
        email: 'lisa@company.com', 
        status: 'active', 
        joinDate: '2023-06-20', 
        avatar: 'LB',
        totalLeaves: 20,
        leavesTaken: 10,
        leavesRemaining: 10,
        phone: '+1-555-0106'
      }
    ];

    const sampleRules = {
      workHours: { start: '09:00', end: '18:00' },
      breakDuration: 60,
      lunchBreak: { start: '13:00', end: '14:00' },
      gracePeriod: 15,
      overtimeRate: 1.5,
      autoDeduction: true
    };

    const sampleHolidays = [
      { id: 1, name: 'Annual Dinner', date: '2025-01-01', type: 'public' },
      { id: 2, name: 'Company Holiday', date: '2025-01-2', type: 'company' },
      { id: 3, name: 'Christmas Day', date: '2025-12-25', type: 'public' },
      { id: 4, name: 'Qauid Brithday Party', date: '2025-12-25', type: 'public' }
    ];

    const sampleEmployeeLeaves = [
      { employeeId: 1, casualLeaves: 3, sickLeaves: 2, annualLeaves: 3, totalTaken: 8 },
      { employeeId: 2, casualLeaves: 5, sickLeaves: 4, annualLeaves: 3, totalTaken: 12 },
      { employeeId: 3, casualLeaves: 2, sickLeaves: 1, annualLeaves: 2, totalTaken: 5 },
      { employeeId: 4, casualLeaves: 8, sickLeaves: 4, annualLeaves: 3, totalTaken: 15 },
      { employeeId: 5, casualLeaves: 1, sickLeaves: 1, annualLeaves: 1, totalTaken: 3 },
      { employeeId: 6, casualLeaves: 4, sickLeaves: 3, annualLeaves: 3, totalTaken: 10 }
    ];

    const sampleAttendance = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = sampleHolidays.some(h => h.date === date.toISOString().split('T')[0]);
      
      sampleEmployees.forEach(employee => {
        let status, notes;
        
        if (isHoliday) {
          status = 'off';
          notes = 'Holiday';
        } else if (isWeekend) {
          status = Math.random() > 0.8 ? 'present' : 'off';
          notes = status === 'present' ? 'Weekend work' : 'Weekend';
        } else {
          const statuses = ['present', 'present', 'present', 'leave', 'halfday', 'absent'];
          const weights = [0.65, 0.1, 0.1, 0.05, 0.05, 0.05];
          
          let random = Math.random();
          let statusIndex = 0;
          
          for (let j = 0; j < weights.length; j++) {
            random -= weights[j];
            if (random <= 0) {
              statusIndex = j;
              break;
            }
          }

          status = statuses[statusIndex];
          
          if (status === 'present') {
            notes = '';
          } else if (status === 'halfday') {
            notes = 'Medical appointment';
          } else if (status === 'leave') {
            notes = 'Annual leave';
          } else {
            // Randomly set some absences as unexplained
            notes = Math.random() > 0.7 ? 'No explanation provided' : 'Sick leave';
          }
        }
        
        sampleAttendance.push({
          id: `${employee.id}-${i}`,
          employeeId: employee.id,
          date: date.toISOString().split('T')[0],
          day: i,
          status: status,
          checkIn: '-',
          checkOut: '-',
          hours: '0.0',
          breaks: 0,
          breakDuration: 0,
          late: '-',
          overtime: '0.0',
          notes: notes
        });
      });
    }

    setEmployees(sampleEmployees);
    setAttendanceRules(sampleRules);
    setHolidays(sampleHolidays);
    setEmployeeLeaves(sampleEmployeeLeaves);
    setAttendanceData(sampleAttendance);
    
    // Generate breaks after employees are set
    const sampleBreaks = generateSampleBreaks();
    setBreaks(sampleBreaks);
  }, [currentDate]);

  const handleAddEmployee = (employeeData) => {
    const newEmployee = {
      id: Math.max(...employees.map(e => e.id)) + 1,
      ...employeeData,
      status: 'active',
      avatar: employeeData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      totalLeaves: 20,
      leavesTaken: 0,
      leavesRemaining: 20,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setEmployees(prev => [...prev, newEmployee]);
    setIsAddEmployeeModalOpen(false);
    addNotification('Employee added successfully', 'success');
  };

  const handleEditEmployee = (employeeData) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === editingEmployee.id ? { ...emp, ...employeeData } : emp
    ));
    setEditingEmployee(null);
    setIsAddEmployeeModalOpen(false);
    addNotification('Employee updated successfully', 'success');
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setAttendanceData(prev => prev.filter(att => att.employeeId !== employeeId));
      addNotification('Employee deleted successfully', 'success');
    }
  };

  const handleAddHoliday = (holidayData) => {
    const newHoliday = {
      id: Math.max(...holidays.map(h => h.id)) + 1,
      ...holidayData
    };
    setHolidays(prev => [...prev, newHoliday]);
    setIsAddHolidayModalOpen(false);
    addNotification('Holiday added successfully', 'success');
  };

  const handleDeleteHoliday = (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      setHolidays(prev => prev.filter(h => h.id !== holidayId));
      addNotification('Holiday deleted successfully', 'success');
    }
  };

  const handleAddBreak = (breakData) => {
    const newBreak = {
      id: Math.max(...breaks.map(b => b.id)) + 1,
      ...breakData,
      duration: 60
    };
    setBreaks(prev => [...prev, newBreak]);
    setIsAddBreakModalOpen(false);
    addNotification('Break added successfully', 'success');
  };

  const handleDeleteBreak = (breakId) => {
    if (window.confirm('Are you sure you want to delete this break?')) {
      setBreaks(prev => prev.filter(b => b.id !== breakId));
      addNotification('Break deleted successfully', 'success');
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedEmployees.length === 0) return;

    switch (bulkAction) {
      case 'approve-leave':
        selectedEmployees.forEach(empId => {
          setEmployeeLeaves(prev => prev.map(leave => 
            leave.employeeId === empId 
              ? { ...leave, totalTaken: leave.totalTaken + 1 }
              : leave
          ));
        });
        addNotification(`Leave approved for ${selectedEmployees.length} employees`, 'success');
        break;
      
      case 'export-data':
        handleBulkExport(selectedEmployees);
        break;
      
      case 'send-reminder':
        handleBulkReminder(selectedEmployees);
        break;
      
      default:
        break;
    }
    
    setSelectedEmployees([]);
    setBulkAction('');
  };

  const handleBulkExport = (employeeIds) => {
    const dataToExport = attendanceData.filter(att => 
      employeeIds.includes(att.employeeId)
    );
    console.log('Exporting data:', dataToExport);
    addNotification(`Data exported for ${employeeIds.length} employees`, 'success');
  };

  const handleBulkReminder = (employeeIds) => {
    console.log('Sending reminders to:', employeeIds);
    addNotification(`Reminders sent to ${employeeIds.length} employees`, 'success');
  };

  const handleApproveLeave = (employeeId) => {
    setEmployeeLeaves(prev => prev.map(leave => 
      leave.employeeId === employeeId 
        ? { ...leave, totalTaken: leave.totalTaken + 1 }
        : leave
    ));
    addNotification('Leave approved successfully', 'success');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getFilteredEmployeesWithSearch = () => {
    let filtered = getFilteredEmployees();
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAllEmployees = () => {
    const currentEmployees = getFilteredEmployeesWithSearch();
    if (selectedEmployees.length === currentEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(currentEmployees.map(emp => emp.id));
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDateRangeChange = (rangeType, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [rangeType]: value
      }
    }));
  };

  const getFilteredAttendanceData = () => {
    let filteredData = [...attendanceData];
    
    if (filters.department !== 'all') {
      const departmentEmployees = employees
        .filter(emp => emp.department === filters.department)
        .map(emp => emp.id);
      filteredData = filteredData.filter(att => 
        departmentEmployees.includes(att.employeeId)
      );
    }
    
    if (filters.status !== 'all') {
      if (filters.status === 'late') {
        filteredData = filteredData.filter(att => att.late !== '-');
      } else {
        filteredData = filteredData.filter(att => att.status === filters.status);
      }
    }
    
    const now = new Date();
    switch (filters.timeRange) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        filteredData = filteredData.filter(att => att.date === today);
        break;
      case 'yesterday':
        const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
        filteredData = filteredData.filter(att => att.date === yesterday);
        break;
      case 'this_week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        filteredData = filteredData.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= startOfWeek && attDate <= endOfWeek;
        });
        break;
      case 'last_week':
        const startOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        const endOfLastWeek = new Date(now.setDate(now.getDate() - now.getDay() - 1));
        filteredData = filteredData.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= startOfLastWeek && attDate <= endOfLastWeek;
        });
        break;
      case 'this_month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filteredData = filteredData.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= startOfMonth && attDate <= endOfMonth;
        });
        break;
      case 'last_month':
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        filteredData = filteredData.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= startOfLastMonth && attDate <= endOfLastMonth;
        });
        break;
      case 'custom':
        filteredData = filteredData.filter(att => {
          const attDate = new Date(att.date);
          return attDate >= new Date(filters.dateRange.start) && 
                 attDate <= new Date(filters.dateRange.end);
        });
        break;
    }
    
    return filteredData;
  };

  const getFilteredEmployees = () => {
    if (filters.department === 'all') return employees;
    return employees.filter(emp => emp.department === filters.department);
  };

  const stats = calculateStats();

  const monthlyStats = {
    present: stats.monthlyPresent,
    absent: stats.monthlyAbsent,
    leave: stats.monthlyLeave,
    halfday: stats.monthlyHalfday,
    attendanceRate: stats.monthlyAttendanceRate,
    workingDays: 22,
    totalEmployees: stats.totalEmployees,
    monthlyLate: stats.monthlyLate
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 relative overflow-hidden">
      {/* Top Navigation Menu */}
      <TopNavMenu activeItem="HR" setActiveItem={() => {}} isSidebarCollapsed={false} />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employeeView === 'detail' && selectedEmployee 
                  ? `${selectedEmployee.name}'s Attendance` 
                  : 'HR Attendance Management'
                }
              </h1>
              <p className="text-gray-600">
                {employeeView === 'detail' && selectedEmployee 
                  ? `Comprehensive attendance records and performance metrics` 
                  : 'Track attendance, breaks, holidays, and employee leaves'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {new Date().toLocaleTimeString()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {employeeView === 'list' && (
          <>
            <div className="flex space-x-1 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mb-8">
              {['overview', 'employees'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 ${
                    activeTab === tab
                      ? 'bg-[#349dff] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Present Today</h3>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.presentToday}</div>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}% attendance
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">On Leave</h3>
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.onLeave}</div>
                <p className="text-sm text-orange-600 mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {stats.totalLeavesTaken} total this month
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Monthly Rate</h3>
                  <PieChart className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.monthlyAttendanceRate}%</div>
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Overall attendance
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Late Today</h3>
                  <Clock className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.lateToday}</div>
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Late arrivals
                </p>
              </div>

              {/* New Uninformed card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">Uninformed</h3>
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.unexplainedAbsences}</div>
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Need follow-up
                </p>
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {/* Enhanced Monthly Overview with Chart.js */}
                <MonthlyOverview 
                  currentDate={currentDate}
                  monthlyStats={monthlyStats}
                  attendanceData={attendanceData}
                  employees={employees}
                  onFilterChange={setMonthlyFilter}
                  activeFilter={monthlyFilter}
                  timeRange={timeRange}
                  onTimeRangeChange={setTimeRange}
                  filters={filters}
                  onCustomDateRangeChange={(range) => {
                    handleDateRangeChange('start', range.start);
                    handleDateRangeChange('end', range.end);
                    setTimeRange('custom');
                  }}
                />

                <OverviewTab 
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  filters={filters}
                  handleFilterChange={handleFilterChange}
                  handleDateRangeChange={handleDateRangeChange}
                  getFilteredAttendanceData={getFilteredAttendanceData}
                  getFilteredEmployees={getFilteredEmployees}
                  stats={stats}
                  holidays={holidays}
                  attendanceSearch={attendanceSearch}
                  setAttendanceSearch={setAttendanceSearch}
                  attendanceFilter={attendanceFilter}
                  setAttendanceFilter={setAttendanceFilter}
                  attendanceSort={attendanceSort}
                  setAttendanceSort={setAttendanceSort}
                  getFilteredAndSortedAttendance={getFilteredAndSortedAttendance}
                  editingAttendance={editingAttendance}
                  setEditingAttendance={setEditingAttendance}
                  employees={employees}
                  attendanceData={attendanceData}
                  onMarkAsExplained={handleMarkAsExplained}
                  onSendReminder={handleSendReminder}
                  onUpdateAttendanceNotes={handleUpdateAttendanceNotes}
                />
              </>
            )}
            {activeTab === 'employees' && (
              <EmployeeListView 
                employees={getFilteredEmployeesWithSearch()}
                setSelectedEmployee={setSelectedEmployee}
                setEmployeeView={setEmployeeView}
                attendanceData={attendanceData}
                employeeLeaves={employeeLeaves}
                selectedEmployees={selectedEmployees}
                toggleEmployeeSelection={toggleEmployeeSelection}
                selectAllEmployees={selectAllEmployees}
                onEditEmployee={(employee) => {
                  setEditingEmployee(employee);
                  setIsAddEmployeeModalOpen(true);
                }}
                onDeleteEmployee={handleDeleteEmployee}
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                onAddEmployee={() => {
                  setEditingEmployee(null);
                  setIsAddEmployeeModalOpen(true);
                }}
              />
            )}
            {activeTab === 'breaks' && (
              <BreaksManagement 
                breaks={breaks} 
                employees={employees}
                onAddBreak={handleAddBreak}
                onDeleteBreak={handleDeleteBreak}
              />
            )}
          </>
        )}

        {employeeView === 'detail' && selectedEmployee && (
          <EmployeeDetailView 
            employee={selectedEmployee} 
            onBack={() => setEmployeeView('list')}
            attendanceData={attendanceData}
            holidays={holidays}
            employeeLeaves={employeeLeaves}
            onMarkAsExplained={handleMarkAsExplained}
            onUpdateAttendanceNotes={handleUpdateAttendanceNotes}
          />
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onAddEmployee={editingEmployee ? handleEditEmployee : handleAddEmployee}
        editingEmployee={editingEmployee}
      />

      <NotificationContainer notifications={notifications} />

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default HrAttendancePage;