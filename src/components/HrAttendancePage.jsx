import { useState, useEffect } from 'react';
import { 
  Calendar, Users, CheckCircle, XCircle, Clock, FileText, Download, 
  Filter, Plus, Search, AlertCircle, ChevronDown, Settings, Eye, 
  Edit3, Trash2, MoreVertical, UserPlus, RotateCcw, BarChart3,
  Send, Mail, Bell, Shield, Zap, Crown, Coffee, Sun, Moon,
  ArrowLeft, ArrowRight, User, Target, PieChart, ChevronUp,
  MapPin, Building, Grid, List, X
} from 'lucide-react';

// Pie Chart Component
const PieChartComponent = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 42 42" className="transform -rotate-90">
          {data.map((item, index) => {
            if (item.value === 0) return null;
            
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            
            return (
              <circle
                key={index}
                cx="21"
                cy="21"
                r="15.9"
                fill="transparent"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                style={{
                  transition: 'stroke-dasharray 0.3s ease',
                }}
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Edit Attendance Modal Component
const EditAttendanceModal = ({ employee, attendance, date, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    status: attendance?.status || 'present',
    checkIn: attendance?.checkIn !== '-' ? convertTo24Hour(attendance.checkIn) : '09:00',
    checkOut: attendance?.checkOut !== '-' ? convertTo24Hour(attendance.checkOut) : '18:00',
    notes: attendance?.notes || ''
  });

  // Helper function to convert 12-hour to 24-hour format
  function convertTo24Hour(time12h) {
    if (!time12h || time12h === '-') return '09:00';
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Helper function to convert 24-hour to 12-hour format
  function convertTo12Hour(time24h) {
    if (!time24h) return '09:00 AM';
    
    let [hours, minutes] = time24h.split(':');
    hours = parseInt(hours, 10);
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${modifier}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const checkIn12h = formData.checkIn ? convertTo12Hour(formData.checkIn) : '-';
    const checkOut12h = formData.checkOut ? convertTo12Hour(formData.checkOut) : '-';
    onSave(formData.status, checkIn12h, checkOut12h);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Attendance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
              {employee.avatar}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{employee.name}</h4>
              <p className="text-sm text-gray-600">{employee.department}</p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">On Leave</option>
              <option value="halfday">Half Day</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any notes about this attendance record..."
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Employee Detail View Component
const EmployeeDetailView = ({ employee, onBack, attendanceData, holidays, employeeLeaves, onManualAttendance }) => {
  const [isEditingAttendance, setIsEditingAttendance] = useState(null);

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

  const empAttendance = getEmployeeAttendance(employee.id);
  const empStats = getEmployeeStats(employee.id);
  const empLeaves = employeeLeaves.find(l => l.employeeId === employee.id);

  const handleSaveAttendance = (record, newStatus, checkIn, checkOut) => {
    onManualAttendance(employee.id, record.date, newStatus, checkIn, checkOut);
    setIsEditingAttendance(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* Header */}
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
        {/* Quick Stats */}
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

        {/* Leaves Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaves Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{employee.totalLeaves}</div>
              <div className="text-sm text-gray-600">Total Leaves</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{employee.leavesTaken}</div>
              <div className="text-sm text-gray-600">Leaves Taken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{employee.leavesRemaining}</div>
              <div className="text-sm text-gray-600">Leaves Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {empLeaves ? `${empLeaves.casualLeaves}C ${empLeaves.sickLeaves}S ${empLeaves.annualLeaves}A` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Breakdown</div>
            </div>
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {empAttendance.map((dayData) => {
              const isHoliday = holidays.some(h => h.date === dayData.date);
              return (
                <div 
                  key={dayData.id} 
                  className={`
                    text-center p-2 rounded-lg border text-sm font-medium cursor-pointer hover:scale-105 transition-transform relative
                    ${isHoliday ? 'bg-purple-50 border-purple-200 text-purple-700' :
                      dayData.status === 'present' ? 'bg-green-50 border-green-200 text-green-700' :
                      dayData.status === 'leave' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                      dayData.status === 'halfday' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                      dayData.status === 'absent' ? 'bg-red-50 border-red-200 text-red-700' :
                      'bg-gray-50 border-gray-200 text-gray-500'
                    }
                  `}
                  title={`${dayData.date}: ${isHoliday ? 'Holiday' : dayData.status} - ${dayData.checkIn} to ${dayData.checkOut}`}
                >
                  {new Date(dayData.date).getDate()}
                  {isHoliday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Attendance Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Attendance Log</h3>
            <button 
              onClick={() => setIsEditingAttendance('new')}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </button>
          </div>

          {/* Manual Entry Form */}
          {isEditingAttendance === 'new' && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="present">Present</option>
                  <option value="leave">Leave</option>
                  <option value="halfday">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
                <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
                <input type="time" className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Check-in" />
                <input type="time" className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Check-out" />
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
                <button onClick={() => setIsEditingAttendance(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {empAttendance.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-500' :
                    record.status === 'leave' ? 'bg-orange-500' :
                    record.status === 'halfday' ? 'bg-blue-500' :
                    record.status === 'absent' ? 'bg-red-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.checkIn} - {record.checkOut} • {record.hours}h
                      {record.late !== '-' && ` • Late: ${record.late}`}
                      {record.overtime > 0 && ` • OT: ${record.overtime}h`}
                    </div>
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
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Save</button>
                      <button 
                        onClick={() => setIsEditingAttendance(null)}
                        className="px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'leave' ? 'bg-orange-100 text-orange-800' :
                        record.status === 'halfday' ? 'bg-blue-100 text-blue-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                      {record.breaks > 0 && (
                        <span className="text-xs text-gray-600">
                          {record.breaks} breaks
                        </span>
                      )}
                      <button 
                        onClick={() => setIsEditingAttendance(record.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition duration-300"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
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

      {/* Bulk Actions Bar */}
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
              {/* Selection Checkbox */}
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
                {/* Attendance Stats */}
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

                {/* Leaves Info */}
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

                {/* Action Buttons */}
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

// Overview Tab Component
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
  onManualAttendance,
  attendanceSearch,
  setAttendanceSearch,
  attendanceFilter,
  setAttendanceFilter,
  attendanceSort,
  setAttendanceSort,
  getFilteredAndSortedAttendance,
  handleBulkStatusUpdate,
  handleQuickAttendance,
  editingAttendance,
  setEditingAttendance,
  employees
}) => {
  const filteredData = getFilteredAttendanceData();
  const filteredEmployees = getFilteredEmployees();
  const todayAttendance = filteredData.filter(item => item.date === selectedDate);

  // Pie Chart Data
  const getAttendancePieData = () => {
    const todayData = filteredData.filter(item => item.date === selectedDate);
    const present = todayData.filter(item => item.status === 'present').length;
    const leave = todayData.filter(item => item.status === 'leave').length;
    const halfday = todayData.filter(item => item.status === 'halfday').length;
    const absent = todayData.filter(item => item.status === 'absent').length;
    const off = todayData.filter(item => item.status === 'off').length;

    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Leave', value: leave, color: '#f59e0b' },
      { name: 'Half Day', value: halfday, color: '#3b82f6' },
      { name: 'Absent', value: absent, color: '#ef4444' },
      { name: 'Off', value: off, color: '#6b7280' }
    ];
  };

  const getMonthlyPieData = () => {
    const monthlyData = filteredData.filter(item => 
      new Date(item.date).getMonth() === currentDate.getMonth() &&
      new Date(item.date).getFullYear() === currentDate.getFullYear()
    );

    const present = monthlyData.filter(item => item.status === 'present').length;
    const leave = monthlyData.filter(item => item.status === 'leave').length;
    const halfday = monthlyData.filter(item => item.status === 'halfday').length;
    const absent = monthlyData.filter(item => item.status === 'absent').length;

    return [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Leave', value: leave, color: '#f59e0b' },
      { name: 'Half Day', value: halfday, color: '#3b82f6' },
      { name: 'Absent', value: absent, color: '#ef4444' }
    ];
  };

  const pieData = getAttendancePieData();
  const monthlyPieData = getMonthlyPieData();

  // Calendar navigation
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Get days in month for calendar
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }
    
    return days;
  };

  // Filter options
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
      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Filters</h2>
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleFilterChange('viewType', 'calendar')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  filters.viewType === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => handleFilterChange('viewType', 'list')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  filters.viewType === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </button>
            </div>
            
            <button className="flex items-center px-4 py-2 bg-[#349dff] text-white rounded-xl hover:bg-[#2980db] transition duration-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Range Filter */}
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

          {/* Department Filter */}
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

          {/* Status Filter */}
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

          {/* Custom Date Range (shown only when custom is selected) */}
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

        {/* Active Filters Summary */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">Showing:</span>
          <span>{filteredEmployees.length} employees</span>
          <span>{filteredData.length} records</span>
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

      {/* Dynamic Calendar Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-3"></div>;
            }

            const dateStr = date.toISOString().split('T')[0];
            const dayAttendance = filteredData.filter(att => att.date === dateStr);
            const presentCount = dayAttendance.filter(a => a.status === 'present').length;
            const totalCount = filteredEmployees.length;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isHoliday = holidays.some(h => h.date === dateStr);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 min-h-[80px]
                  ${isSelected ? 'border-[#349dff] bg-blue-50' : 'border-gray-200 bg-white'}
                  ${isToday ? 'ring-2 ring-blue-200' : ''}
                  ${isHoliday ? 'bg-purple-50 border-purple-200' : ''}
                  ${isWeekend ? 'bg-gray-50' : ''}
                `}
              >
                <div className="text-center mb-2">
                  <div className={`text-sm font-medium ${
                    isSelected ? 'text-[#349dff]' : 
                    isHoliday ? 'text-purple-700' : 
                    isWeekend ? 'text-gray-500' :
                    'text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  {isToday && (
                    <div className="text-xs text-blue-600 font-medium">Today</div>
                  )}
                </div>
                
               

                {/* Summary */}
                <div className="text-xs text-center text-gray-600">
                  {presentCount}/{totalCount}
                </div>

                {isHoliday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs border-t pt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            Present
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
            Leave
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            Half Day
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            Absent
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            Holiday
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
            No Record
          </div>
        </div>
      </div>

      {/* Selected Date Details & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Date Attendance - Enhanced */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('present')}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition duration-200 border border-green-200"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('absent')}
                  className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition duration-200 border border-red-200"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {todayAttendance.length} of {filteredEmployees.length} employees
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

          {/* Summary Stats Bar */}
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

          {/* Attendance Filters */}
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
                <option value="late">Late Arrivals</option>
                <option value="not-recorded">Not Recorded</option>
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
                <option value="checkIn">Check-in Time</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {getFilteredAndSortedAttendance().map(employee => {
              const attendance = todayAttendance.find(a => a.employeeId === employee.id);
              const status = attendance?.status || 'not-recorded';
              const checkIn = attendance?.checkIn || '-';
              const checkOut = attendance?.checkOut || '-';
              const isHoliday = holidays.some(h => h.date === selectedDate);
              const isLate = checkIn !== '-' && checkIn > '9:15 AM';
              const hasOvertime = attendance?.overtime > 0;

              return (
                <div 
                  key={employee.id} 
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Employee Avatar with Status Indicator */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                        {employee.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        status === 'present' ? 'bg-green-500' :
                        status === 'absent' ? 'bg-red-500' :
                        status === 'leave' ? 'bg-orange-500' :
                        status === 'halfday' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    
                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                        {isLate && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Late
                          </span>
                        )}
                        {hasOvertime && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            OT: {attendance.overtime}h
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {employee.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {employee.location}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {employee.position}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Attendance Details */}
                  <div className="flex items-center space-x-6">
                    {/* Time Tracking */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end space-x-4">
                        <div className="text-center">
                          <div className={`text-sm font-medium flex items-center justify-end ${
                            isLate ? 'text-orange-600' : 'text-gray-900'
                          }`}>
                            {checkIn !== '-' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                {checkIn}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Check-in</div>
                        </div>
                        <div className="text-gray-300">→</div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 flex items-center justify-end">
                            {checkOut !== '-' ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                {checkOut}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Check-out</div>
                        </div>
                      </div>
                      {attendance?.hours !== '0.0' && attendance?.hours && (
                        <div className="text-xs text-gray-600 text-right">
                          Total: {attendance.hours}h
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                        isHoliday ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        status === 'present' ? 'bg-green-100 text-green-800 border border-green-200' :
                        status === 'leave' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        status === 'halfday' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        status === 'absent' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {isHoliday ? (
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

                      {/* Quick Actions */}
                      {!isHoliday && (
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleQuickAttendance(employee.id, 'present', '09:00 AM', '06:00 PM')}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition duration-200 flex items-center space-x-1"
                            title="Mark Present"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Present</span>
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(employee.id, 'absent')}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition duration-200 flex items-center space-x-1"
                            title="Mark Absent"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Absent</span>
                          </button>
                          <button
                            onClick={() => setEditingAttendance(employee.id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition duration-200 flex items-center space-x-1"
                            title="Edit Attendance"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
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

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Today's Attendance Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <PieChartComponent 
              data={pieData} 
              title="Today's Attendance"
              size={180}
            />
          </div>

          {/* Monthly Overview Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <PieChartComponent 
              data={monthlyPieData} 
              title="Monthly Overview"
              size={180}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Attendance Rate</span>
                <span className="text-lg font-bold text-green-600">{stats.monthlyAttendanceRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Working Days</span>
                <span className="text-lg font-bold text-blue-600">22</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Late Arrivals</span>
                <span className="text-lg font-bold text-orange-600">{stats.monthlyLate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Employees</span>
                <span className="text-lg font-bold text-purple-600">{stats.activeEmployees}</span>
              </div>
            </div>
          </div>
        </div>
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
          return (
            <div key={breakItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#349dff] transition duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {employee?.avatar || 'E'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{employee?.name || 'Employee'}</h4>
                  <p className="text-sm text-gray-600">
                    {breakItem.breakStart} - {breakItem.breakEnd || 'Ongoing'} • {breakItem.duration}min
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  breakItem.type === 'lunch' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
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

      {/* Add Break Modal */}
      {isAddBreakModalOpen && (
        <AddBreakModal
          employees={employees}
          onClose={() => setIsAddBreakModalOpen(false)}
          onAddBreak={onAddBreak}
        />
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

      {/* Add Holiday Modal */}
      {isAddHolidayModalOpen && (
        <AddHolidayModal
          onClose={() => setIsAddHolidayModalOpen(false)}
          onAddHoliday={onAddHoliday}
        />
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

              {/* Leave Type Breakdown */}
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

              {/* Approve Button */}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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

const AddHolidayModal = ({ onClose, onAddHoliday }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'public'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddHoliday(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Holiday</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              <option value="public">Public Holiday</option>
              <option value="company">Company Holiday</option>
            </select>
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
              Add Holiday
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddBreakModal = ({ employees, onClose, onAddBreak }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    breakStart: '',
    breakEnd: '',
    type: 'short'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddBreak(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add Break</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.breakStart}
                onChange={(e) => setFormData(prev => ({ ...prev, breakStart: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.breakEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, breakEnd: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#349dff] focus:border-transparent"
            >
              <option value="short">Short Break</option>
              <option value="lunch">Lunch Break</option>
            </select>
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
              Add Break
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
  
  // Enhanced state variables
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddHolidayModalOpen, setIsAddHolidayModalOpen] = useState(false);
  const [isAddBreakModalOpen, setIsAddBreakModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [notifications, setNotifications] = useState([]);

  // New state variables for enhanced attendance functionality
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [attendanceSort, setAttendanceSort] = useState('name');
  const [editingAttendance, setEditingAttendance] = useState(null);

  // Filter states
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

  // Enhanced filtering and sorting function
  const getFilteredAndSortedAttendance = () => {
    const filteredEmployees = getFilteredEmployees();
    const todayAttendanceData = getFilteredAttendanceData().filter(item => item.date === selectedDate);
    
    let filtered = filteredEmployees;
    
    // Apply search filter
    if (attendanceSearch) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(attendanceSearch.toLowerCase())
      );
    }
    
    // Apply status filter
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
        return status === attendanceFilter;
      });
    }
    
    // Apply sorting
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

  // Bulk status update function
  const handleBulkStatusUpdate = (status) => {
    const employeesToUpdate = getFilteredAndSortedAttendance();
    const todayAttendanceData = getFilteredAttendanceData().filter(item => item.date === selectedDate);
    
    employeesToUpdate.forEach(employee => {
      const existingAttendance = todayAttendanceData.find(a => a.employeeId === employee.id);
      
      if (!existingAttendance || existingAttendance.status !== status) {
        const checkIn = status === 'present' ? '09:00 AM' : '-';
        const checkOut = status === 'present' ? '06:00 PM' : '-';
        
        handleManualAttendance(employee.id, selectedDate, status, checkIn, checkOut);
      }
    });
    
    addNotification(`Marked ${employeesToUpdate.length} employees as ${status}`, 'success');
  };

  // Enhanced quick attendance function
  const handleQuickAttendance = (employeeId, status, checkIn = '-', checkOut = '-') => {
    handleManualAttendance(employeeId, selectedDate, status, checkIn, checkOut);
    
    // Show appropriate notification
    const employee = employees.find(emp => emp.id === employeeId);
    const statusMessages = {
      present: `Marked ${employee?.name} as present`,
      absent: `Marked ${employee?.name} as absent`,
      leave: `Marked ${employee?.name} as on leave`,
      halfday: `Marked ${employee?.name} as half day`
    };
    
    addNotification(statusMessages[status] || 'Attendance updated', 'success');
  };

  // Initialize sample data
  useEffect(() => {
    // Sample employees data
    const sampleEmployees = [
      { 
        id: 1, 
        name: 'Muhammad Hamza', 
        department: 'Production', 
        position: 'Senior Developer', 
        email: 'hamza@company.com', 
        status: 'active', 
        joinDate: '2023-01-15', 
        avatar: 'MH',
        totalLeaves: 20,
        leavesTaken: 8,
        leavesRemaining: 12,
        phone: '+1-555-0101',
        location: 'New York'
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
        phone: '+1-555-0102',
        location: 'San Francisco'
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
        phone: '+1-555-0103',
        location: 'Chicago'
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
        phone: '+1-555-0104',
        location: 'Boston'
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
        phone: '+1-555-0105',
        location: 'Austin'
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
        phone: '+1-555-0106',
        location: 'Seattle'
      }
    ];

    // Sample attendance rules
    const sampleRules = {
      workHours: { start: '09:00', end: '18:00' },
      breakDuration: 60,
      lunchBreak: { start: '13:00', end: '14:00' },
      gracePeriod: 15,
      overtimeRate: 1.5,
      autoDeduction: true
    };

    // Sample breaks data
    const sampleBreaks = [
      { id: 1, employeeId: 1, date: '2025-01-15', breakStart: '11:00', breakEnd: '11:15', duration: 15, type: 'short' },
      { id: 2, employeeId: 1, date: '2025-01-15', breakStart: '13:00', breakEnd: '14:00', duration: 60, type: 'lunch' },
      { id: 3, employeeId: 2, date: '2025-01-15', breakStart: '11:30', breakEnd: '11:45', duration: 15, type: 'short' }
    ];

    // Sample holidays
    const sampleHolidays = [
      { id: 1, name: 'Annual Dinner', date: '2025-01-01', type: 'public' },
      { id: 2, name: 'Company Holiday', date: '2025-01-2', type: 'company' },
      { id: 3, name: 'Christmas Day', date: '2025-12-25', type: 'public' },
      { id: 4, name: 'Qauid Brithday Party', date: '2025-12-25', type: 'public' }
    ];

    // Sample employee leaves summary
    const sampleEmployeeLeaves = [
      { employeeId: 1, casualLeaves: 3, sickLeaves: 2, annualLeaves: 3, totalTaken: 8 },
      { employeeId: 2, casualLeaves: 5, sickLeaves: 4, annualLeaves: 3, totalTaken: 12 },
      { employeeId: 3, casualLeaves: 2, sickLeaves: 1, annualLeaves: 2, totalTaken: 5 },
      { employeeId: 4, casualLeaves: 8, sickLeaves: 4, annualLeaves: 3, totalTaken: 15 },
      { employeeId: 5, casualLeaves: 1, sickLeaves: 1, annualLeaves: 1, totalTaken: 3 },
      { employeeId: 6, casualLeaves: 4, sickLeaves: 3, annualLeaves: 3, totalTaken: 10 }
    ];

    // Enhanced sample attendance data with more realistic patterns
    const sampleAttendance = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = sampleHolidays.some(h => h.date === date.toISOString().split('T')[0]);
      
      sampleEmployees.forEach(employee => {
        let status, checkIn, checkOut, hours, late, overtime;
        
        if (isHoliday) {
          status = 'off';
          checkIn = '-';
          checkOut = '-';
          hours = '0.0';
          late = '-';
          overtime = '0.0';
        } else if (isWeekend) {
          status = Math.random() > 0.8 ? 'present' : 'off';
          if (status === 'present') {
            checkIn = '10:00 AM';
            checkOut = '4:00 PM';
            hours = '6.0';
            late = Math.random() > 0.7 ? '60m' : '-';
            overtime = '0.0';
          } else {
            checkIn = '-';
            checkOut = '-';
            hours = '0.0';
            late = '-';
            overtime = '0.0';
          }
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
            // Random check-in between 8:45 AM and 9:30 AM
            const checkInHour = 8 + Math.floor(Math.random() * 2);
            const checkInMinute = 45 + Math.floor(Math.random() * 45);
            checkIn = `${checkInHour}:${checkInMinute.toString().padStart(2, '0')} AM`;
            
            // Check-out between 5:30 PM and 7:00 PM
            const checkOutHour = 17 + Math.floor(Math.random() * 2);
            const checkOutMinute = 30 + Math.floor(Math.random() * 30);
            checkOut = `${checkOutHour - 12}:${checkOutMinute.toString().padStart(2, '0')} PM`;
            
            hours = (8.5 + Math.random() * 1.5).toFixed(1);
            late = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15) ? `${(checkInMinute - 15)}m` : '-';
            overtime = Math.random() > 0.6 ? (Math.random() * 3).toFixed(1) : '0.0';
          } else if (status === 'halfday') {
            checkIn = '9:00 PM';
            checkOut = '1:00 PM';
            hours = '4.0';
            late = '-';
            overtime = '0.0';
          } else {
            checkIn = '-';
            checkOut = '-';
            hours = '0.0';
            late = '-';
            overtime = '0.0';
          }
        }
        
        sampleAttendance.push({
          id: `${employee.id}-${i}`,
          employeeId: employee.id,
          date: date.toISOString().split('T')[0],
          day: i,
          status: status,
          checkIn: checkIn,
          checkOut: checkOut,
          hours: hours,
          breaks: Math.floor(Math.random() * 3),
          breakDuration: Math.floor(Math.random() * 90),
          late: late,
          overtime: overtime,
          notes: status === 'absent' && Math.random() > 0.5 ? 'No notification' : ''
        });
      });
    }

    setEmployees(sampleEmployees);
    setAttendanceRules(sampleRules);
    setBreaks(sampleBreaks);
    setHolidays(sampleHolidays);
    setEmployeeLeaves(sampleEmployeeLeaves);
    setAttendanceData(sampleAttendance);
  }, [currentDate]);

  // Enhanced Functionalities

  // Employee Management Functions
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

  // Holiday Management Functions
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

  // Break Management Functions
  const handleAddBreak = (breakData) => {
    const newBreak = {
      id: Math.max(...breaks.map(b => b.id)) + 1,
      ...breakData,
      duration: calculateBreakDuration(breakData.breakStart, breakData.breakEnd)
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

  // Attendance Management Functions
  const handleManualAttendance = (employeeId, date, status, checkIn, checkOut) => {
    const existingRecord = attendanceData.find(att => 
      att.employeeId === employeeId && att.date === date
    );

    if (existingRecord) {
      // Update existing record
      setAttendanceData(prev => prev.map(att => 
        att.id === existingRecord.id ? {
          ...att,
          status,
          checkIn: checkIn || att.checkIn,
          checkOut: checkOut || att.checkOut,
          hours: calculateHours(checkIn, checkOut),
          late: calculateLate(checkIn),
          overtime: calculateOvertime(checkOut)
        } : att
      ));
    } else {
      // Create new record
      const newAttendance = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        status,
        checkIn: checkIn || '-',
        checkOut: checkOut || '-',
        hours: calculateHours(checkIn, checkOut),
        breaks: 0,
        breakDuration: 0,
        late: calculateLate(checkIn),
        overtime: calculateOvertime(checkOut),
        notes: 'Manual entry'
      };
      setAttendanceData(prev => [...prev, newAttendance]);
    }
    addNotification('Attendance updated successfully', 'success');
  };

  // Bulk Operations
  const handleBulkAction = () => {
    if (!bulkAction || selectedEmployees.length === 0) return;

    switch (bulkAction) {
      case 'approve-leave':
        selectedEmployees.forEach(empId => {
          // Update leave status
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
    // In a real app, this would generate and download a file
    console.log('Exporting data:', dataToExport);
    addNotification(`Data exported for ${employeeIds.length} employees`, 'success');
  };

  const handleBulkReminder = (employeeIds) => {
    // In a real app, this would send actual reminders
    console.log('Sending reminders to:', employeeIds);
    addNotification(`Reminders sent to ${employeeIds.length} employees`, 'success');
  };

  // Leave Management
  const handleApproveLeave = (employeeId) => {
    setEmployeeLeaves(prev => prev.map(leave => 
      leave.employeeId === employeeId 
        ? { ...leave, totalTaken: leave.totalTaken + 1 }
        : leave
    ));
    addNotification('Leave approved successfully', 'success');
  };

  // Search and Filter Functions
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

  // Utility Functions
  const calculateBreakDuration = (start, end) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    return Math.round((endTime - startTime) / (1000 * 60));
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut || checkIn === '-' || checkOut === '-') return '0.0';
    // Simple calculation - in real app, use proper time parsing
    return '8.0';
  };

  const calculateLate = (checkIn) => {
    if (!checkIn || checkIn === '-') return '-';
    // Simple late calculation
    return checkIn > '09:15' ? '15m' : '-';
  };

  const calculateOvertime = (checkOut) => {
    if (!checkOut || checkOut === '-') return '0.0';
    // Simple overtime calculation
    return checkOut > '18:00' ? '1.5' : '0.0';
  };

  // Notification System
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  // Employee Selection for Bulk Operations
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

  // Filter handlers
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

  // Get filtered data based on current filters
  const getFilteredAttendanceData = () => {
    let filteredData = [...attendanceData];
    
    // Filter by department
    if (filters.department !== 'all') {
      const departmentEmployees = employees
        .filter(emp => emp.department === filters.department)
        .map(emp => emp.id);
      filteredData = filteredData.filter(att => 
        departmentEmployees.includes(att.employeeId)
      );
    }
    
    // Filter by status
    if (filters.status !== 'all') {
      if (filters.status === 'late') {
        filteredData = filteredData.filter(att => att.late !== '-');
      } else {
        filteredData = filteredData.filter(att => att.status === filters.status);
      }
    }
    
    // Filter by time range
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

  // Get filtered employees based on department
  const getFilteredEmployees = () => {
    if (filters.department === 'all') return employees;
    return employees.filter(emp => emp.department === filters.department);
  };

  // Calculate statistics based on filtered data
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
    
    const totalBreaks = breaks.length;
    const totalHolidays = holidays.length;
    const totalLeavesTaken = employeeLeaves.reduce((sum, leave) => sum + leave.totalTaken, 0);

    // Monthly stats from filtered data
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

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HR Attendance Management</h1>
              <p className="text-gray-600">
                {employeeView === 'detail' && selectedEmployee 
                  ? `Viewing ${selectedEmployee.name}'s attendance` 
                  : 'Track attendance, breaks, holidays, and employee leaves'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-200">
                <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">HR Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {employeeView === 'list' && (
          <>
            <div className="flex space-x-1 bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mb-8">
              {['overview', 'employees', 'breaks', 'holidays', 'leaves'].map(tab => (
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Present Today */}
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

              {/* On Leave */}
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

              {/* Monthly Attendance */}
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

              {/* Late Arrivals */}
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
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
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
                onManualAttendance={handleManualAttendance}
                attendanceSearch={attendanceSearch}
                setAttendanceSearch={setAttendanceSearch}
                attendanceFilter={attendanceFilter}
                setAttendanceFilter={setAttendanceFilter}
                attendanceSort={attendanceSort}
                setAttendanceSort={setAttendanceSort}
                getFilteredAndSortedAttendance={getFilteredAndSortedAttendance}
                handleBulkStatusUpdate={handleBulkStatusUpdate}
                handleQuickAttendance={handleQuickAttendance}
                editingAttendance={editingAttendance}
                setEditingAttendance={setEditingAttendance}
                employees={employees}
              />
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
            {activeTab === 'holidays' && (
              <HolidaysManagement 
                holidays={holidays}
                onAddHoliday={handleAddHoliday}
                onDeleteHoliday={handleDeleteHoliday}
              />
            )}
            {activeTab === 'leaves' && (
              <LeavesSummary 
                employees={employees} 
                employeeLeaves={employeeLeaves}
                onApproveLeave={handleApproveLeave}
              />
            )}
          </>
        )}

        {/* Employee Detail View */}
        {employeeView === 'detail' && selectedEmployee && (
          <EmployeeDetailView 
            employee={selectedEmployee} 
            onBack={() => setEmployeeView('list')}
            attendanceData={attendanceData}
            holidays={holidays}
            employeeLeaves={employeeLeaves}
            onManualAttendance={handleManualAttendance}
          />
        )}
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => {
          setIsAddEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        onAddEmployee={editingEmployee ? handleEditEmployee : handleAddEmployee}
        editingEmployee={editingEmployee}
      />

      {/* Edit Attendance Modal */}
      {editingAttendance && (
        <EditAttendanceModal
          employee={employees.find(emp => emp.id === editingAttendance)}
          attendance={attendanceData.find(att => 
            att.employeeId === editingAttendance && att.date === selectedDate
          )}
          date={selectedDate}
          onSave={(newStatus, checkIn, checkOut) => {
            handleManualAttendance(editingAttendance, selectedDate, newStatus, checkIn, checkOut);
            setEditingAttendance(null);
          }}
          onClose={() => setEditingAttendance(null)}
        />
      )}

      {/* Notifications */}
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