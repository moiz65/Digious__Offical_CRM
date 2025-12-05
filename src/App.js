// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import HrAttendance from './pages/HrAttendance';
import SuperAttendance from './pages/SuperAttendance';
import SuperDashboard from './pages/SuperDashboard';
import ActivityTracker from './pages/ActivityTracker';
import EmployeeAttendance from './pages/EmployeeAtt';
import Employees from './pages/Employee';
import EmployeeDetails from './pages/EmployeeDetails';
import ApplicationandMemos from './pages/ApplicationandMemos';
import ApplicationandMemoEmployees from './pages/ApplicationandMemoEmployees';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Protected routes - will add authentication later */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/superdashboard" element={<SuperDashboard />} />
          <Route path="/hrattendance" element={<HrAttendance />} />
          <Route path="/superAttendance" element={<SuperAttendance />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/activity-tracker" element={<ActivityTracker />} />
          <Route path="/testdashboard" element={<ActivityTracker />} /> 
          <Route path="/employeeattendance" element={<EmployeeAttendance />} /> 
          <Route path="/employees" element={<Employees />} /> 
          <Route path="/employeedetails" element={<EmployeeDetails />} />
          <Route path="/application-memos" element={<ApplicationandMemos />} />
          <Route path="/applications-memos" element={<ApplicationandMemoEmployees />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Simple 404 page
const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a 
        href="/login" 
        className="inline-flex items-center px-6 py-3 bg-[#349dff] text-white font-medium rounded-xl hover:bg-[#1e87e6] transition duration-200"
      >
        Go to Login
      </a>
    </div>
  </div>
);

export default App;