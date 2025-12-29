const pool = require('../../config/database');

// Record Check In
exports.checkIn = async (req, res) => {
  try {
    const { employee_id, email, name, device_info, ip_address } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!employee_id || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, email, and name are required'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if attendance record already exists for today
      const [existingAttendance] = await connection.query(
        `SELECT id, check_in_time FROM Employee_Attendance WHERE employee_id = ? AND attendance_date = ?`,
        [employee_id, today]
      );

      if (existingAttendance.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Already checked in today'
        });
      }

      const checkInTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
      
      // Night shift time calculations
      // Working hours: 21:00 (9 PM) to 06:00 (6 AM)
      // Grace period: Until 22:15 (9:15 PM)
      const [checkInHour, checkInMin, checkInSec] = checkInTime.split(':').map(Number);
      const checkInTotalMinutes = checkInHour * 60 + checkInMin;
      
      // 22:15 = 22*60 + 15 = 1335 minutes from midnight
      const gracePeriodEnd = 22 * 60 + 15; // 1335 minutes
      
      let isLate = false;
      let lateByMinutes = 0;
      let status = 'Present';
      let onTime = 1; // Default to on time
      
      // Check if check-in is after 22:15
      if (checkInTotalMinutes > gracePeriodEnd) {
        isLate = true;
        lateByMinutes = checkInTotalMinutes - gracePeriodEnd;
        status = 'Late';
        onTime = 0;
        console.log(`⏱️ Late Check In: ${name} at ${checkInTime} (${lateByMinutes} minutes late)`);
      } else {
        console.log(`✅ On Time Check In: ${name} at ${checkInTime}`);
      }

      // Create new attendance record
      const [result] = await connection.query(
        `INSERT INTO Employee_Attendance 
         (employee_id, email, name, attendance_date, check_in_time, status, on_time, late_by_minutes, device_info, ip_address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, email, name, today, checkInTime, status, onTime, lateByMinutes, device_info || null, ip_address || null]
      );

      console.log(`✅ Check In: ${name} (${email}) at ${checkInTime}`);

      res.status(201).json({
        success: true,
        message: 'Check in successful',
        data: {
          id: result.insertId,
          employee_id,
          name,
          email,
          check_in_time: checkInTime,
          attendance_date: today,
          status,
          isLate,
          lateByMinutes,
          onTime
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Check In error:', error);
    res.status(500).json({
      success: false,
      message: 'Check in failed',
      error: error.message
    });
  }
};

// Record Check Out
exports.checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get today's attendance record
      const [attendanceRecord] = await connection.query(
        `SELECT id, check_in_time, total_break_duration_minutes FROM Employee_Attendance 
         WHERE employee_id = ? AND attendance_date = ? AND check_out_time IS NULL`,
        [employee_id, today]
      );

      if (attendanceRecord.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active check in found for today'
        });
      }

      const checkOutTime = new Date().toTimeString().split(' ')[0];
      const attendanceId = attendanceRecord[0].id;
      const checkInTime = attendanceRecord[0].check_in_time;
      const totalBreakMinutes = attendanceRecord[0].total_break_duration_minutes || 0;

      // Calculate working times
      const checkInDate = new Date(`${today}T${checkInTime}`);
      const checkOutDate = new Date(`${today}T${checkOutTime}`);
      const grossWorkingMinutes = Math.floor((checkOutDate - checkInDate) / 60000);
      const netWorkingMinutes = grossWorkingMinutes - totalBreakMinutes;
      
      // Calculate overtime only if checkout is after 6 AM
      // Parse checkout time to check if it's after 06:00
      const [checkOutHour, checkOutMin] = checkOutTime.split(':').map(Number);
      const isAfter6AM = checkOutHour >= 6;
      
      const expectedWorkingMinutes = 540; // 9 hours
      let overtimeMinutes = 0;
      let overtimeHours = 0;
      
      if (isAfter6AM) {
        overtimeMinutes = Math.max(0, netWorkingMinutes - expectedWorkingMinutes);
        overtimeHours = (overtimeMinutes / 60).toFixed(2);
        console.log(`📊 Overtime calculated (checkout after 6 AM): ${overtimeMinutes} minutes`);
      } else {
        console.log(`⏱️ No overtime counted (checkout before 6 AM at ${checkOutTime})`);
      }

      // Update attendance record
      await connection.query(
        `UPDATE Employee_Attendance 
         SET check_out_time = ?,
             gross_working_time_minutes = ?,
             net_working_time_minutes = ?,
             overtime_minutes = ?,
             overtime_hours = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [checkOutTime, grossWorkingMinutes, netWorkingMinutes, overtimeMinutes, overtimeHours, attendanceId]
      );

      console.log(`✅ Check Out: Employee ${employee_id} at ${checkOutTime}`);

      res.status(200).json({
        success: true,
        message: 'Check out successful',
        data: {
          id: attendanceId,
          employee_id,
          check_out_time: checkOutTime,
          gross_working_time_minutes: grossWorkingMinutes,
          net_working_time_minutes: netWorkingMinutes,
          overtime_hours: parseFloat(overtimeHours),
          attendance_date: today
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Check Out error:', error);
    res.status(500).json({
      success: false,
      message: 'Check out failed',
      error: error.message
    });
  }
};

// Record Break
exports.recordBreak = async (req, res) => {
  try {
    const { employee_id, break_type, break_start_time, break_end_time, break_duration_minutes, reason } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (!employee_id || !break_type) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and break type are required'
      });
    }

    const validBreakTypes = ['Smoke', 'Dinner', 'Washroom', 'Prayer', 'Other'];
    if (!validBreakTypes.includes(break_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid break type'
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get today's attendance record
      const [attendanceRecord] = await connection.query(
        `SELECT id, check_in_time FROM Employee_Attendance 
         WHERE employee_id = ? AND attendance_date = ? AND check_out_time IS NULL`,
        [employee_id, today]
      );

      if (attendanceRecord.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active check in found for today'
        });
      }

      const attendanceId = attendanceRecord[0].id;
      const breakStart = break_start_time || new Date().toTimeString().split(' ')[0];
      const breakEnd = break_end_time || new Date().toTimeString().split(' ')[0];

      // Use provided duration or calculate it
      let breakDurationMinutes = break_duration_minutes;
      
      if (!breakDurationMinutes || breakDurationMinutes < 0) {
        // Calculate break duration as fallback
        const breakStartDate = new Date(`${today}T${breakStart}`);
        const breakEndDate = new Date(`${today}T${breakEnd}`);
        breakDurationMinutes = Math.floor((breakEndDate - breakStartDate) / 60000);
      }
      
      console.log('💾 Recording break - Duration sent by frontend:', break_duration_minutes, 'Calculated:', breakDurationMinutes);

      // Insert break record
      const [breakResult] = await connection.query(
        `INSERT INTO Employee_Breaks 
         (attendance_id, employee_id, break_type, break_start_time, break_end_time, break_duration_minutes, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [attendanceId, employee_id, break_type, breakStart, breakEnd, breakDurationMinutes, reason || null]
      );

      // Update attendance record with break count
      const fieldMap = {
        'Smoke': 'smoke_break_count',
        'Dinner': 'dinner_break_count',
        'Washroom': 'washroom_break_count',
        'Prayer': 'prayer_break_count',
        'Other': 'smoke_break_count'  // Default to smoke for Other types
      };

      const breakCountField = fieldMap[break_type];
      
      // Only update specific break duration field if it exists for this type
      let updateQueryParts;
      let queryParams;

      if (['Smoke', 'Dinner', 'Washroom', 'Prayer'].includes(break_type)) {
        const breakDurationField = break_type.toLowerCase() + '_break_duration_minutes';
        
        updateQueryParts = [
          'UPDATE Employee_Attendance',
          'SET total_breaks_taken = total_breaks_taken + 1,',
          `    ${breakCountField} = ${breakCountField} + 1,`,
          `    ${breakDurationField} = ${breakDurationField} + ?,`,
          '    total_break_duration_minutes = total_break_duration_minutes + ?,',
          '    updated_at = NOW()',
          'WHERE id = ?'
        ];
        queryParams = [breakDurationMinutes, breakDurationMinutes, attendanceId];
      } else {
        // For 'Other' type, only update total breaks and total duration
        updateQueryParts = [
          'UPDATE Employee_Attendance',
          'SET total_breaks_taken = total_breaks_taken + 1,',
          '    total_break_duration_minutes = total_break_duration_minutes + ?,',
          '    updated_at = NOW()',
          'WHERE id = ?'
        ];
        queryParams = [breakDurationMinutes, attendanceId];
      }
      
      const updateQuery = updateQueryParts.join('\n');
      
      console.log('🔍 Update Query:', updateQuery);
      console.log('📊 Parameters:', queryParams);
      
      await connection.query(updateQuery, queryParams);

      console.log(`✅ Break Recorded: ${break_type} for employee ${employee_id} (${breakDurationMinutes} min)`);

      res.status(201).json({
        success: true,
        message: 'Break recorded successfully',
        data: {
          id: breakResult.insertId,
          employee_id,
          break_type,
          break_start_time: breakStart,
          break_end_time: breakEnd,
          break_duration_minutes: breakDurationMinutes
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Record Break error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record break',
      error: error.message
    });
  }
};

// Get Today's Attendance
exports.getTodayAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const connection = await pool.getConnection();

    try {
      const [attendance] = await connection.query(
        `SELECT * FROM Employee_Attendance WHERE employee_id = ? AND attendance_date = ?`,
        [employee_id, today]
      );

      if (attendance.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No attendance record for today'
        });
      }

      const record = attendance[0];
      const [breaks] = await connection.query(
        `SELECT * FROM Employee_Breaks WHERE attendance_id = ? ORDER BY break_start_time ASC`,
        [record.id]
      );

      res.status(200).json({
        success: true,
        message: 'Today attendance data',
        data: {
          ...record,
          breaks: breaks
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get Today Attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data',
      error: error.message
    });
  }
};

// Get Monthly Attendance Summary
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { year, month } = req.query;

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const connection = await pool.getConnection();

    try {
      const [monthlyData] = await connection.query(
        `SELECT * FROM Employee_Attendance 
         WHERE employee_id = ? AND YEAR(attendance_date) = ? AND MONTH(attendance_date) = ?
         ORDER BY attendance_date ASC`,
        [employee_id, currentYear, currentMonth]
      );

      res.status(200).json({
        success: true,
        message: 'Monthly attendance data',
        data: monthlyData,
        summary: {
          year: currentYear,
          month: currentMonth,
          total_days: monthlyData.length,
          present_days: monthlyData.filter(r => r.status === 'Present').length,
          absent_days: monthlyData.filter(r => r.status === 'Absent').length,
          late_days: monthlyData.filter(r => r.status === 'Late').length
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get Monthly Attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly attendance',
      error: error.message
    });
  }
};

// Get All Attendance Records (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status, limit = 50, page = 1 } = req.query;

    const connection = await pool.getConnection();

    try {
      let query = `SELECT * FROM Employee_Attendance WHERE 1=1`;
      const params = [];

      if (date) {
        query += ` AND attendance_date = ?`;
        params.push(date);
      }

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY attendance_date DESC, employee_id ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const [attendance] = await connection.query(query, params);

      // Fetch breaks for each attendance record
      const attendanceWithBreaks = await Promise.all(
        attendance.map(async (record) => {
          const [breaks] = await connection.query(
            `SELECT id, break_type, break_start_time, break_end_time, break_duration_minutes, reason 
             FROM Employee_Breaks 
             WHERE attendance_id = ? 
             ORDER BY break_start_time ASC`,
            [record.id]
          );
          
          return {
            ...record,
            breaks: breaks || [],
            total_breaks_count: breaks ? breaks.length : 0
          };
        })
      );

      res.status(200).json({
        success: true,
        message: 'All attendance records',
        data: attendanceWithBreaks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: attendanceWithBreaks.length
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get All Attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get All Attendance with Absent Records (includes all employees)
exports.getAllAttendanceWithAbsent = async (req, res) => {
  try {
    const { date, status, limit = 100, page = 1 } = req.query;

    const connection = await pool.getConnection();

    try {
      // First get all active employees
      const [allEmployees] = await connection.query(
        `SELECT id, employee_id, name, email, department, status FROM employee_onboarding WHERE status = 'Active'`
      );

      let attendanceQuery = `SELECT * FROM Employee_Attendance WHERE 1=1`;
      const attendanceParams = [];

      if (date) {
        attendanceQuery += ` AND attendance_date = ?`;
        attendanceParams.push(date);
      }

      if (status) {
        attendanceQuery += ` AND status = ?`;
        attendanceParams.push(status);
      }

      attendanceQuery += ` ORDER BY attendance_date DESC, employee_id ASC`;

      const [attendance] = await connection.query(attendanceQuery, attendanceParams);

      // Fetch breaks for each attendance record
      const attendanceWithBreaks = await Promise.all(
        attendance.map(async (record) => {
          const [breaks] = await connection.query(
            `SELECT id, break_type, break_start_time, break_end_time, break_duration_minutes, reason 
             FROM Employee_Breaks 
             WHERE attendance_id = ? 
             ORDER BY break_start_time ASC`,
            [record.id]
          );
          
          return {
            ...record,
            breaks: breaks || [],
            total_breaks_count: breaks ? breaks.length : 0
          };
        })
      );

      // If date filter is applied, create absent records for employees who haven't checked in
      let completeAttendanceData = attendanceWithBreaks;
      
      if (date) {
        const attendanceEmployeeIds = new Set(attendance.map(a => a.employee_id));
        
        // Add absent records for employees who didn't check in
        const absentRecords = allEmployees
          .filter(emp => !attendanceEmployeeIds.has(emp.id))
          .map(emp => ({
            id: null,
            employee_id: emp.id,
            email: emp.email,
            name: emp.name,
            attendance_date: date,
            check_in_time: null,
            check_out_time: null,
            status: 'Absent',
            total_breaks_taken: 0,
            smoke_break_count: 0,
            dinner_break_count: 0,
            washroom_break_count: 0,
            prayer_break_count: 0,
            smoke_break_duration_minutes: 0,
            dinner_break_duration_minutes: 0,
            washroom_break_duration_minutes: 0,
            prayer_break_duration_minutes: 0,
            total_break_duration_minutes: 0,
            gross_working_time_minutes: 0,
            net_working_time_minutes: 0,
            expected_working_time_minutes: 540,
            overtime_minutes: 0,
            overtime_hours: '0.00',
            on_time: 0,
            late_by_minutes: 0,
            remarks: 'No check-in',
            device_info: null,
            ip_address: null,
            created_at: null,
            updated_at: null,
            breaks: [],
            total_breaks_count: 0
          }));

        completeAttendanceData = [...attendanceWithBreaks, ...absentRecords].sort((a, b) => {
          if (a.name !== b.name) return a.name.localeCompare(b.name);
          return (a.status || 'Z').localeCompare(b.status || 'Z');
        });
      }

      // Apply pagination
      const startIdx = (parseInt(page) - 1) * parseInt(limit);
      const endIdx = startIdx + parseInt(limit);
      const paginatedData = completeAttendanceData.slice(startIdx, endIdx);

      res.status(200).json({
        success: true,
        message: 'All attendance records with absent status',
        data: paginatedData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: completeAttendanceData.length,
          total_active_employees: allEmployees.length
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get All Attendance With Absent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get Attendance Summary View
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;

    const connection = await pool.getConnection();

    try {
      let query = `SELECT * FROM Attendance_Summary_View WHERE 1=1`;
      const params = [];

      if (employee_id) {
        query += ` AND employee_id = ?`;
        params.push(employee_id);
      }

      if (start_date) {
        query += ` AND attendance_date >= ?`;
        params.push(start_date);
      }

      if (end_date) {
        query += ` AND attendance_date <= ?`;
        params.push(end_date);
      }

      const [summary] = await connection.query(query, params);

      res.status(200).json({
        success: true,
        message: 'Attendance summary',
        data: summary
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get Attendance Summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance summary',
      error: error.message
    });
  }
};

// Get Overtime Report
exports.getOvertimeReport = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;

    const connection = await pool.getConnection();

    try {
      let query = `SELECT * FROM Overtime_Report_View WHERE 1=1`;
      const params = [];

      if (employee_id) {
        query += ` AND employee_id = ?`;
        params.push(employee_id);
      }

      if (start_date) {
        query += ` AND attendance_date >= ?`;
        params.push(start_date);
      }

      if (end_date) {
        query += ` AND attendance_date <= ?`;
        params.push(end_date);
      }

      const [overtimeData] = await connection.query(query, params);

      // Calculate totals
      const totalOvertimeMinutes = overtimeData.reduce((sum, row) => sum + (row.overtime_minutes || 0), 0);
      const totalOvertimeHours = (totalOvertimeMinutes / 60).toFixed(2);

      res.status(200).json({
        success: true,
        message: 'Overtime report',
        data: overtimeData,
        summary: {
          total_overtime_hours: parseFloat(totalOvertimeHours),
          total_overtime_days: overtimeData.length,
          average_overtime_per_day: (totalOvertimeHours / overtimeData.length).toFixed(2)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
      console.error('❌ Get Overtime Report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overtime report',
      error: error.message
    });
  }
};

// Get all breaks
exports.getAllBreaks = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      const [breaks] = await connection.query(
        `SELECT eb.*, eo.name as employee_name 
         FROM Employee_Breaks eb
         LEFT JOIN employee_onboarding eo ON eb.employee_id = eo.id
         ORDER BY eb.break_start_time DESC`
      );

      res.status(200).json({
        success: true,
        message: 'All breaks retrieved successfully',
        data: breaks,
        count: breaks.length
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Get All Breaks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breaks',
      error: error.message
    });
  }
};