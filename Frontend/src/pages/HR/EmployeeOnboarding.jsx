import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HrSidebar from '../../components/HrSidebar';
import { 
  ArrowLeft, Save, Plus, CheckCircle, AlertCircle, Eye, EyeOff
} from 'lucide-react';

const EmployeeOnboarding = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('employees');
  const [showPassword, setShowPassword] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const departments = ['Sales', 'Marketing', 'Production', 'HR', 'Operations'];

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    position: '',
    joinDate: '',
    // Salary breakdown: baseSalary (required) + allowances[] (optional)
    baseSalary: '',
    allowances: [],
    allowanceName: '',
    allowanceAmount: '',
    address: '',
    emergencyContact: '',
    requestPasswordChange: false,
    bankAccount: '',
    taxId: '',
    designation: '',
    // Resource allocation (optional)
    keyboard: false,
    keyboardSerial: '',
    monitor: false,
    monitorSerial: '',
    other: false,
    otherName: '',
    otherSerial: '',
    resourcesNote: ''
  // add missing resource boolean fields (align reset behavior)
  ,
  laptop: false,
  laptopSerial: '',
  charger: false,
  chargerSerial: '',
  mouse: false,
  mouseSerial: ''
  });

  const [showResourcesSection, setShowResourcesSection] = useState(false);

  // ----- Form step helpers and validation -----
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      // very light email validation
      if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    }
    if (step === 2) {
      if (!formData.password || formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    if (step === 3) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.department) newErrors.department = 'Please select a department';
      if (!formData.position.trim()) newErrors.position = 'Position is required';
    }
    if (step === 4) {
      // Allowances are optional, no validation needed
    }
    if (step === 5) {
      if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
      if (!formData.baseSalary) newErrors.baseSalary = 'Base salary is required';
    }
    return newErrors;
  };

  const handleNextStep = () => {
    const newErrors = validateStep(onboardingStep);
    if (Object.keys(newErrors).length === 0) {
      setErrors({});
      setOnboardingStep(prev => prev + 1);
    } else {
      setErrors(newErrors);
    }
  };

  const handlePreviousStep = () => {
    setErrors({});
    setOnboardingStep(prev => Math.max(1, prev - 1));
  };

  // Form submission
  const handleSubmit = async () => {
    const newErrors = validateStep(4);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setOnboardingStep(4);
      return;
    }

    // Prepare data to send to backend
    const employeeDataForBackend = {
      ...formData,
      baseSalary: Number(formData.baseSalary || 0),
      allowances: formData.allowances, // Send allowances array
    };

    try {
      console.log('🔄 Sending employee data to backend...', employeeDataForBackend);
      
      const response = await fetch('http://localhost:5000/api/v1/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeDataForBackend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create employee');
      }

      // If successful, update local state
      const newEmployee = {
        id: employees.length + 1,
        ...formData,
        baseSalary: Number(formData.baseSalary || 0),
        totalCompensation: computeTotalSalary(),
        status: 'Active',
        avatar: null
      };
      setEmployees([...employees, newEmployee]);
      setSuccessMessage(`Employee ${formData.name} has been successfully onboarded!`);
      resetForm();
      setOnboardingStep(1);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('❌ Error saving employee:', error);
      setErrors({ submit: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      department: '',
      position: '',
      joinDate: '',
      baseSalary: '',
      allowances: [],
      allowanceName: '',
      allowanceAmount: '',
      address: '',
      emergencyContact: '',
      requestPasswordChange: false,
      bankAccount: '',
      taxId: '',
      designation: '',
      // Resource allocation fields reset
      laptop: false,
      laptopSerial: '',
      charger: false,
      chargerSerial: '',
      mouse: false,
      mouseSerial: '',
      keyboard: false,
      keyboardSerial: '',
      monitor: false,
      monitorSerial: '',
      other: false,
      otherName: '',
      otherSerial: '',
      resourcesNote: ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const addAllowance = () => {
    const name = formData.allowanceName.trim();
    const amount = Number(formData.allowanceAmount);
    if (!name || !amount || Number.isNaN(amount)) return;
    setFormData({
      ...formData,
      allowances: [...formData.allowances, { name, amount }],
      allowanceName: '',
      allowanceAmount: ''
    });
  };

  const removeAllowance = (index) => {
    const list = [...formData.allowances];
    list.splice(index, 1);
    setFormData({ ...formData, allowances: list });
  };

  const computeTotalSalary = () => {
    const base = Number(formData.baseSalary || 0);
    const allowances = formData.allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);
    return base + allowances;
  };

  const stepTitles = [
    'Basic Information',
    'Security Setup',
    'Job Details',
    'Allowances',
    'Additional Information',
    'Review & Confirm'
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <HrSidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
                        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hr/employees')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
                <p className="text-gray-500 text-sm mt-1">Complete onboarding process for new employees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                {stepTitles.map((title, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        index + 1 === onboardingStep
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110'
                          : index + 1 < onboardingStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1 < onboardingStep ? '✓' : index + 1}
                    </div>
                    <p className={`text-xs font-medium mt-2 text-center ${
                      index + 1 <= onboardingStep ? 'text-slate-800' : 'text-gray-500'
                    }`}>
                      {title}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${((onboardingStep - 1) / (stepTitles.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              {/* Step 1: Basic Information */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                    <p className="text-gray-600 mt-2">Enter the employee's basic details</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Employee ID *</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        placeholder="EMP-001"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.employeeId ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.employeeId && <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.name ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@company.com"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Security Setup */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Security Setup</h2>
                    <p className="text-gray-600 mt-2">Create a secure password for the employee account</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter temporary password (min 8 characters)"
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                            errors.password ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="requestPasswordChange"
                          checked={formData.requestPasswordChange}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Request password change on first login</p>
                          <p className="text-xs text-gray-500">Employee must change password after their first login</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Job Details */}
              {onboardingStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
                    <p className="text-gray-600 mt-2">Enter job-related information</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.department ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Position *</label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        placeholder="e.g. Manager, Developer"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.position ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. Senior Manager"
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Allowances */}
              {onboardingStep === 4 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Allowances</h2>
                    <p className="text-gray-600 mt-2">Add any additional allowances (optional)</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Allowance Name</label>
                            <input
                              type="text"
                              name="allowanceName"
                              value={formData.allowanceName}
                              onChange={handleInputChange}
                              placeholder="e.g., Housing Allowance"
                              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                            <input
                              type="number"
                              name="allowanceAmount"
                              value={formData.allowanceAmount}
                              onChange={handleInputChange}
                              placeholder="5000"
                              className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={addAllowance}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Allowance
                        </button>
                      </div>
                    </div>

                    {formData.allowances.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Current Allowances</h3>
                        {formData.allowances.map((allowance, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                              <p className="font-semibold text-gray-900">{allowance.name}</p>
                              <p className="text-sm text-gray-600">${Number(allowance.amount).toLocaleString()}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAllowance(index)}
                              className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Additional Information */}
              {onboardingStep === 5 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                    <p className="text-gray-600 mt-2">Complete onboarding with additional details</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Join Date *</label>
                      <input
                        type="date"
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.joinDate ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Base Salary *</label>
                      <input
                        type="number"
                        name="baseSalary"
                        value={formData.baseSalary}
                        onChange={handleInputChange}
                        placeholder="75000"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.baseSalary ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.baseSalary && <p className="text-red-500 text-sm mt-1">{errors.baseSalary}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Emergency Contact</label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 987-6543"
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tax ID</label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        placeholder="e.g. SSN or Tax ID"
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main St, City, State, ZIP"
                        rows="3"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.address ? 'border-red-500 focus:ring-red-500' : 'border-blue-200 focus:ring-blue-500'
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Account</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleInputChange}
                        placeholder="Bank account number (optional)"
                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Resource Allocation optional section */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Resource Allocation (optional)</label>
                          <p className="text-xs text-gray-500">Select any resources issued to the employee and add serial numbers or notes.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowResourcesSection(!showResourcesSection)}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {showResourcesSection ? 'Hide' : 'Add resources'}
                        </button>
                      </div>

                      {showResourcesSection && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="laptop" checked={formData.laptop} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Laptop</span>
                            </label>
                            <div>
                              {formData.laptop && (
                                <input type="text" name="laptopSerial" value={formData.laptopSerial} onChange={handleInputChange} placeholder="Laptop serial / model" className="w-full px-3 py-2 border rounded-md" />
                              )}
                            </div>

                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="charger" checked={formData.charger} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Charger</span>
                            </label>
                            <div>
                              {formData.charger && (
                                <input type="text" name="chargerSerial" value={formData.chargerSerial} onChange={handleInputChange} placeholder="Charger serial" className="w-full px-3 py-2 border rounded-md" />
                              )}
                            </div>

                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="mouse" checked={formData.mouse} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Mouse</span>
                            </label>
                            <div>
                              {formData.mouse && (
                                <input type="text" name="mouseSerial" value={formData.mouseSerial} onChange={handleInputChange} placeholder="Mouse serial" className="w-full px-3 py-2 border rounded-md" />
                              )}
                            </div>

                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="keyboard" checked={formData.keyboard} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Keyboard</span>
                            </label>
                            <div>
                              {formData.keyboard && (
                                <input type="text" name="keyboardSerial" value={formData.keyboardSerial} onChange={handleInputChange} placeholder="Keyboard serial" className="w-full px-3 py-2 border rounded-md" />
                              )}
                            </div>

                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="monitor" checked={formData.monitor} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Monitor</span>
                            </label>
                            <div>
                              {formData.monitor && (
                                <input type="text" name="monitorSerial" value={formData.monitorSerial} onChange={handleInputChange} placeholder="Monitor serial" className="w-full px-3 py-2 border rounded-md" />
                              )}
                            </div>

                            <label className="flex items-center gap-3">
                              <input type="checkbox" name="other" checked={formData.other} onChange={handleInputChange} className="w-4 h-4" />
                              <span className="font-medium text-gray-700">Other</span>
                            </label>
                            <div>
                              {formData.other && (
                                <>
                                  <input type="text" name="otherName" value={formData.otherName} onChange={handleInputChange} placeholder="Other resource name" className="w-full px-3 py-2 border rounded-md mb-2" />
                                  <input type="text" name="otherSerial" value={formData.otherSerial} onChange={handleInputChange} placeholder="Other serial" className="w-full px-3 py-2 border rounded-md" />
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                            <textarea name="resourcesNote" value={formData.resourcesNote} onChange={handleInputChange} placeholder="Add notes about the resource allocation or special instructions" className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 border-blue-200" rows={3} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Confirm */}
              {onboardingStep === 6 && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
                    <p className="text-gray-600 mt-2">Please review all information before submitting</p>
                  </div>

                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700 font-medium">{errors.submit}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Employee ID</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.employeeId}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Full Name</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Email</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Department</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.department}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Position</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.position}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Join Date</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.joinDate}</p>
                    </div>
                    <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Salary Breakdown</p>
                      <div className="mt-3 space-y-3 p-3 bg-white rounded-lg border border-gray-200">
                        {/* Base Salary */}
                        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-700">Base Salary:</p>
                          <p className="text-sm font-bold text-gray-900">PKR {Number(formData.baseSalary || 0).toLocaleString()}</p>
                        </div>

                        {/* Allowed Allowances */}
                        {formData.allowances && formData.allowances.length > 0 && (
                          <>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Allowed Allowances:</p>
                              {formData.allowances.map((a, i) => (
                                <div key={i} className="flex justify-between items-center text-sm ml-2 pl-2 border-l-2 border-blue-300">
                                  <span className="text-gray-700">{a.name}</span>
                                  <span className="font-semibold text-gray-900">PKR {Number(a.amount || 0).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Allowances Subtotal */}
                            <div className="flex justify-between items-center py-2 px-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-sm font-semibold text-gray-700">Total Allowances:</p>
                              <p className="text-sm font-bold text-blue-600">PKR {formData.allowances.reduce((sum, a) => sum + (Number(a.amount || 0)), 0).toLocaleString()}</p>
                            </div>
                          </>
                        )}

                        {/* Total Compensation */}
                        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-400">
                          <p className="text-sm font-bold text-gray-900">Total Compensation:</p>
                          <p className="text-lg font-bold text-green-600">PKR {computeTotalSalary().toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.phone}</p>
                    </div>
                    <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Address</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">{formData.address}</p>
                    </div>

                    {formData.requestPasswordChange && (
                      <div className="col-span-2 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-semibold text-orange-900">Password change required</p>
                          <p className="text-sm text-orange-700">Employee must change password on first login</p>
                        </div>
                      </div>
                    )}

                    {(
                      formData.laptop || formData.charger || formData.mouse || formData.keyboard || formData.monitor || formData.other
                    ) && (
                      <div className="col-span-2 p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Resources Issued</p>
                        <div className="mt-3 grid gap-2">
                          {formData.laptop && (
                            <div className="flex items-center justify-between text-sm">
                              <div>Laptop {formData.laptopSerial && `• ${formData.laptopSerial}`}</div>
                            </div>
                          )}
                          {formData.charger && (
                            <div className="flex items-center justify-between text-sm">Charger {formData.chargerSerial && `• ${formData.chargerSerial}`}</div>
                          )}
                          {formData.mouse && (
                            <div className="flex items-center justify-between text-sm">Mouse {formData.mouseSerial && `• ${formData.mouseSerial}`}</div>
                          )}
                          {formData.keyboard && (
                            <div className="flex items-center justify-between text-sm">Keyboard {formData.keyboardSerial && `• ${formData.keyboardSerial}`}</div>
                          )}
                          {formData.monitor && (
                            <div className="flex items-center justify-between text-sm">Monitor {formData.monitorSerial && `• ${formData.monitorSerial}`}</div>
                          )}
                          {formData.other && (
                            <div className="flex items-center justify-between text-sm">{formData.otherName} {formData.otherSerial && `• ${formData.otherSerial}`}</div>
                          )}
                          {formData.resourcesNote && (
                            <div className="text-sm text-gray-700 mt-2">Note: {formData.resourcesNote}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 mt-10 pt-8 border-t border-gray-200">
                <button
                  onClick={handlePreviousStep}
                  disabled={onboardingStep === 1}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                    onboardingStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                {onboardingStep === 6 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    Complete Onboarding
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Recently Onboarded Employees Table */}
            {employees.length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Onboarded Employees</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <th className="px-6 py-4 text-left text-sm font-semibold">Employee ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Position</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Base Salary</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Total Compensation</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Resources</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp, index) => (
                          <tr key={emp.id} className={`border-t border-gray-200 hover:bg-blue-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{emp.employeeId}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{emp.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">PKR {Number(emp.baseSalary || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">PKR {Number(emp.totalCompensation || emp.baseSalary || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">
                              {(
                                (emp.laptop ? 1 : 0) +
                                (emp.charger ? 1 : 0) +
                                (emp.mouse ? 1 : 0) +
                                (emp.keyboard ? 1 : 0) +
                                (emp.monitor ? 1 : 0) +
                                (emp.other ? 1 : 0)
                              ) > 0 ? (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  {(
                                    (emp.laptop ? 1 : 0) +
                                    (emp.charger ? 1 : 0) +
                                    (emp.mouse ? 1 : 0) +
                                    (emp.keyboard ? 1 : 0) +
                                    (emp.monitor ? 1 : 0) +
                                    (emp.other ? 1 : 0)
                                  )} items
                                </span>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;
