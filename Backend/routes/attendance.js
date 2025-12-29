const express = require('express');
const router = express.Router();
const attendanceController = require('./controllers/attendanceController');
const authMiddleware = require('../middleware/auth');

// Employee Routes (Protected)
router.post('/check-in', authMiddleware, attendanceController.checkIn);
router.post('/check-out', authMiddleware, attendanceController.checkOut);
router.post('/break', authMiddleware, attendanceController.recordBreak);

// Get attendance data (Public for HR Dashboard)
router.get('/today/:employee_id', attendanceController.getTodayAttendance);
router.get('/monthly/:employee_id', attendanceController.getMonthlyAttendance);

// Admin Routes (Public for HR Dashboard)
router.get('/all-with-absent', attendanceController.getAllAttendanceWithAbsent); // New endpoint with absent records
router.get('/all', attendanceController.getAllAttendance);
router.get('/breaks', attendanceController.getAllBreaks);
router.get('/summary', authMiddleware, attendanceController.getAttendanceSummary);
router.get('/overtime', authMiddleware, attendanceController.getOvertimeReport);

module.exports = router;
