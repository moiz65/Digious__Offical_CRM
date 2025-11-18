import { useState, useEffect } from 'react';
import { 
  Clock, Calendar, Users, CheckCircle, XCircle, Plus, 
  Search, Filter, Download, MoreVertical, Eye, Edit, 
  RefreshCw, TrendingUp, BarChart3, Coffee, LogIn, LogOut,
  ChevronDown, ChevronUp, MapPin, Smartphone, Monitor,
  FileText, Printer, Mail, UserCheck, AlertTriangle,
  Play, Square, Pause, Circle
} from 'lucide-react';

export function AttendanceManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);

  // Sample data
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      employeeId: 1,
      employee: {
        id: 1,
        name: 'John Smith',
        department: 'Sales',
        position: 'Manager',
        avatar: '/avatars/john.jpg',
        email: 'john@company.com'
      },
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '17:30',
      status: 'Present',
      hours: 8.5,
      location: 'Office',
      device: 'Desktop',
      breaks: [
        { id: 1, type: 'Lunch', start: '12:00', end: '12:45', duration: 45, status: 'completed' },
        { id: 2, type: 'Coffee', start: '15:30', end: '15:45', duration: 15, status: 'completed' }
      ],
      overtime: 0.5,
      notes: ''
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
        email: 'sarah@company.com'
      },
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '17:45',
      status: 'Late',
      hours: 8.5,
      location: 'Remote',
      device: 'Laptop',
      breaks: [
        { id: 1, type: 'Lunch', start: '12:30', end: '13:15', duration: 45, status: 'completed' }
      ],
      overtime: 0.75,
      notes: 'Working from home'
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
        email: 'mike@company.com'
      },
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: '17:15',
      status: 'Present',
      hours: 8.5,
      location: 'Office',
      device: 'Desktop',
      breaks: [
        { id: 1, type: 'Lunch', start: '12:00', end: '12:30', duration: 30, status: 'completed' },
        { id: 2, type: 'Break', start: '15:00', end: '15:15', duration: 15, status: 'completed' }
      ],
      overtime: 0,
      notes: ''
    },
    {
      id: 4,
      employeeId: 4,
      employee: {
        id: 4,
        name: 'Emily Davis',
        department: 'HR',
        position: 'HR Manager',
        avatar: '/avatars/emily.jpg',
        email: 'emily@company.com'
      },
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: null,
      status: 'Active',
      hours: 0,
      location: 'Office',
      device: 'Desktop',
      breaks: [
        { id: 1, type: 'Lunch', start: '12:00', end: '12:45', duration: 45, status: 'completed' },
        { id: 2, type: 'Break', start: '16:00', end: null, duration: 0, status: 'active' }
      ],
      overtime: 0,
      notes: 'Currently working'
    },
    {
      id: 5,
      employeeId: 5,
      employee: {
        id: 5,
        name: 'David Wilson',
        department: 'Sales',
        position: 'Sales Executive',
        avatar: '/avatars/david.jpg',
        email: 'david@company.com'
      },
      date: '2024-01-15',
      checkIn: null,
      checkOut: null,
      status: 'Absent',
      hours: 0,
      location: 'N/A',
      device: 'N/A',
      breaks: [],
      overtime: 0,
      notes: 'Sick leave'
    }
  ]);

  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Smith', department: 'Sales', status: 'active' },
    { id: 2, name: 'Sarah Johnson', department: 'Marketing', status: 'active' },
    { id: 3, name: 'Mike Chen', department: 'Engineering', status: 'active' },
    { id: 4, name: 'Emily Davis', department: 'HR', status: 'active' },
    { id: 5, name: 'David Wilson', department: 'Sales', status: 'active' }
  ]);

  // Statistics
  const stats = {
    totalEmployees: employees.length,
    present: attendanceData.filter(a => a.status === 'Present' || a.status === 'Active').length,
    absent: attendanceData.filter(a => a.status === 'Absent').length,
    late: attendanceData.filter(a => a.status === 'Late').length,
    activeBreaks: attendanceData.reduce((count, record) => 
      count + record.breaks.filter(b => b.status === 'active').length, 0
    ),
    averageHours: (attendanceData.reduce((sum, record) => sum + record.hours, 0) / attendanceData.filter(a => a.hours > 0).length).toFixed(1)
  };

  // Filter data based on search and filters
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || record.employee.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Handle break actions
  const handleStartBreak = (employeeId) => {
    const record = attendanceData.find(a => a.employeeId === employeeId && a.status === 'Active');
    if (record) {
      const newBreak = {
        id: Date.now(),
        type: 'Break',
        start: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: null,
        duration: 0,
        status: 'active'
      };
      
      setAttendanceData(prev => prev.map(att => 
        att.employeeId === employeeId 
          ? { ...att, breaks: [...att.breaks, newBreak] }
          : att
      ));
      setActiveBreak({ employeeId, breakId: newBreak.id });
    }
  };

  const handleEndBreak = (employeeId, breakId) => {
    setAttendanceData(prev => prev.map(att => 
      att.employeeId === employeeId 
        ? {
            ...att,
            breaks: att.breaks.map(b => 
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
    setActiveBreak(null);
  };

  const handleAddManualEntry = () => {
    // Implementation for manual entry
    console.log('Add manual entry');
  };

  const handleExportData = () => {
    // Implementation for export
    console.log('Export data');
  };

  const handleSendReminder = (employeeId) => {
    // Implementation for sending reminders
    console.log('Send reminder to:', employeeId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage employee attendance, breaks, and working hours</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition duration-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={handleAddManualEntry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Manual Entry
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          icon={Users}
          color="blue"
        />
        <StatCard 
          title="Present Today" 
          value={stats.present} 
          icon={UserCheck}
          color="green"
        />
        <StatCard 
          title="Absent Today" 
          value={stats.absent} 
          icon={XCircle}
          color="red"
        />
        <StatCard 
          title="Late Arrivals" 
          value={stats.late} 
          icon={Clock}
          color="orange"
        />
        <StatCard 
          title="Active Breaks" 
          value={stats.activeBreaks} 
          icon={Coffee}
          color="purple"
        />
        <StatCard 
          title="Avg. Hours" 
          value={stats.averageHours} 
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Active">Active</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-3 py-2 rounded-xl transition duration-200 ${
                viewMode === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button 
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-2 rounded-xl transition duration-200 ${
                viewMode === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-2 rounded-xl transition duration-200 ${
                viewMode === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Employee</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Check In</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Check Out</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Breaks</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Hours</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Location</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((record) => (
                <AttendanceRow 
                  key={record.id}
                  record={record}
                  onStartBreak={handleStartBreak}
                  onEndBreak={handleEndBreak}
                  onViewDetails={() => setSelectedEmployee(record)}
                  onSendReminder={handleSendReminder}
                  activeBreak={activeBreak}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* Break Management Modal */}
      {showBreakModal && (
        <BreakManagementModal
          onClose={() => setShowBreakModal(false)}
          attendanceData={attendanceData}
        />
      )}
    </div>
  );
}

// Attendance Row Component
function AttendanceRow({ record, onStartBreak, onEndBreak, onViewDetails, onSendReminder, activeBreak }) {
  const [showBreakDetails, setShowBreakDetails] = useState(false);
  
  const activeBreakForEmployee = record.breaks.find(b => b.status === 'active');
  const totalBreakTime = record.breaks.reduce((sum, breakItem) => sum + breakItem.duration, 0);

  return (
    <>
      <tr className="hover:bg-gray-50 transition duration-150">
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {record.employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-medium text-gray-900">{record.employee.name}</div>
              <div className="text-sm text-gray-600">{record.employee.department}</div>
            </div>
          </div>
        </td>
        
        <td className="py-4 px-6">
          {record.checkIn ? (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-green-500" />
              <span className="font-medium text-gray-900">{record.checkIn}</span>
            </div>
          ) : (
            <span className="text-gray-400">Not checked in</span>
          )}
        </td>
        
        <td className="py-4 px-6">
          {record.checkOut ? (
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-900">{record.checkOut}</span>
            </div>
          ) : record.status === 'Active' ? (
            <span className="text-orange-600 font-medium">Still working</span>
          ) : (
            <span className="text-gray-400">Not checked out</span>
          )}
        </td>
        
        <td className="py-4 px-6">
          <button 
            onClick={() => setShowBreakDetails(!showBreakDetails)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition duration-200"
          >
            <Coffee className="h-4 w-4" />
            {record.breaks.length} breaks
            {showBreakDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
        
        <td className="py-4 px-6">
          <div className="text-sm font-medium text-gray-900">
            {record.hours > 0 ? `${record.hours}h` : '--'}
          </div>
          {totalBreakTime > 0 && (
            <div className="text-xs text-gray-500">
              {Math.floor(totalBreakTime / 60)}h {totalBreakTime % 60}m breaks
            </div>
          )}
        </td>
        
        <td className="py-4 px-6">
          <StatusBadge status={record.status} />
        </td>
        
        <td className="py-4 px-6">
          <div className="flex items-center gap-2 text-sm">
            {record.location === 'Office' ? (
              <Monitor className="h-4 w-4 text-blue-500" />
            ) : record.location === 'Remote' ? (
              <Smartphone className="h-4 w-4 text-green-500" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400" />
            )}
            <span className={record.location === 'N/A' ? 'text-gray-400' : 'text-gray-700'}>
              {record.location}
            </span>
          </div>
        </td>
        
        <td className="py-4 px-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={onViewDetails}
              className="p-2 text-gray-400 hover:text-blue-600 transition duration-200"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            
            {record.status === 'Active' && !activeBreakForEmployee && (
              <button 
                onClick={() => onStartBreak(record.employeeId)}
                className="p-2 text-gray-400 hover:text-orange-600 transition duration-200"
                title="Start Break"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            
            {activeBreakForEmployee && (
              <button 
                onClick={() => onEndBreak(record.employeeId, activeBreakForEmployee.id)}
                className="p-2 text-gray-400 hover:text-green-600 transition duration-200"
                title="End Break"
              >
                <Square className="h-4 w-4" />
              </button>
            )}
            
            {!record.checkIn && (
              <button 
                onClick={() => onSendReminder(record.employeeId)}
                className="p-2 text-gray-400 hover:text-red-600 transition duration-200"
                title="Send Reminder"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {/* Break Details Expandable Row */}
      {showBreakDetails && (
        <tr>
          <td colSpan="8" className="bg-gray-50 p-4">
            <div className="pl-16">
              <h4 className="font-medium text-gray-900 mb-3">Break Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {record.breaks.map((breakItem, index) => (
                  <div key={breakItem.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{breakItem.type}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        breakItem.status === 'active' ? 'bg-green-500 animate-pulse' : 
                        breakItem.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Start: {breakItem.start}</div>
                      {breakItem.end && <div>End: {breakItem.end}</div>}
                      {breakItem.duration > 0 && (
                        <div>Duration: {Math.floor(breakItem.duration / 60)}h {breakItem.duration % 60}m</div>
                      )}
                      <div className={`text-xs font-medium ${
                        breakItem.status === 'active' ? 'text-green-600' : 
                        breakItem.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {breakItem.status.charAt(0).toUpperCase() + breakItem.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
                {record.breaks.length === 0 && (
                  <div className="text-gray-500 text-sm">No breaks recorded</div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Present':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'Active':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'Late':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock };
      case 'Absent':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Circle };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      {status}
    </span>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    red: 'text-red-500 bg-red-50',
    orange: 'text-orange-500 bg-orange-50',
    purple: 'text-purple-500 bg-purple-50',
    indigo: 'text-indigo-500 bg-indigo-50'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Employee Detail Modal Component
function EmployeeDetailModal({ employee, onClose }) {
  const totalHours = employee.hours;
  const totalBreaks = employee.breaks.reduce((sum, b) => sum + b.duration, 0);
  const productiveHours = totalHours - (totalBreaks / 60);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attendance Details</h3>
            <p className="text-gray-600">{employee.employee.name} - {employee.date}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Employee Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Name:</span> {employee.employee.name}</div>
                <div><span className="text-gray-600">Department:</span> {employee.employee.department}</div>
                <div><span className="text-gray-600">Position:</span> {employee.employee.position}</div>
                <div><span className="text-gray-600">Email:</span> {employee.employee.email}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Attendance Summary</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Status:</span> <StatusBadge status={employee.status} /></div>
                <div><span className="text-gray-600">Check In:</span> {employee.checkIn || 'N/A'}</div>
                <div><span className="text-gray-600">Check Out:</span> {employee.checkOut || 'N/A'}</div>
                <div><span className="text-gray-600">Total Hours:</span> {totalHours}h</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Location:</span> {employee.location}</div>
                <div><span className="text-gray-600">Device:</span> {employee.device}</div>
                <div><span className="text-gray-600">Overtime:</span> {employee.overtime}h</div>
                <div><span className="text-gray-600">Productive Time:</span> {productiveHours.toFixed(1)}h</div>
              </div>
            </div>
          </div>

          {/* Breaks Timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-4">Breaks Timeline</h4>
            <div className="space-y-3">
              {employee.breaks.map((breakItem, index) => (
                <div key={breakItem.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      breakItem.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-gray-900">{breakItem.type}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {breakItem.start} - {breakItem.end || 'Ongoing'}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {breakItem.duration > 0 ? `${Math.floor(breakItem.duration / 60)}h ${breakItem.duration % 60}m` : 'Active'}
                  </div>
                </div>
              ))}
              {employee.breaks.length === 0 && (
                <div className="text-center text-gray-500 py-4">No breaks recorded for this session</div>
              )}
            </div>
          </div>

          {/* Notes */}
          {employee.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{employee.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition duration-200"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Break Management Modal Component
function BreakManagementModal({ onClose, attendanceData }) {
  const activeBreaks = attendanceData.flatMap(record => 
    record.breaks.filter(b => b.status === 'active').map(b => ({
      ...b,
      employee: record.employee,
      recordId: record.id
    }))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Breaks Management</h3>
            <p className="text-gray-600">Monitor and manage ongoing employee breaks</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {activeBreaks.length > 0 ? (
            <div className="space-y-4">
              {activeBreaks.map((breakItem) => (
                <div key={`${breakItem.recordId}-${breakItem.id}`} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                    <div>
                      <div className="font-medium text-gray-900">{breakItem.employee.name}</div>
                      <div className="text-sm text-gray-600">{breakItem.type} break started at {breakItem.start}</div>
                    </div>
                  </div>
                  <div className="text-sm text-orange-600 font-medium">
                    Ongoing
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Breaks</h4>
              <p className="text-gray-600">There are currently no employees on break.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttendanceManagement;