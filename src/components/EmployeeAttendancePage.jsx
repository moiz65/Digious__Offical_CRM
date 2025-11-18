import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  TrendingUp, 
  LogIn, 
  LogOut, 
  Coffee,
  UserCheck,
  Fingerprint,
  Calculator,
  AlertTriangle,
  Scale,
  Check,
  X,
  Clock4,
  Cigarette,
  ToiletIcon,
  Calendar1,
  Utensils
} from 'lucide-react';

// Custom hook for attendance management
export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [systemAttendance, setSystemAttendance] = useState({
    checkedIn: false,
    checkInTime: null,
    checkOutTime: null,
    totalWorkingTime: 0,
    isOnBreak: false,
    lastUpdate: new Date(),
    status: 'pending'
  });

  const handleSystemCheckIn = () => {
    const now = new Date();
    const expectedStart = new Date();
    expectedStart.setHours(9, 15, 0, 0);
    
    const isLate = now > expectedStart;
    
    setSystemAttendance({
      checkedIn: true,
      checkInTime: now,
      checkOutTime: null,
      totalWorkingTime: 0,
      isOnBreak: false,
      lastUpdate: now,
      status: isLate ? 'late' : 'present'
    });

    // Add to attendance data
    const today = now.toISOString().split('T')[0];
    setAttendanceData(prev => {
      const existingIndex = prev.findIndex(day => day.date === today);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: isLate ? 'late' : 'present',
          checkIn: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          remarks: isLate ? 'Late arrival' : 'On time'
        };
        return updated;
      } else {
        return [...prev, {
          date: today,
          day: now.getDate(),
          status: isLate ? 'late' : 'present',
          checkIn: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          checkOut: '-',
          hours: '0.0',
          remarks: isLate ? 'Late arrival' : 'On time'
        }];
      }
    });

    return {
      timeString: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      isLate: isLate
    };
  };

  const handleSystemCheckOut = () => {
    const now = new Date();
    const hours = systemAttendance.totalWorkingTime / 60;
    
    setSystemAttendance(prev => ({
      ...prev,
      checkedIn: false,
      checkOutTime: now,
      lastUpdate: now
    }));

    // Update attendance data
    const today = now.toISOString().split('T')[0];
    setAttendanceData(prev => {
      const existingIndex = prev.findIndex(day => day.date === today);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          checkOut: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          hours: hours.toFixed(1),
          remarks: hours >= 9 ? 'Full day' : 'Short day'
        };
        return updated;
      }
      return prev;
    });

    return {
      timeString: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      hours: hours.toFixed(1)
    };
  };

  const updateWorkingTime = () => {
    if (systemAttendance.checkedIn && !systemAttendance.isOnBreak) {
      const now = new Date();
      const diff = (now - systemAttendance.lastUpdate) / (1000 * 60);
      
      setSystemAttendance(prev => ({
        ...prev,
        totalWorkingTime: prev.totalWorkingTime + diff,
        lastUpdate: now
      }));

      // Update hours in attendance data
      const today = now.toISOString().split('T')[0];
      const hours = (systemAttendance.totalWorkingTime + diff) / 60;
      
      setAttendanceData(prev => {
        const existingIndex = prev.findIndex(day => day.date === today);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            hours: hours.toFixed(1)
          };
          return updated;
        }
        return prev;
      });
    }
  };

  const setBreakStatus = (isOnBreak) => {
    setSystemAttendance(prev => ({
      ...prev,
      isOnBreak: isOnBreak,
      lastUpdate: new Date()
    }));
  };

  const getTodayStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = attendanceData.find(day => day.date === today);
    
    if (todayData) {
      return todayData;
    }

    return {
      date: today,
      day: new Date().getDate(),
      status: 'pending',
      checkIn: systemAttendance.checkInTime ? 
        systemAttendance.checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }) : '-',
      checkOut: systemAttendance.checkOutTime ? 
        systemAttendance.checkOutTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }) : '-',
      hours: (systemAttendance.totalWorkingTime / 60).toFixed(1),
      remarks: systemAttendance.checkedIn ? 'Currently working' : 'Not checked in yet'
    };
  };

  const getAttendanceStats = () => {
    const present = attendanceData.filter(day => 
      day.status === 'present' || day.status === 'late'
    ).length;
    const absent = attendanceData.filter(day => day.status === 'absent').length;
    const late = attendanceData.filter(day => day.status === 'late').length;
    const workingDays = attendanceData.filter(day => 
      day.status !== 'off' && day.status !== 'pending'
    ).length;
    
    const attendancePercentage = workingDays > 0 ? 
      Math.round((present / workingDays) * 100) : 0;

    return {
      present,
      absent,
      late,
      workingDays,
      attendancePercentage
    };
  };

  return {
    attendanceData,
    systemAttendance,
    handleSystemCheckIn,
    handleSystemCheckOut,
    updateWorkingTime,
    setBreakStatus,
    setAttendanceData,
    getTodayStatus,
    getAttendanceStats
  };
};

export function EmployeeAttendancePage() {
  const {
    attendanceData,
    systemAttendance,
    handleSystemCheckIn,
    handleSystemCheckOut,
    updateWorkingTime,
    setBreakStatus,
    setAttendanceData,
    getTodayStatus,
    getAttendanceStats
  } = useAttendance();

  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Enhanced Break Data with overtime tracking
  const [breakData, setBreakData] = useState({
    smoke: { 
      active: false, 
      startTime: null,
      totalDuration: 0, 
      exceededDuration: 0,
      breakLimit: 2
    },
    dinner: { 
      active: false, 
      startTime: null,
      totalDuration: 0, 
      exceededDuration: 0,
      breakLimit: 60
    },
    washroom: { 
      active: false, 
      startTime: null,
      totalDuration: 0, 
      exceededDuration: 0,
      breakLimit: 10
    },
    pray: { 
      active: false, 
      startTime: null,
      totalDuration: 0, 
      exceededDuration: 0,
      breakLimit: 10
    }
  });

  // Overtime debt tracking
  const [overtimeDebt, setOvertimeDebt] = useState({
    totalDebt: 0,
    breakOvertime: 0,
    lateOvertime: 0,
    workedOvertime: 0,
    netDebt: 0,
    history: []
  });

  // Break types
  const breakTypes = [
    { 
      id: 'smoke', 
      name: 'Smoke', 
      icon: Cigarette, 
      color: 'bg-orange-500',
      limit: 2
    },
    { 
      id: 'dinner', 
      name: 'Dinner', 
      icon: Utensils,
      color: 'bg-purple-500',
      limit: 60
    },
    { 
      id: 'washroom', 
      name: 'Washroom', 
      icon: ToiletIcon, 
      color: 'bg-blue-500',
      limit: 10
    },
    { 
      id: 'pray', 
      name: 'Prayer', 
      icon: Calendar1, 
      color: 'bg-green-500',
      limit: 10
    }
  ];

  // Initialize sample attendance data
  useEffect(() => {
    const generateSampleData = () => {
      const sampleData = [];
      const today = new Date();
      
      // Generate last 30 days of sample data
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Skip weekends for sample data
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          sampleData.push({
            date: dateString,
            day: date.getDate(),
            status: 'off',
            checkIn: '-',
            checkOut: '-',
            hours: '0.0',
            remarks: 'Weekend'
          });
          continue;
        }
        
        // For today, use actual data
        if (i === 0) {
          const todayStatus = getTodayStatus();
          sampleData.push(todayStatus);
          continue;
        }
        
        // Generate random attendance for past days
        const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        let checkIn, checkOut, hours, remarks;
        
        switch (randomStatus) {
          case 'present':
            checkIn = '09:00 AM';
            checkOut = '06:00 PM';
            hours = '9.0';
            remarks = 'On time';
            break;
          case 'late':
            checkIn = '09:30 AM';
            checkOut = '06:00 PM';
            hours = '8.5';
            remarks = 'Late arrival';
            break;
          case 'absent':
            checkIn = '-';
            checkOut = '-';
            hours = '0.0';
            remarks = 'Absent';
            break;
          default:
            checkIn = '-';
            checkOut = '-';
            hours = '0.0';
            remarks = 'Not recorded';
        }
        
        sampleData.push({
          date: dateString,
          day: date.getDate(),
          status: randomStatus,
          checkIn,
          checkOut,
          hours,
          remarks
        });
      }
      
      return sampleData;
    };

    const sampleData = generateSampleData();
    setAttendanceData(sampleData);
  }, []);

  // Calculate total break time and exceeded time
  const calculateTotalBreakTime = () => {
    const totalDuration = breakTypes.reduce((total, breakType) => 
      total + breakData[breakType.id].totalDuration, 0
    );
    
    const exceededDuration = breakTypes.reduce((total, breakType) => 
      total + breakData[breakType.id].exceededDuration, 0
    );

    return {
      totalDuration,
      exceededDuration,
      allowedDuration: totalDuration - exceededDuration
    };
  };

  // Calculate working hours summary with overtime consideration
  const calculateWorkingHoursSummary = () => {
    const breakSummary = calculateTotalBreakTime();
    const netWorkingTime = Math.max(0, systemAttendance.totalWorkingTime - breakSummary.allowedDuration);
    
    const requiredWorkingTime = 9 * 60;
    const overtimeRequired = Math.max(0, requiredWorkingTime - netWorkingTime + overtimeDebt.netDebt);
    
    return {
      totalBreakTime: breakSummary.totalDuration,
      exceededBreakTime: breakSummary.exceededDuration,
      netWorkingTime,
      grossWorkingTime: systemAttendance.totalWorkingTime,
      efficiency: systemAttendance.totalWorkingTime > 0 
        ? Math.max(0, ((netWorkingTime / systemAttendance.totalWorkingTime) * 100)).toFixed(1)
        : 0,
      overtimeRequired,
      requiredWorkingTime
    };
  };

  // Update current time and calculate break durations
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateWorkingTime();
      
      // Update active break durations
      breakTypes.forEach(breakType => {
        const breakInfo = breakData[breakType.id];
        if (breakInfo.active && breakInfo.startTime) {
          const currentDuration = (now - breakInfo.startTime) / (1000 * 60);
          
          // Check if break exceeded limit
          if (currentDuration > breakType.limit) {
            const exceededTime = currentDuration - breakType.limit;
            
            // Add overtime debt only once when it first exceeds
            if (exceededTime > 0 && breakInfo.exceededDuration === 0) {
              addOvertimeDebt('break', exceededTime, `${breakType.name} exceeded by ${Math.round(exceededTime)} minutes`);
            }
          }
        }
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [systemAttendance.checkedIn, systemAttendance.lastUpdate, systemAttendance.isOnBreak, breakData]);

  // Enhanced Break Management with Overtime Tracking
  const handleBreakStart = (breakType) => {
    if (breakData[breakType].active) return;

    const now = new Date();
    const breakConfig = breakTypes.find(b => b.id === breakType);
    const breakLimit = breakConfig ? breakConfig.limit : 10;

    // Set auto-end timer
    const autoEndTimer = setTimeout(() => {
      handleBreakEnd(breakType);
    }, breakLimit * 60 * 1000);

    setBreakData(prev => ({
      ...prev,
      [breakType]: {
        ...prev[breakType],
        active: true,
        startTime: now,
        autoEndTimer: autoEndTimer,
      }
    }));

    // Pause working time tracking
    setBreakStatus(true);
  };

  const handleBreakEnd = (breakType) => {
    if (!breakData[breakType].active) return;

    const now = new Date();
    const breakConfig = breakTypes.find(b => b.id === breakType);
    const breakLimit = breakConfig ? breakConfig.limit : 10;

    // Clear auto-end timer
    if (breakData[breakType].autoEndTimer) {
      clearTimeout(breakData[breakType].autoEndTimer);
    }

    setBreakData(prev => {
      const breakInfo = prev[breakType];
      if (!breakInfo.startTime) return prev;
      
      const duration = (now - breakInfo.startTime) / (1000 * 60); // Calculate actual duration
      const exceeded = Math.max(0, duration - breakLimit);
      
      // Add to overtime debt if exceeded
      if (exceeded > 0) {
        addOvertimeDebt('break', exceeded, `${breakConfig.name} exceeded by ${Math.round(exceeded)} minutes`);
      }
      
      return {
        ...prev,
        [breakType]: {
          ...breakInfo,
          active: false,
          startTime: null,
          autoEndTimer: null,
          totalDuration: breakInfo.totalDuration + duration,
          exceededDuration: breakInfo.exceededDuration + exceeded,
        }
      };
    });

    // Resume working time tracking
    setBreakStatus(false);
  };

  // Manual break end button
  const handleManualBreakEnd = (breakType) => {
    handleBreakEnd(breakType);
  };

  // Overtime debt management
  const addOvertimeDebt = (type, minutes, reason) => {
    setOvertimeDebt(prev => {
      const newDebt = {
        totalDebt: prev.totalDebt + minutes,
        breakOvertime: type === 'break' ? prev.breakOvertime + minutes : prev.breakOvertime,
        lateOvertime: type === 'late' ? prev.lateOvertime + minutes : prev.lateOvertime,
        workedOvertime: prev.workedOvertime,
        netDebt: prev.netDebt + minutes,
        history: [
          ...prev.history,
          {
            type,
            minutes,
            reason,
            date: new Date().toISOString(),
            timestamp: new Date()
          }
        ]
      };
      
      return newDebt;
    });
  };

  // Track late arrivals
  const handleSystemCheckInWrapper = async () => {
    if (!canCheckIn()) return;
    
    setIsLoading(true);
    
    try {
      const now = new Date();
      const expectedStart = new Date();
      expectedStart.setHours(9, 15, 0, 0);
      
      const lateBy = (now - expectedStart) / (1000 * 60);
      const gracePeriod = 15;
      
      if (lateBy > gracePeriod) {
        const lateMinutes = Math.round(lateBy - gracePeriod);
        addOvertimeDebt('late', lateMinutes, `Late arrival by ${lateMinutes} minutes`);
      }
      
      await handleSystemCheckIn();
    } catch (error) {
      alert('❌ Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemCheckOutWrapper = async () => {
    if (!canCheckOut()) return;
    
    setIsLoading(true);
    
    try {
      await handleSystemCheckOut();
    } catch (error) {
      alert('❌ Failed to check out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle overtime work
  const handleOvertimeWork = (minutes) => {
    setOvertimeDebt(prev => {
      const newWorkedOvertime = prev.workedOvertime + minutes;
      return {
        ...prev,
        workedOvertime: newWorkedOvertime,
        netDebt: Math.max(0, prev.totalDebt - newWorkedOvertime)
      };
    });
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'present':
        return { icon: Check, color: 'text-green-600 bg-green-100', text: 'Present' };
      case 'late':
        return { icon: Clock4, color: 'text-yellow-600 bg-yellow-100', text: 'Late' };
      case 'absent':
        return { icon: X, color: 'text-red-600 bg-red-100', text: 'Absent' };
      case 'off':
        return { icon: Calendar, color: 'text-gray-600 bg-gray-100', text: 'Day Off' };
      default:
        return { icon: Clock, color: 'text-blue-600 bg-blue-100', text: 'Pending' };
    }
  };

  // Check if employee can check in/out
  const canCheckIn = () => {
    const todayStatus = getTodayStatus();
    return todayStatus.checkIn === '-' && !isLoading;
  };

  const canCheckOut = () => {
    const todayStatus = getTodayStatus();
    return todayStatus.checkIn !== '-' && todayStatus.checkOut === '-' && !isLoading;
  };

  // Calculate current break duration for active breaks
  const getCurrentBreakDuration = (breakType) => {
    const breakInfo = breakData[breakType];
    if (breakInfo.active && breakInfo.startTime) {
      const now = new Date();
      return (now - breakInfo.startTime) / (1000 * 60);
    }
    return 0;
  };

  const workingHoursSummary = calculateWorkingHoursSummary();
  const breakSummary = calculateTotalBreakTime();
  const stats = getAttendanceStats();

  // Filter only days when employee came (present or late)
  const attendanceHistory = attendanceData.filter(day => 
    day.status === 'present' || day.status === 'late'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Attendance</h1>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{currentTime.toLocaleDateString()}</div>
            <div className="text-sm text-gray-600">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Column 1 - Break Management */}
        <div className="space-y-6">
          {/* Break Management */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Break Management</h2>
            <div className="grid grid-cols-2 gap-4">
              {breakTypes.map((breakType) => {
                const breakInfo = breakData[breakType.id];
                const currentDuration = getCurrentBreakDuration(breakType.id);
                const isExceeding = currentDuration > breakType.limit;
                
                return (
                  <div key={breakType.id} className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleBreakStart(breakType.id)}
                      disabled={breakInfo.active}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition duration-300 ${
                        breakInfo.active
                          ? `${breakType.color} text-white border-transparent`
                          : `bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-400`
                      }`}
                    >
                      <breakType.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">
                        {breakInfo.active ? 'Active' : breakType.name}
                      </span>
                      <span className="text-xs opacity-75 mt-1">
                        {breakInfo.active ? 
                          `${Math.round(currentDuration)}m / ${breakType.limit}m` : 
                          `${breakType.limit}m`
                        }
                      </span>
                      {isExceeding && (
                        <span className="text-xs text-red-200 mt-1">EXCEEDED!</span>
                      )}
                    </button>
                    
                    {breakInfo.active && (
                      <button 
                        onClick={() => handleManualBreakEnd(breakType.id)}
                        className="flex items-center justify-center p-2 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-700 bg-gray-50 transition duration-300 group text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        End Break
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Break Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Breaks</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Break Time:</span>
                  <span className="font-medium">{formatDuration(breakSummary.totalDuration)}</span>
                </div>
                {breakSummary.exceededDuration > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Exceeded Time:</span>
                    <span className="font-medium">+{formatDuration(breakSummary.exceededDuration)}</span>
                  </div>
                )}
                <div className="flex justify-between text-blue-600">
                  <span>Active Breaks:</span>
                  <span className="font-medium">
                    {breakTypes.filter(breakType => breakData[breakType.id].active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rest of the columns remain the same */}
        {/* Column 2 - Overtime Debt */}
        <div className="space-y-6">
          {/* Overtime Debt */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              Overtime Debt
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm font-medium text-red-900 mb-1">Total Debt</div>
                <div className="text-xl font-bold text-red-900">
                  {formatDuration(overtimeDebt.totalDebt)}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm font-medium text-green-900 mb-1">Worked</div>
                <div className="text-xl font-bold text-green-900">
                  {formatDuration(overtimeDebt.workedOvertime)}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-medium text-purple-900 mb-1">Net Balance</div>
                <div className="text-xl font-bold text-purple-900">
                  {formatDuration(overtimeDebt.netDebt)}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">Today's Need</div>
                <div className="text-xl font-bold text-blue-900">
                  {formatDuration(workingHoursSummary.overtimeRequired)}
                </div>
              </div>
            </div>

            {/* Overtime Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Record Overtime Work</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOvertimeWork(30)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                >
                  +30m
                </button>
                <button 
                  onClick={() => handleOvertimeWork(60)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  +60m
                </button>
                <button 
                  onClick={() => {
                    const custom = prompt('Enter minutes:');
                    if (custom) handleOvertimeWork(parseInt(custom));
                  }}
                  className="flex-1 px-3 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 transition"
                >
                  Custom
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 - Stats & Debt Breakdown */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Attendance Rate:</span>
                <span className="font-medium text-blue-600">{stats.attendancePercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Present Days:</span>
                <span className="font-medium text-green-600">{stats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Late/Absent:</span>
                <span className="font-medium text-red-600">{stats.absent + stats.late}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Working Days:</span>
                <span className="font-medium text-gray-900">{stats.workingDays}</span>
              </div>
            </div>
          </div>

          {/* Debt Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Debt Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-red-600">Break Exceedance:</span>
                <span className="font-medium">{formatDuration(overtimeDebt.breakOvertime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-600">Late Arrivals:</span>
                <span className="font-medium">{formatDuration(overtimeDebt.lateOvertime)}</span>
              </div>
            </div>

            {/* Recent Activity */}
            {overtimeDebt.history.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {overtimeDebt.history.slice(-3).reverse().map((event, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                      <div className="text-gray-600 truncate">{event.reason}</div>
                      <div className="font-medium text-amber-700">+{Math.round(event.minutes)}m</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 4 - Working Hours & Check In/Out */}
        <div className="space-y-6">
          {/* Check In/Out */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
            <div className="space-y-4">
              <button 
                onClick={handleSystemCheckInWrapper}
                disabled={!canCheckIn()}
                className={`w-full flex items-center justify-center p-4 rounded-xl border transition duration-300 ${
                  canCheckIn() 
                    ? 'bg-green-50 border-green-200 hover:border-green-400 text-green-700' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <LogIn className="h-5 w-5 mr-2" />
                <span className="font-medium">Check In</span>
              </button>
              
              <button 
                onClick={handleSystemCheckOutWrapper}
                disabled={!canCheckOut()}
                className={`w-full flex items-center justify-center p-4 rounded-xl border transition duration-300 ${
                  canCheckOut() 
                    ? 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700' 
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="font-medium">Check Out</span>
              </button>
            </div>

            {/* Current Session */}
            {systemAttendance.checkedIn && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-700 font-medium">Current Session:</span>
                  <span className="text-blue-900 font-bold">
                    {formatDuration(systemAttendance.totalWorkingTime)}
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {systemAttendance.isOnBreak ? '⏸️ Break in progress' : '⏱️ Working...'}
                </div>
              </div>
            )}
          </div>

          {/* Working Hours Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Working Hours
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gross Time:</span>
                <span className="font-medium">{formatDuration(workingHoursSummary.grossWorkingTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Break Time:</span>
                <span className="font-medium text-orange-600">- {formatDuration(workingHoursSummary.totalBreakTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exceeded Breaks:</span>
                <span className="font-medium text-red-600">+ {formatDuration(workingHoursSummary.exceededBreakTime)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">Net Working Time:</span>
                <span className="font-bold text-green-600">{formatDuration(workingHoursSummary.netWorkingTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Efficiency:</span>
                <span className="font-medium text-blue-600">{workingHoursSummary.efficiency}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance History</h2>
        <p className="text-gray-600 mb-4">Dates when employee came to work</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Day</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check In</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Check Out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Hours</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((day, index) => {
                const statusInfo = getStatusInfo(day.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(day.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.text}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {day.checkIn}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {day.checkOut}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-bold">
                      {day.hours}h
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {day.remarks}
                    </td>
                  </tr>
                );
              })}
              
              {attendanceHistory.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Total days present: {attendanceHistory.length}</span>
          <span>Showing last 30 days</span>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAttendancePage;