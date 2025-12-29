-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 29, 2025 at 08:21 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Digious_CRM_DataBase`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_users_view`
-- (See below for the actual view)
--
CREATE TABLE `active_users_view` (
`id` int(11)
,`employee_id` int(11)
,`email` varchar(255)
,`name` varchar(255)
,`login_time` timestamp
,`device_type` enum('PC','Mobile','Tablet','Other')
,`device_name` varchar(255)
,`ip_address` varchar(45)
,`hostname` varchar(255)
,`mac_address` varchar(17)
,`browser` varchar(100)
,`os` varchar(100)
,`country` varchar(100)
,`city` varchar(100)
,`last_activity_time` timestamp
,`logged_in_minutes` bigint(21)
,`is_active` tinyint(1)
);

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','super_admin') NOT NULL DEFAULT 'admin',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'admin@digious.com', '$2a$12$JL.6SvsJzd4N1Sa4iv26Yubf1G12Q4JRHBJ8KEOSokIaJT6ixK9VO', 'Administrator', '03100000000', 'super_admin', 'Active', '2025-12-28 16:04:33', '2025-12-29 17:06:53');

-- --------------------------------------------------------

--
-- Stand-in structure for view `Attendance_Summary_View`
-- (See below for the actual view)
--
CREATE TABLE `Attendance_Summary_View` (
`employee_id` int(11)
,`name` varchar(100)
,`email` varchar(100)
,`attendance_date` date
,`check_in_time` time
,`check_out_time` time
,`status` enum('Present','Absent','Late','On Leave','Half Day')
,`total_breaks_taken` int(11)
,`total_break_duration_minutes` int(11)
,`gross_working_time` varchar(26)
,`net_working_time` varchar(26)
,`overtime_hours` decimal(5,2)
,`on_time` tinyint(1)
,`late_by_minutes` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `Company_Rules`
--

CREATE TABLE `Company_Rules` (
  `id` int(11) NOT NULL,
  `rule_name` varchar(100) NOT NULL,
  `rule_type` enum('WORKING_HOURS','BREAK_TIME','OVERTIME','LEAVE') NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `total_hours` int(11) DEFAULT NULL,
  `break_duration_minutes` int(11) DEFAULT NULL,
  `break_type` varchar(50) DEFAULT NULL,
  `overtime_starts_after_minutes` int(11) DEFAULT NULL,
  `overtime_multiplier` decimal(3,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `priority` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Company_Rules`
--

INSERT INTO `Company_Rules` (`id`, `rule_name`, `rule_type`, `description`, `start_time`, `end_time`, `total_hours`, `break_duration_minutes`, `break_type`, `overtime_starts_after_minutes`, `overtime_multiplier`, `is_active`, `priority`, `created_at`, `updated_at`) VALUES
(1, 'Office Working Hours - Night Shift', 'WORKING_HOURS', 'Office working hours from 21:00 (9 PM) to 06:00 (6 AM)', '21:00:00', '06:00:00', 9, NULL, NULL, NULL, NULL, 1, 1, '2025-12-23 16:25:46', '2025-12-23 16:25:46'),
(2, 'Smoke Break', 'BREAK_TIME', 'Smoke break allowed during working hours', NULL, NULL, NULL, 5, 'Smoke Break', NULL, NULL, 1, 2, '2025-12-23 16:25:46', '2025-12-23 16:25:46'),
(3, 'Dinner Break', 'BREAK_TIME', 'Dinner/Lunch break during working hours', NULL, NULL, NULL, 60, 'Dinner Break', NULL, NULL, 1, 2, '2025-12-23 16:25:46', '2025-12-23 16:25:46'),
(4, 'Washroom Break', 'BREAK_TIME', 'Washroom/Restroom break', NULL, NULL, NULL, 10, 'Washroom Break', NULL, NULL, 1, 3, '2025-12-23 16:25:46', '2025-12-23 16:25:46'),
(5, 'Prayer Break', 'BREAK_TIME', 'Prayer break during working hours', NULL, NULL, NULL, 10, 'Prayer Break', NULL, NULL, 1, 3, '2025-12-23 16:25:46', '2025-12-23 16:25:46'),
(6, 'Overtime - Standard Rate', 'OVERTIME', 'Overtime payment after regular working hours (9 hours)', NULL, NULL, NULL, NULL, NULL, 540, 1.50, 1, 4, '2025-12-23 16:25:46', '2025-12-23 16:25:46');

-- --------------------------------------------------------

--
-- Table structure for table `Employee_Activities`
--

CREATE TABLE `Employee_Activities` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `location` varchar(100) DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_allowances`
--

CREATE TABLE `employee_allowances` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `allowance_name` varchar(100) NOT NULL,
  `allowance_amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_allowances`
--

INSERT INTO `employee_allowances` (`id`, `employee_id`, `allowance_name`, `allowance_amount`, `created_at`) VALUES
(1, 1, 'Happy Allowance', 1000.00, '2025-12-23 12:23:07'),
(2, 3, 'HA', 5000.00, '2025-12-27 12:54:12');

-- --------------------------------------------------------

--
-- Table structure for table `Employee_Attendance`
--

CREATE TABLE `Employee_Attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `status` enum('Present','Absent','Late','On Leave','Half Day') DEFAULT 'Absent',
  `total_breaks_taken` int(11) DEFAULT 0,
  `smoke_break_count` int(11) DEFAULT 0,
  `dinner_break_count` int(11) DEFAULT 0,
  `washroom_break_count` int(11) DEFAULT 0,
  `prayer_break_count` int(11) DEFAULT 0,
  `smoke_break_duration_minutes` int(11) DEFAULT 0,
  `dinner_break_duration_minutes` int(11) DEFAULT 0,
  `washroom_break_duration_minutes` int(11) DEFAULT 0,
  `prayer_break_duration_minutes` int(11) DEFAULT 0,
  `total_break_duration_minutes` int(11) DEFAULT 0,
  `gross_working_time_minutes` int(11) DEFAULT 0,
  `net_working_time_minutes` int(11) DEFAULT 0,
  `expected_working_time_minutes` int(11) DEFAULT 540,
  `overtime_minutes` int(11) DEFAULT 0,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `on_time` tinyint(1) DEFAULT 0,
  `late_by_minutes` int(11) DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Employee_Attendance`
--

INSERT INTO `Employee_Attendance` (`id`, `employee_id`, `email`, `name`, `attendance_date`, `check_in_time`, `check_out_time`, `status`, `total_breaks_taken`, `smoke_break_count`, `dinner_break_count`, `washroom_break_count`, `prayer_break_count`, `smoke_break_duration_minutes`, `dinner_break_duration_minutes`, `washroom_break_duration_minutes`, `prayer_break_duration_minutes`, `total_break_duration_minutes`, `gross_working_time_minutes`, `net_working_time_minutes`, `expected_working_time_minutes`, `overtime_minutes`, `overtime_hours`, `on_time`, `late_by_minutes`, `remarks`, `device_info`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 1, 'MH@gmail.com', 'MH', '2025-12-23', '22:50:30', '07:50:30', 'Present', 3, 3, 0, 0, 0, 15, 0, 0, 0, 15, 540, 525, 540, 0, 0.00, 1, 0, NULL, 'Linux', '127.0.0.1', '2025-12-23 17:50:30', '2025-12-28 13:29:41'),
(2, 2, 'MH@gmail.com', 'MH', '2025-12-23', '22:51:14', '22:56:22', 'Present', 3, 1, 1, 1, 0, 5, 30, 5, 0, 40, 5, -35, 540, 0, 0.00, 1, 0, NULL, 'Linux', '127.0.0.1', '2025-12-23 17:51:14', '2025-12-23 17:56:22'),
(5, 2, 'MH@gmail.com', 'MH', '2025-12-24', '22:15:44', '07:15:44', 'Present', 5, 4, 1, 0, 0, 5, 1, 0, 0, 6, 540, 534, 540, 0, 0.00, 1, 0, NULL, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '127.0.0.1', '2025-12-24 17:15:44', '2025-12-28 13:29:41'),
(6, 2, 'MH@gmail.com', 'MH', '2025-12-27', '16:29:11', '01:29:11', 'Present', 5, 2, 2, 1, 0, 3, 1, 0, 0, 4, 540, 536, 540, 0, 0.00, 1, 0, NULL, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '127.0.0.1', '2025-12-27 11:29:11', '2025-12-28 13:29:41'),
(7, 3, 'HR@gmail.com', 'HR', '2025-12-27', '18:36:49', '03:36:49', 'Present', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 540, 540, 0, 0.00, 1, 0, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', '2025-12-27 13:36:49', '2025-12-28 13:29:41'),
(8, 2, 'MH@gmail.com', 'MH', '2025-12-29', '21:53:28', NULL, 'Present', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 540, 0, 0.00, 1, 0, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '127.0.0.1', '2025-12-29 16:53:28', '2025-12-29 16:53:28');

-- --------------------------------------------------------

--
-- Table structure for table `Employee_Breaks`
--

CREATE TABLE `Employee_Breaks` (
  `id` int(11) NOT NULL,
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `break_type` enum('Smoke','Dinner','Washroom','Prayer','Other') NOT NULL,
  `break_start_time` time NOT NULL,
  `break_end_time` time DEFAULT NULL,
  `break_duration_minutes` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Employee_Breaks`
--

INSERT INTO `Employee_Breaks` (`id`, `attendance_id`, `employee_id`, `break_type`, `break_start_time`, `break_end_time`, `break_duration_minutes`, `reason`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Smoke', '10:00:00', '10:05:00', 5, 'Test', '2025-12-23 17:50:30', '2025-12-23 17:50:30'),
(2, 2, 2, 'Smoke', '10:00:00', '10:05:00', 5, 'Test break', '2025-12-23 17:51:24', '2025-12-23 17:51:24'),
(3, 2, 2, 'Dinner', '12:00:00', '12:30:00', 30, 'Lunch', '2025-12-23 17:51:59', '2025-12-23 17:51:59'),
(4, 2, 2, 'Washroom', '14:00:00', '14:05:00', 5, 'Restroom', '2025-12-23 17:51:59', '2025-12-23 17:51:59'),
(5, 1, 1, 'Smoke', '10:00:00', '10:05:00', 5, 'Test', '2025-12-23 18:03:40', '2025-12-23 18:03:40'),
(6, 1, 1, 'Smoke', '10:00:00', '10:05:00', 5, 'Test', '2025-12-23 18:04:50', '2025-12-23 18:04:50'),
(7, 5, 2, 'Smoke', '23:04:14', '23:08:16', 4, 'Smoke Break break', '2025-12-24 18:08:16', '2025-12-24 18:08:16'),
(8, 5, 2, 'Smoke', '23:12:07', '23:14:00', 1, 'Smoke Break break', '2025-12-24 18:14:00', '2025-12-24 18:14:00'),
(9, 5, 2, 'Smoke', '00:03:53', '00:04:12', 0, 'Smoke Break break', '2025-12-24 19:04:12', '2025-12-24 19:04:12'),
(10, 5, 2, 'Dinner', '00:04:27', '00:05:34', 1, 'Dinner Break break', '2025-12-24 19:05:34', '2025-12-24 19:05:34'),
(11, 5, 2, 'Smoke', '00:16:57', '00:17:05', 0, 'Smoke Break break', '2025-12-24 19:17:05', '2025-12-24 19:17:05'),
(12, 6, 2, 'Dinner', '16:29:34', '16:31:00', 1, 'Dinner Break break', '2025-12-27 11:31:00', '2025-12-27 11:31:00'),
(13, 6, 2, 'Washroom', '16:30:48', '16:31:03', 0, 'Washroom Break break', '2025-12-27 11:31:03', '2025-12-27 11:31:03'),
(14, 6, 2, 'Dinner', '16:38:42', '16:38:51', 0, 'Dinner Break break', '2025-12-27 11:38:51', '2025-12-27 11:38:51'),
(15, 6, 2, 'Smoke', '16:39:12', '16:41:20', 2, 'Smoke Break break', '2025-12-27 11:41:20', '2025-12-27 11:41:20'),
(16, 6, 2, 'Smoke', '17:15:48', '17:16:55', 1, 'Smoke Break break', '2025-12-27 12:16:55', '2025-12-27 12:16:55');

-- --------------------------------------------------------

--
-- Table structure for table `employee_dynamic_resources`
--

CREATE TABLE `employee_dynamic_resources` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `resource_name` varchar(100) NOT NULL,
  `resource_serial` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_onboarding`
--

CREATE TABLE `employee_onboarding` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_temp` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `department` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  `join_date` date NOT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `request_password_change` tinyint(1) DEFAULT 1,
  `bank_account` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `cnic` varchar(20) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `status` enum('Pending','Active','Inactive','Suspended') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_onboarding`
--

INSERT INTO `employee_onboarding` (`id`, `employee_id`, `name`, `email`, `password_temp`, `phone`, `department`, `position`, `join_date`, `address`, `emergency_contact`, `request_password_change`, `bank_account`, `tax_id`, `cnic`, `designation`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DIG-001', 'Muhammad Hunain', 'muhammad.hunain@digious.com', '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', '03183598103', 'Production', 'Software Engr', '2025-12-23', 'N.Nazimabad', '03123598003', 1, 'PKRIBAN123', '123456789', '4210151036535', 'Jr.', 'Active', '2025-12-23 12:23:07', '2025-12-29 15:18:20'),
(2, 'DIG-OO2', 'MH', 'MH@gmail.com', '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', '12345', 'Production', 'MD', '2025-12-23', 'karachi', '123456', 0, '1234qwert', '123456', '123456', 'SM', 'Active', '2025-12-23 13:10:56', '2025-12-29 15:18:20'),
(3, 'DIG-004', 'HR', 'HR@gmail.com', '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', '03435980052', 'HR', 'HR', '2025-12-27', 'qwerty', '0312398003', 0, 'pkriban12345', 'SSN123', '42101-5103653-5', 'HR', 'Active', '2025-12-27 12:54:12', '2025-12-29 15:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `employee_resources`
--

CREATE TABLE `employee_resources` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `laptop` tinyint(1) DEFAULT 0,
  `laptop_serial` varchar(100) DEFAULT NULL,
  `charger` tinyint(1) DEFAULT 0,
  `charger_serial` varchar(100) DEFAULT NULL,
  `mouse` tinyint(1) DEFAULT 0,
  `mouse_serial` varchar(100) DEFAULT NULL,
  `keyboard` tinyint(1) DEFAULT 0,
  `keyboard_serial` varchar(100) DEFAULT NULL,
  `monitor` tinyint(1) DEFAULT 0,
  `monitor_serial` varchar(100) DEFAULT NULL,
  `mobile` tinyint(1) DEFAULT 0,
  `mobile_serial` varchar(100) DEFAULT NULL,
  `resources_note` text DEFAULT NULL,
  `allocated_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `returned_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_resources`
--

INSERT INTO `employee_resources` (`id`, `employee_id`, `laptop`, `laptop_serial`, `charger`, `charger_serial`, `mouse`, `mouse_serial`, `keyboard`, `keyboard_serial`, `monitor`, `monitor_serial`, `mobile`, `mobile_serial`, `resources_note`, `allocated_date`, `returned_date`) VALUES
(1, 1, 1, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 'Good Condition', '2025-12-23 12:23:07', NULL),
(2, 2, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, '2025-12-23 13:10:56', NULL),
(3, 3, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, 0, NULL, NULL, '2025-12-27 12:54:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_salary`
--

CREATE TABLE `employee_salary` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `total_salary` decimal(12,2) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_salary`
--

INSERT INTO `employee_salary` (`id`, `employee_id`, `base_salary`, `total_salary`, `last_updated`) VALUES
(1, 1, 75000.00, 76000.00, '2025-12-23 12:23:07'),
(2, 2, 75000.00, 75000.00, '2025-12-23 13:10:56'),
(3, 3, 75000.00, 80000.00, '2025-12-27 12:54:12');

-- --------------------------------------------------------

--
-- Stand-in structure for view `Monthly_Attendance_Summary`
-- (See below for the actual view)
--
CREATE TABLE `Monthly_Attendance_Summary` (
`employee_id` int(11)
,`name` varchar(100)
,`email` varchar(100)
,`year` int(4)
,`month` int(2)
,`total_days` bigint(21)
,`present_days` decimal(22,0)
,`absent_days` decimal(22,0)
,`late_days` decimal(22,0)
,`leave_days` decimal(22,0)
,`attendance_rate` decimal(28,2)
,`on_time_rate` decimal(28,2)
,`total_working_minutes` decimal(32,0)
,`total_overtime_minutes` decimal(32,0)
,`total_break_minutes` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `onboarding_progress`
--

CREATE TABLE `onboarding_progress` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `step_1_basic_info` tinyint(1) DEFAULT 0,
  `step_1_completed_at` timestamp NULL DEFAULT NULL,
  `step_2_security_setup` tinyint(1) DEFAULT 0,
  `step_2_completed_at` timestamp NULL DEFAULT NULL,
  `step_3_job_details` tinyint(1) DEFAULT 0,
  `step_3_completed_at` timestamp NULL DEFAULT NULL,
  `step_4_allowances` tinyint(1) DEFAULT 0,
  `step_4_completed_at` timestamp NULL DEFAULT NULL,
  `step_5_additional_info` tinyint(1) DEFAULT 0,
  `step_5_completed_at` timestamp NULL DEFAULT NULL,
  `step_6_review_confirm` tinyint(1) DEFAULT 0,
  `step_6_completed_at` timestamp NULL DEFAULT NULL,
  `overall_completion_percentage` int(11) DEFAULT 0,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `onboarding_progress`
--

INSERT INTO `onboarding_progress` (`id`, `employee_id`, `step_1_basic_info`, `step_1_completed_at`, `step_2_security_setup`, `step_2_completed_at`, `step_3_job_details`, `step_3_completed_at`, `step_4_allowances`, `step_4_completed_at`, `step_5_additional_info`, `step_5_completed_at`, `step_6_review_confirm`, `step_6_completed_at`, `overall_completion_percentage`, `is_completed`, `completed_at`) VALUES
(1, 1, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 100, 1, NULL),
(2, 2, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 100, 1, NULL),
(3, 3, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 1, NULL, 100, 1, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `Overtime_Report_View`
-- (See below for the actual view)
--
CREATE TABLE `Overtime_Report_View` (
`employee_id` int(11)
,`name` varchar(100)
,`email` varchar(100)
,`attendance_date` date
,`check_in_time` time
,`check_out_time` time
,`net_working_time_minutes` int(11)
,`expected_working_time_minutes` int(11)
,`overtime_minutes` int(11)
,`overtime_hours` decimal(5,2)
,`overtime_pay_multiplier` decimal(7,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_as_employees`
--

CREATE TABLE `user_as_employees` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `original_password` varchar(255) DEFAULT NULL,
  `request_password_change` tinyint(4) DEFAULT 1,
  `login_count` int(11) DEFAULT 0,
  `last_login_time` datetime DEFAULT NULL,
  `current_session_token` varchar(500) DEFAULT NULL,
  `session_token_expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_as_employees`
--

INSERT INTO `user_as_employees` (`id`, `employee_id`, `original_password`, `request_password_change`, `login_count`, `last_login_time`, `current_session_token`, `session_token_expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 2, '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', 1, 0, NULL, NULL, NULL, 1, '2025-12-23 13:10:56', '2025-12-29 15:08:33'),
(2, 1, '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', 1, 0, NULL, NULL, NULL, 1, '2025-12-28 12:17:50', '2025-12-29 15:08:42'),
(3, 3, '$2a$12$plNCeSLoz/szkGGY66ui4.3VHiSo0W3VE71IvhAyJzmer6LbYkWuy', 0, 0, NULL, NULL, NULL, 1, '2025-12-28 12:17:50', '2025-12-29 15:08:46');

-- --------------------------------------------------------

--
-- Table structure for table `user_concurrent_sessions`
--

CREATE TABLE `user_concurrent_sessions` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `total_active_sessions` int(11) DEFAULT 0,
  `pc_count` int(11) DEFAULT 0,
  `mobile_count` int(11) DEFAULT 0,
  `tablet_count` int(11) DEFAULT 0,
  `other_count` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_concurrent_sessions`
--

INSERT INTO `user_concurrent_sessions` (`id`, `employee_id`, `email`, `total_active_sessions`, `pc_count`, `mobile_count`, `tablet_count`, `other_count`, `updated_at`) VALUES
(1, 2, 'MH@gmail.com', 15, 15, 0, 0, 0, '2025-12-29 17:48:06'),
(2, 3, 'HR@gmail.com', 11, 11, 0, 0, 0, '2025-12-29 19:03:05'),
(3, 1, 'muhammad.hunain@digious.com', 1, 1, 0, 0, 0, '2025-12-29 15:18:30');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_session_summary`
-- (See below for the actual view)
--
CREATE TABLE `user_session_summary` (
`id` int(11)
,`employee_id` varchar(50)
,`name` varchar(255)
,`email` varchar(255)
,`department` varchar(100)
,`total_active_sessions` bigint(21)
,`pc_sessions` bigint(21)
,`mobile_sessions` bigint(21)
,`tablet_sessions` bigint(21)
,`last_login_time` timestamp
,`all_ip_addresses` mediumtext
,`all_device_types` mediumtext
);

-- --------------------------------------------------------

--
-- Table structure for table `user_system_info`
--

CREATE TABLE `user_system_info` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `session_token` varchar(500) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `device_type` enum('PC','Mobile','Tablet','Other') DEFAULT 'PC',
  `device_name` varchar(255) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `mac_address` varchar(17) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `last_activity_time` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_system_info`
--

INSERT INTO `user_system_info` (`id`, `employee_id`, `session_token`, `email`, `name`, `login_time`, `logout_time`, `is_active`, `device_type`, `device_name`, `browser`, `os`, `ip_address`, `hostname`, `mac_address`, `country`, `city`, `timezone`, `user_agent`, `last_activity_time`, `created_at`, `updated_at`) VALUES
(1, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1MDI4NDQsImV4cCI6MTc2NjU4OTI0NH0.2Nb2i0Cnn6f9ABdD1_TTbgQR-dbcUiYyxXJian71uAU', 'MH@gmail.com', 'MH', '2025-12-23 15:14:04', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-23 15:14:04', '2025-12-23 15:14:04', '2025-12-23 15:14:04'),
(2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1MDY0OTIsImV4cCI6MTc2NjU5Mjg5Mn0.F50wKESTQKfEwilBXHXKQSDXGxR-ahR5QBJZD7mCnzA', 'MH@gmail.com', 'MH', '2025-12-23 16:14:52', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-23 16:14:52', '2025-12-23 16:14:52', '2025-12-23 16:14:52'),
(3, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1MTEyOTQsImV4cCI6MTc2NjU5NzY5NH0.XoB-0ujO7vCgr464dgVaQlvuAkNdMGxU6GgTc8IQrxQ', 'MH@gmail.com', 'MH', '2025-12-23 17:34:54', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-23 17:34:54', '2025-12-23 17:34:54', '2025-12-23 17:34:54'),
(4, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1MTIyMzAsImV4cCI6MTc2NjU5ODYzMH0.l-M846_ZqitCmYNOOlSVN-3qDvhcnbrWEQgKzILNagA', 'MH@gmail.com', 'MH', '2025-12-23 17:50:30', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '::1', 'Unknown Host', 'N/A', 'Unknown', 'Unknown', 'Unknown', 'curl/8.5.0', '2025-12-23 17:50:30', '2025-12-23 17:50:30', '2025-12-23 17:50:30'),
(5, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1MTI4OTUsImV4cCI6MTc2NjU5OTI5NX0.zw8z_GrRnFNYglZwmrSBw6anPvX4Y6qAeO7tD7u3mjA', 'MH@gmail.com', 'MH', '2025-12-23 18:01:35', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-23 18:01:35', '2025-12-23 18:01:35', '2025-12-23 18:01:35'),
(6, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1OTA3ODAsImV4cCI6MTc2NjY3NzE4MH0.PWhsbEUuDuXdE4BV1PMmRrlNimfO6nPbL26SSviFb_8', 'MH@gmail.com', 'MH', '2025-12-24 15:39:40', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-24 15:39:40', '2025-12-24 15:39:40', '2025-12-24 15:39:40'),
(7, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY1OTc1MDQsImV4cCI6MTc2NjY4MzkwNH0.sPnx1q_cy5b5u2tj9cP58LFJriDmtc0_zVtHlSCwugw', 'MH@gmail.com', 'MH', '2025-12-24 17:31:44', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-24 17:31:44', '2025-12-24 17:31:44', '2025-12-24 17:31:44'),
(8, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY4MzQzMjIsImV4cCI6MTc2NjkyMDcyMn0.IAKlOPCO7R--Q3de_p18tGzjuB1RETSeBt8PGPJdlig', 'MH@gmail.com', 'MH', '2025-12-27 11:18:42', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-27 11:18:42', '2025-12-27 11:18:42', '2025-12-27 11:18:42'),
(9, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJpYXQiOjE3NjY4MzU0NTEsImV4cCI6MTc2NjkyMTg1MX0.lyY1GWmoXIUC8RHBF3S9Nt2gK2OUyAv4b-0iYzQOEVE', 'MH@gmail.com', 'MH', '2025-12-27 11:37:31', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-27 11:37:31', '2025-12-27 11:37:31', '2025-12-27 11:37:31'),
(10, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJpYXQiOjE3NjY4NDIwNTEsImV4cCI6MTc2NjkyODQ1MX0.JaHHgDDcUG2LRAavj-AccpLWmEIUwYVyH2I07J1ZzyE', 'HR@gmail.com', 'HR', '2025-12-27 13:27:31', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-27 13:27:31', '2025-12-27 13:27:31', '2025-12-27 13:27:31'),
(11, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJpYXQiOjE3NjY5MjY3NjEsImV4cCI6MTc2NzAxMzE2MX0.Fw94HhHcaBaeDSwen74nHawLrEZmrdFzfnmB43_zZMU', 'HR@gmail.com', 'HR', '2025-12-28 12:59:21', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-28 12:59:21', '2025-12-28 12:59:21', '2025-12-28 12:59:21'),
(12, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJpYXQiOjE3NjY5MzUyNzcsImV4cCI6MTc2NzAyMTY3N30.X1RE0OINkrQSXQKa5cfFTYjRdkV_CglakDrWj-NweoY', 'HR@gmail.com', 'HR', '2025-12-28 15:21:17', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-28 15:21:17', '2025-12-28 15:21:17', '2025-12-28 15:21:17'),
(13, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJpYXQiOjE3NjY5MzUzMDgsImV4cCI6MTc2NzAyMTcwOH0.5A7pvvKa_M0ql9Xs19e_cGROVibXVS4OY3u3mTB2Q2I', 'HR@gmail.com', 'HR', '2025-12-28 15:21:48', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-28 15:21:48', '2025-12-28 15:21:48', '2025-12-28 15:21:48'),
(14, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtcGxveWVlSWQiOiJESUctMDAxIiwiZW1haWwiOiJtdWhhbW1hZC5odW5haW5AZGlnaW91cy5jb20iLCJuYW1lIjoiTXVoYW1tYWQgSHVuYWluIiwicm9sZSI6IlByb2R1Y3Rpb24iLCJpYXQiOjE3NjcwMjE1MTAsImV4cCI6MTc2NzEwNzkxMH0.lTn_XCkAXYIKgF4dfMVsrKc5hRlDGIrAm45XXT72UkA', 'muhammad.hunain@digious.com', 'Muhammad Hunain', '2025-12-29 15:18:30', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '::1', 'Unknown Host', 'N/A', 'Unknown', 'Unknown', 'Unknown', 'curl/8.5.0', '2025-12-29 15:18:30', '2025-12-29 15:18:30', '2025-12-29 15:18:30'),
(15, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAyMTUyNCwiZXhwIjoxNzY3MTA3OTI0fQ.AEz6AoWViWP3yBYSR_rZtUn29pxV9RFBpD_BERepvXk', 'MH@gmail.com', 'MH', '2025-12-29 15:18:44', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '::1', 'Unknown Host', 'N/A', 'Unknown', 'Unknown', 'Unknown', 'curl/8.5.0', '2025-12-29 15:18:44', '2025-12-29 15:18:44', '2025-12-29 15:18:44'),
(16, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMjE1MzUsImV4cCI6MTc2NzEwNzkzNX0.5oBr6Z5ukNR7s31lFOHGmfVcvliyLO5fczO-ChYl8HA', 'HR@gmail.com', 'HR', '2025-12-29 15:18:55', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '::1', 'Unknown Host', 'N/A', 'Unknown', 'Unknown', 'Unknown', 'curl/8.5.0', '2025-12-29 15:18:55', '2025-12-29 15:18:55', '2025-12-29 15:18:55'),
(17, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAyNTkwNCwiZXhwIjoxNzY3MTEyMzA0fQ.LyUKNNcEQk-2rW-wvZ6EAOjq58Kumuwnp64dtScUyhg', 'MH@gmail.com', 'MH', '2025-12-29 16:31:44', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:31:44', '2025-12-29 16:31:44', '2025-12-29 16:31:44'),
(18, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAyNTkzNSwiZXhwIjoxNzY3MTEyMzM1fQ.TnITrwy_JTTR4fhwfny4a_xqffj1D8ciG8ItaZgi57o', 'MH@gmail.com', 'MH', '2025-12-29 16:32:15', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:32:15', '2025-12-29 16:32:15', '2025-12-29 16:32:15'),
(19, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMjYwOTAsImV4cCI6MTc2NzExMjQ5MH0.m522Amz8_rnsYZAypcSxBmzpjNwSLpkf35e16jl0hIo', 'HR@gmail.com', 'HR', '2025-12-29 16:34:50', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:34:50', '2025-12-29 16:34:50', '2025-12-29 16:34:50'),
(20, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAyNzE0OCwiZXhwIjoxNzY3MTEzNTQ4fQ.3P_G2lnP6xawjQHByBojwivg5aKSAnGohquKmQV4AQY', 'MH@gmail.com', 'MH', '2025-12-29 16:52:28', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '::1', 'Unknown Host', 'N/A', 'Unknown', 'Unknown', 'Unknown', 'curl/8.5.0', '2025-12-29 16:52:28', '2025-12-29 16:52:28', '2025-12-29 16:52:28'),
(21, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAyNzIwMywiZXhwIjoxNzY3MTEzNjAzfQ.9dpe_UpWzJLA7MGX7AuJvIZC8elHoTSe67e8A6W5qd0', 'MH@gmail.com', 'MH', '2025-12-29 16:53:23', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:53:23', '2025-12-29 16:53:23', '2025-12-29 16:53:23'),
(22, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMjcyNzMsImV4cCI6MTc2NzExMzY3M30.ywoiL1f_TVwbTP73AiQKmJLaLMjp7AeFBtbG-V72Tzw', 'HR@gmail.com', 'HR', '2025-12-29 16:54:33', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:54:33', '2025-12-29 16:54:33', '2025-12-29 16:54:33'),
(23, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMjc3NzQsImV4cCI6MTc2NzExNDE3NH0._CpZzvVDuAAOG0U75ZvewzD0mEIk-4P7PQPIQIKbqJA', 'HR@gmail.com', 'HR', '2025-12-29 17:02:54', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 17:02:54', '2025-12-29 17:02:54', '2025-12-29 17:02:54'),
(24, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtcGxveWVlSWQiOiJESUctT08yIiwiZW1haWwiOiJNSEBnbWFpbC5jb20iLCJuYW1lIjoiTUgiLCJyb2xlIjoiUHJvZHVjdGlvbiIsImlhdCI6MTc2NzAzMDQ4NiwiZXhwIjoxNzY3MTE2ODg2fQ.iLBNnikriwFkxvbk070OQdrdN8R2L7u9BM3Ds8PNQho', 'MH@gmail.com', 'MH', '2025-12-29 17:48:06', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 17:48:06', '2025-12-29 17:48:06', '2025-12-29 17:48:06'),
(25, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMzA1MzEsImV4cCI6MTc2NzExNjkzMX0.3REGd1y7apMtLXzzXYr36pf7eAvhZYFkYVGGXJ2Ospo', 'HR@gmail.com', 'HR', '2025-12-29 17:48:51', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '127.0.0.1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', '2025-12-29 17:48:51', '2025-12-29 17:48:51', '2025-12-29 17:48:51'),
(26, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMzE3ODYsImV4cCI6MTc2NzExODE4Nn0.8e2eq_F69WIMdSwoNIg090lNSK1zxuBqQr4UKKxT994', 'HR@gmail.com', 'HR', '2025-12-29 18:09:46', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 18:09:46', '2025-12-29 18:09:46', '2025-12-29 18:09:46'),
(27, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtcGxveWVlSWQiOiJESUctMDA0IiwiZW1haWwiOiJIUkBnbWFpbC5jb20iLCJuYW1lIjoiSFIiLCJyb2xlIjoiSFIiLCJpYXQiOjE3NjcwMzQ5ODUsImV4cCI6MTc2NzEyMTM4NX0.319xPbOWNdObbUwEMjYIPnVz_onLEmYyCVjcUUV1Le8', 'HR@gmail.com', 'HR', '2025-12-29 19:03:05', NULL, 1, 'PC', 'Unknown Device', 'Unknown Browser', 'Unknown OS', '1', 'Unknown Host', 'N/A', 'Pakistan', 'Karachi Division', 'Unknown', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 19:03:05', '2025-12-29 19:03:05', '2025-12-29 19:03:05');

-- --------------------------------------------------------

--
-- Structure for view `active_users_view`
--
DROP TABLE IF EXISTS `active_users_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_users_view`  AS SELECT `usi`.`id` AS `id`, `usi`.`employee_id` AS `employee_id`, `usi`.`email` AS `email`, `usi`.`name` AS `name`, `usi`.`login_time` AS `login_time`, `usi`.`device_type` AS `device_type`, `usi`.`device_name` AS `device_name`, `usi`.`ip_address` AS `ip_address`, `usi`.`hostname` AS `hostname`, `usi`.`mac_address` AS `mac_address`, `usi`.`browser` AS `browser`, `usi`.`os` AS `os`, `usi`.`country` AS `country`, `usi`.`city` AS `city`, `usi`.`last_activity_time` AS `last_activity_time`, timestampdiff(MINUTE,`usi`.`login_time`,current_timestamp()) AS `logged_in_minutes`, `usi`.`is_active` AS `is_active` FROM `user_system_info` AS `usi` WHERE `usi`.`is_active` = 1 ORDER BY `usi`.`login_time` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `Attendance_Summary_View`
--
DROP TABLE IF EXISTS `Attendance_Summary_View`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `Attendance_Summary_View`  AS SELECT `ea`.`employee_id` AS `employee_id`, `ea`.`name` AS `name`, `ea`.`email` AS `email`, `ea`.`attendance_date` AS `attendance_date`, `ea`.`check_in_time` AS `check_in_time`, `ea`.`check_out_time` AS `check_out_time`, `ea`.`status` AS `status`, `ea`.`total_breaks_taken` AS `total_breaks_taken`, `ea`.`total_break_duration_minutes` AS `total_break_duration_minutes`, concat(floor(`ea`.`gross_working_time_minutes` / 60),'h ',`ea`.`gross_working_time_minutes` MOD 60,'m') AS `gross_working_time`, concat(floor(`ea`.`net_working_time_minutes` / 60),'h ',`ea`.`net_working_time_minutes` MOD 60,'m') AS `net_working_time`, `ea`.`overtime_hours` AS `overtime_hours`, `ea`.`on_time` AS `on_time`, `ea`.`late_by_minutes` AS `late_by_minutes`, `ea`.`created_at` AS `created_at`, `ea`.`updated_at` AS `updated_at` FROM `Employee_Attendance` AS `ea` ORDER BY `ea`.`attendance_date` DESC, `ea`.`employee_id` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `Monthly_Attendance_Summary`
--
DROP TABLE IF EXISTS `Monthly_Attendance_Summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `Monthly_Attendance_Summary`  AS SELECT `Employee_Attendance`.`employee_id` AS `employee_id`, `Employee_Attendance`.`name` AS `name`, `Employee_Attendance`.`email` AS `email`, year(`Employee_Attendance`.`attendance_date`) AS `year`, month(`Employee_Attendance`.`attendance_date`) AS `month`, count(0) AS `total_days`, sum(case when `Employee_Attendance`.`status` = 'Present' then 1 else 0 end) AS `present_days`, sum(case when `Employee_Attendance`.`status` = 'Absent' then 1 else 0 end) AS `absent_days`, sum(case when `Employee_Attendance`.`status` = 'Late' then 1 else 0 end) AS `late_days`, sum(case when `Employee_Attendance`.`status` = 'On Leave' then 1 else 0 end) AS `leave_days`, round(sum(case when `Employee_Attendance`.`status` = 'Present' then 1 else 0 end) * 100 / count(0),2) AS `attendance_rate`, round(sum(case when `Employee_Attendance`.`on_time` = 1 then 1 else 0 end) * 100 / count(0),2) AS `on_time_rate`, sum(`Employee_Attendance`.`net_working_time_minutes`) AS `total_working_minutes`, sum(`Employee_Attendance`.`overtime_minutes`) AS `total_overtime_minutes`, sum(`Employee_Attendance`.`total_break_duration_minutes`) AS `total_break_minutes` FROM `Employee_Attendance` GROUP BY `Employee_Attendance`.`employee_id`, `Employee_Attendance`.`name`, `Employee_Attendance`.`email`, year(`Employee_Attendance`.`attendance_date`), month(`Employee_Attendance`.`attendance_date`) ;

-- --------------------------------------------------------

--
-- Structure for view `Overtime_Report_View`
--
DROP TABLE IF EXISTS `Overtime_Report_View`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `Overtime_Report_View`  AS SELECT `ea`.`employee_id` AS `employee_id`, `ea`.`name` AS `name`, `ea`.`email` AS `email`, `ea`.`attendance_date` AS `attendance_date`, `ea`.`check_in_time` AS `check_in_time`, `ea`.`check_out_time` AS `check_out_time`, `ea`.`net_working_time_minutes` AS `net_working_time_minutes`, `ea`.`expected_working_time_minutes` AS `expected_working_time_minutes`, `ea`.`overtime_minutes` AS `overtime_minutes`, `ea`.`overtime_hours` AS `overtime_hours`, CASE WHEN `ea`.`overtime_hours` > 0 THEN round(`ea`.`overtime_hours` * 1.5,2) ELSE 0 END AS `overtime_pay_multiplier` FROM `Employee_Attendance` AS `ea` WHERE `ea`.`overtime_minutes` > 0 ORDER BY `ea`.`attendance_date` DESC, `ea`.`overtime_hours` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `user_session_summary`
--
DROP TABLE IF EXISTS `user_session_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_session_summary`  AS SELECT `eo`.`id` AS `id`, `eo`.`employee_id` AS `employee_id`, `eo`.`name` AS `name`, `eo`.`email` AS `email`, `eo`.`department` AS `department`, count(case when `usi`.`is_active` = 1 then 1 end) AS `total_active_sessions`, count(case when `usi`.`device_type` = 'PC' and `usi`.`is_active` = 1 then 1 end) AS `pc_sessions`, count(case when `usi`.`device_type` = 'Mobile' and `usi`.`is_active` = 1 then 1 end) AS `mobile_sessions`, count(case when `usi`.`device_type` = 'Tablet' and `usi`.`is_active` = 1 then 1 end) AS `tablet_sessions`, max(`usi`.`login_time`) AS `last_login_time`, group_concat(distinct `usi`.`ip_address` separator ',') AS `all_ip_addresses`, group_concat(distinct `usi`.`device_type` separator ',') AS `all_device_types` FROM (`employee_onboarding` `eo` left join `user_system_info` `usi` on(`eo`.`id` = `usi`.`employee_id`)) GROUP BY `eo`.`id`, `eo`.`employee_id`, `eo`.`name`, `eo`.`email`, `eo`.`department` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `Company_Rules`
--
ALTER TABLE `Company_Rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rule_name` (`rule_name`),
  ADD KEY `idx_rule_type` (`rule_type`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `Employee_Activities`
--
ALTER TABLE `Employee_Activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_timestamp` (`timestamp`);

--
-- Indexes for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_allowance_name` (`allowance_name`);

--
-- Indexes for table `Employee_Attendance`
--
ALTER TABLE `Employee_Attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`attendance_date`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_attendance_date` (`attendance_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `Employee_Breaks`
--
ALTER TABLE `Employee_Breaks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `idx_attendance_id` (`attendance_id`),
  ADD KEY `idx_break_type` (`break_type`);

--
-- Indexes for table `employee_dynamic_resources`
--
ALTER TABLE `employee_dynamic_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_resource_name` (`resource_name`);

--
-- Indexes for table `employee_onboarding`
--
ALTER TABLE `employee_onboarding`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cnic` (`cnic`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_join_date` (`join_date`);

--
-- Indexes for table `employee_resources`
--
ALTER TABLE `employee_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_allocated_date` (`allocated_date`);

--
-- Indexes for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_employee_id` (`employee_id`);

--
-- Indexes for table `onboarding_progress`
--
ALTER TABLE `onboarding_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_is_completed` (`is_completed`);

--
-- Indexes for table `user_as_employees`
--
ALTER TABLE `user_as_employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_id` (`employee_id`),
  ADD KEY `idx_session_token` (`current_session_token`),
  ADD KEY `idx_last_login` (`last_login_time`);

--
-- Indexes for table `user_concurrent_sessions`
--
ALTER TABLE `user_concurrent_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_system_info`
--
ALTER TABLE `user_system_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD UNIQUE KEY `uk_session_token` (`session_token`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_login_time` (`login_time`),
  ADD KEY `idx_device_type` (`device_type`),
  ADD KEY `idx_ip_address` (`ip_address`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Company_Rules`
--
ALTER TABLE `Company_Rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Employee_Activities`
--
ALTER TABLE `Employee_Activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Employee_Attendance`
--
ALTER TABLE `Employee_Attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Employee_Breaks`
--
ALTER TABLE `Employee_Breaks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `employee_dynamic_resources`
--
ALTER TABLE `employee_dynamic_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_onboarding`
--
ALTER TABLE `employee_onboarding`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_resources`
--
ALTER TABLE `employee_resources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_salary`
--
ALTER TABLE `employee_salary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `onboarding_progress`
--
ALTER TABLE `onboarding_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_as_employees`
--
ALTER TABLE `user_as_employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_concurrent_sessions`
--
ALTER TABLE `user_concurrent_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_system_info`
--
ALTER TABLE `user_system_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Employee_Activities`
--
ALTER TABLE `Employee_Activities`
  ADD CONSTRAINT `Employee_Activities_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_allowances`
--
ALTER TABLE `employee_allowances`
  ADD CONSTRAINT `employee_allowances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `Employee_Attendance`
--
ALTER TABLE `Employee_Attendance`
  ADD CONSTRAINT `Employee_Attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`);

--
-- Constraints for table `Employee_Breaks`
--
ALTER TABLE `Employee_Breaks`
  ADD CONSTRAINT `Employee_Breaks_ibfk_1` FOREIGN KEY (`attendance_id`) REFERENCES `Employee_Attendance` (`id`),
  ADD CONSTRAINT `Employee_Breaks_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`);

--
-- Constraints for table `employee_dynamic_resources`
--
ALTER TABLE `employee_dynamic_resources`
  ADD CONSTRAINT `employee_dynamic_resources_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_resources`
--
ALTER TABLE `employee_resources`
  ADD CONSTRAINT `employee_resources_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD CONSTRAINT `employee_salary_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `onboarding_progress`
--
ALTER TABLE `onboarding_progress`
  ADD CONSTRAINT `onboarding_progress_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_as_employees`
--
ALTER TABLE `user_as_employees`
  ADD CONSTRAINT `user_as_employees_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_concurrent_sessions`
--
ALTER TABLE `user_concurrent_sessions`
  ADD CONSTRAINT `user_concurrent_sessions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_system_info`
--
ALTER TABLE `user_system_info`
  ADD CONSTRAINT `user_system_info_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employee_onboarding` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;