-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2025 at 06:22 AM
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
-- Database: `insa_complaints1`
--

-- --------------------------------------------------------

--
-- Table structure for table `complainants`
--

CREATE TABLE `complainants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `anonymous` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complainants`
--

INSERT INTO `complainants` (`id`, `full_name`, `phone`, `position`, `department`, `email`, `anonymous`) VALUES
(25, 'yyyy', '0966774433', NULL, NULL, NULL, b'0'),
(33, '', '', '', '', NULL, b'0'),
(34, 'Doe', '123456789', 'Software Engineer', 'IT', 'john.doe@example.com', b'0'),
(37, 'Doe', '123456789', 'Software Engineer', 'IT', 'john.doe@example.com', b'0'),
(44, 'yyyy', '0966774433', 'manager', 'it', NULL, b'0'),
(45, 'yyyy', '0966774433', 'manager', 'it', NULL, b'0'),
(49, 'gg', '0966774433', 'manager', 'it', NULL, b'0'),
(50, 'yyyy', '', '', '', NULL, b'0'),
(54, '', '', '', '', NULL, b'0');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `complainant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `date_occurred` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `damage_loss` varchar(255) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `execution_status` enum('Planned','Executed') DEFAULT 'Planned',
  `work_department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `additional_details` text DEFAULT NULL,
  `status_id` bigint(20) UNSIGNED DEFAULT 1,
  `response_text` text DEFAULT NULL,
  `response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `responsible_entity` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `tracking_number`, `complainant_id`, `type_id`, `location`, `date_occurred`, `description`, `damage_loss`, `full_name`, `execution_status`, `work_department`, `position`, `additional_details`, `status_id`, `response_text`, `response_date`, `created_at`, `updated_at`, `responsible_entity`) VALUES
(19, 'INS-20251117-2CE84931', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.\n55\nrr', 1, NULL, NULL, '2025-11-17 13:34:38', '2025-11-17 13:34:38', NULL),
(20, 'INS-20251117-5C76795F', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.\nyyyyyyyyyy', 1, NULL, NULL, '2025-11-17 13:35:58', '2025-11-17 13:35:58', NULL),
(21, 'INS-20251117-5DB3C88D', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.\nhhhhhhhhhhhh', 5, 'tt', '2025-11-18 23:18:06', '2025-11-17 13:36:00', '2025-11-17 13:36:00', NULL),
(23, 'INS-20251117-CCAEF25B', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.', 1, NULL, NULL, '2025-11-17 13:46:16', '2025-11-17 13:46:16', NULL),
(24, 'INS-20251117-E43A292B', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.', 1, NULL, NULL, '2025-11-17 13:46:55', '2025-11-17 13:46:55', NULL),
(25, 'INS-20251117-53DE3C99', NULL, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.', 1, NULL, NULL, '2025-11-17 14:18:40', '2025-11-17 14:18:40', NULL),
(32, 'INS-20251118-D40A5391', 25, 1, 'Addis Ababa ', '2025-11-17', 'yyyyyyyyyyyyy', 'jjjjjjjjjjjjjjjjj', 'abebe', 'Planned', 'it', 'finance ', 'yyyyyyyyyyyyy', 4, '4444444444444', '2025-11-18 23:02:41', '2025-11-18 06:21:33', '2025-11-18 06:21:33', 'ggggggggggg'),
(41, 'INS-20251119-9D8228CE', 34, 1, 'New York', '2023-10-05', 'Received a defective item, please advise on the return process.', 'N/A', 'Doe', NULL, 'IT', 'Software Engineer', 'The product did not function as expected.', 1, NULL, NULL, '2025-11-19 02:58:24', '2025-11-19 02:58:24', 'Product Support'),
(43, 'INS-20251119-08D2A93B', NULL, NULL, 'Addis Ababa ', '2025-11-18', '', 'no', 'abebe', 'Executed', 'it', 'finance ', '', NULL, NULL, NULL, '2025-11-19 05:46:03', '2025-11-19 05:46:03', ''),
(44, 'INS-20251119-1C8CDCB8', 37, 1, 'New York', '2023-10-05', 'Received a defective item, please advise on the return process.', 'N/A', 'Doe', NULL, 'IT', 'Software Engineer', 'The product did not function as expected.', 1, NULL, NULL, '2025-11-19 05:46:36', '2025-11-19 05:46:36', 'Product Support'),
(53, 'INS-20251119-F90686C3', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'John Doe', NULL, 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 06:57:11', '2025-11-19 06:57:11', 'Entity name'),
(66, 'INS-20251119-D6BB0419', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 08:07:49', '2025-11-19 08:07:49', 'Entity name'),
(67, 'TRK-034C9CFF', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 08:14:19', '2025-11-19 08:14:19', 'Entity name'),
(69, 'TRK-62033F43', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 08:24:19', '2025-11-19 08:24:19', 'Entity name'),
(70, 'INS-20251119-51834703', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 08:32:43', '2025-11-19 08:32:43', 'Entity name'),
(72, 'INS-20251119-06D304D8', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 08:52:06', '2025-11-19 08:52:06', 'Entity name'),
(73, 'INS-20251119-5636C06D', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 09:22:57', '2025-11-19 09:22:57', 'Entity name'),
(74, 'INS-20251119-C0528CAF', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info\nhhhhhh', 1, NULL, NULL, '2025-11-19 09:40:14', '2025-11-19 09:40:14', 'Entity name'),
(75, 'INS-20251119-BE3F5FBF', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 09:54:30', '2025-11-19 09:54:30', 'Entity name'),
(77, 'INS-20251119-2124D6AA', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 09:57:16', '2025-11-19 09:57:16', 'Entity name'),
(78, 'INS-20251119-E5CBC619', NULL, NULL, '', NULL, '', '', 'ab', 'Executed', 'it', 'finance ', '', NULL, NULL, NULL, '2025-11-19 10:09:55', '2025-11-19 10:09:55', ''),
(79, 'INS-20251119-16FE7FBB', NULL, 1, 'New York', '2025-11-18', 'Complaint description', 'Some loss', 'JDoe', 'Planned', 'Sales', 'Manager', 'Additional info', 1, NULL, NULL, '2025-11-19 10:11:18', '2025-11-19 10:11:18', 'Entity name'),
(80, 'INS-20251119-24A821C5', NULL, NULL, '', NULL, 'fff', 'gfff', 'ab', 'Executed', 'it', 'finance ', 'fff', NULL, NULL, NULL, '2025-11-19 10:11:41', '2025-11-19 10:11:41', 'fff'),
(81, 'INS-20251120-085EAA35', NULL, 2, 'ffffffff', '2025-11-19', NULL, 'rrrrrrrrrrrr', 'ab', 'Executed', 'gg', 'finance ', 'rrrrrrr', 1, NULL, NULL, '2025-11-20 03:43:09', '2025-11-20 03:43:09', 'rrrrrrrrrrr'),
(82, 'INS-20251120-9E53D67B', 54, 3, 'Addis Ababa ', '2025-11-26', NULL, 'no', 'ab', 'Executed', 'it', 'finance ', '', 1, NULL, NULL, '2025-11-20 03:47:21', '2025-11-20 03:47:21', 'rrrr');

--
-- Triggers `complaints`
--
DELIMITER $$
CREATE TRIGGER `before_insert_complaint` BEFORE INSERT ON `complaints` FOR EACH ROW BEGIN
    -- Only generate a tracking number if not manually provided
    IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
        SET NEW.tracking_number = CONCAT(
            'INS-', 
            DATE_FORMAT(NOW(), '%Y%m%d'), 
            '-', 
            UPPER(SUBSTRING(UUID(), 1, 8))
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_complaint_status_change` AFTER UPDATE ON `complaints` FOR EACH ROW BEGIN
    -- Only log if the status_id actually changed
    IF OLD.status_id <> NEW.status_id THEN
        INSERT INTO complaint_status_history (
            complaint_id,
            old_status_id,
            new_status_id,
            changed_by,
            note,
            changed_at
        ) VALUES (
            NEW.id,
            OLD.status_id,
            NEW.status_id,
            NULL, -- can be filled if you know the user who made the change
            CONCAT('Status changed from ', OLD.status_id, ' to ', NEW.status_id),
            NOW()
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `complaint_attachments`
--

CREATE TABLE `complaint_attachments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `complaint_id` bigint(20) UNSIGNED NOT NULL,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(1024) NOT NULL,
  `file_type` enum('voice','image','document','video','other') NOT NULL DEFAULT 'document',
  `file_size_bytes` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaint_attachments`
--

INSERT INTO `complaint_attachments` (`id`, `complaint_id`, `uploaded_by`, `file_name`, `file_path`, `file_type`, `file_size_bytes`) VALUES
(5, 19, NULL, 'complaint_attachments (1).sql', 'C:\\Users\\m\\Desktop\\project-insa-1\\Backend\\uploads\\537545f0-38d3-4507-a02f-495f01ee04ac.sql', 'document', 2189),
(6, 32, NULL, 'complaint_attachments (1).sql', 'C:\\Users\\m\\Desktop\\project-insa-1\\Backend\\uploads\\2ae3fa76-2a10-4845-8407-8485697cbf34.sql', 'document', 2189),
(7, 21, NULL, 'insa_complaints1 (9).sql', 'C:\\Users\\m\\Desktop\\project-insa-1\\Backend\\uploads\\6af417ad-171c-431c-b10b-78da812094dc.sql', 'document', 14295),
(9, 74, NULL, 'reports (1).xlsx', 'C:\\Users\\m\\Desktop\\project-insa-1\\Backend\\uploads\\f4a19cba-0a34-4951-a729-5602860c1626.xlsx', 'document', 17992);

-- --------------------------------------------------------

--
-- Table structure for table `complaint_status_history`
--

CREATE TABLE `complaint_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `complaint_id` bigint(20) UNSIGNED NOT NULL,
  `old_status_id` bigint(20) UNSIGNED DEFAULT NULL,
  `new_status_id` bigint(20) UNSIGNED DEFAULT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaint_status_history`
--

INSERT INTO `complaint_status_history` (`id`, `complaint_id`, `old_status_id`, `new_status_id`, `changed_by`, `note`, `changed_at`) VALUES
(3, 32, 6, 4, NULL, 'Status changed from 6 to 4', '2025-11-18 23:02:41'),
(4, 21, 1, 5, NULL, 'Status changed from 1 to 5', '2025-11-18 23:18:06');

-- --------------------------------------------------------

--
-- Table structure for table `complaint_types`
--

CREATE TABLE `complaint_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complaint_types`
--

INSERT INTO `complaint_types` (`id`, `name`, `description`, `active`) VALUES
(1, 'Safety ', NULL, 1),
(2, 'Human Resources', 'Complaints related to HR, employee issues, or workplace conduct.', 1),
(3, 'Anti-Corruption', 'Complaints related to corruption, misuse of funds, or ethical breaches.', 1);

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `name`, `description`) VALUES
(1, 'submitted', 'Complaint has been submitted'),
(2, 'in_review', 'Under review by department'),
(3, 'investigating', 'Investigation in progress'),
(4, 'resolved', 'Complaint resolved'),
(5, 'rejected', 'Complaint rejected'),
(6, 'closed', 'Case closed');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(80) DEFAULT NULL,
  `full_name` varchar(200) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `role` enum('admin','staff','super_admin') NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `password_hash`, `phone`, `email`, `role`, `active`) VALUES
(7, 'adminhr', 'Admin Hr', '$2a$10$ouCsPci3UccUKtEESHPMd.cSAqlpO.WSuYpTRPFzOf0ffWwJEa4Gy', NULL, NULL, 'admin', 1),
(8, 'adminac', 'Admin Ac', '$2a$10$94HFuVjT2fqBwfQNztcFzOZQkeW3rp2arRM3jCu0gGwbKcbBtHzLC', NULL, NULL, 'admin', 1),
(9, 'admin_sa', 'Admin SA', '$2a$10$tMElJ21qUDV0qOd5XFGsKOLFHSKgz4c3xtxboRiNuufcTMfcrOJYC', NULL, NULL, 'admin', 1),
(10, 'superadmin', 'Superadmin', '$2a$10$AtGTYfgwUdE7PQJt2sVPF.KomSZ1Q819GF7cryVe2kJ8e0Aj1lotC', NULL, NULL, 'super_admin', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_type_access`
--

CREATE TABLE `user_type_access` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type_id` bigint(20) UNSIGNED NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_type_access`
--

INSERT INTO `user_type_access` (`id`, `user_id`, `type_id`, `granted_at`) VALUES
(11, 7, 2, '2025-11-15 19:52:15'),
(12, 8, 3, '2025-11-15 19:52:49'),
(13, 9, 1, '2025-11-15 19:53:19'),
(14, 10, 1, '2025-11-15 19:55:09'),
(15, 10, 2, '2025-11-15 19:55:09'),
(16, 10, 3, '2025-11-15 19:55:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `complainants`
--
ALTER TABLE `complainants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_number` (`tracking_number`),
  ADD KEY `fk_complaint_complainant` (`complainant_id`),
  ADD KEY `fk_complaint_type` (`type_id`),
  ADD KEY `idx_complaints_created` (`created_at`),
  ADD KEY `fk_complaints_status` (`status_id`);

--
-- Indexes for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attach_complaint` (`complaint_id`),
  ADD KEY `fk_attach_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `complaint_status_history`
--
ALTER TABLE `complaint_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_hist_complaint` (`complaint_id`),
  ADD KEY `fk_hist_user` (`changed_by`),
  ADD KEY `fk_hist_old_status` (`old_status_id`),
  ADD KEY `fk_hist_new_status` (`new_status_id`);

--
-- Indexes for table `complaint_types`
--
ALTER TABLE `complaint_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_status_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_type_access`
--
ALTER TABLE `user_type_access`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_type` (`user_id`,`type_id`),
  ADD KEY `fk_user_type_type` (`type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `complainants`
--
ALTER TABLE `complainants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `complaint_status_history`
--
ALTER TABLE `complaint_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `complaint_types`
--
ALTER TABLE `complaint_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `user_type_access`
--
ALTER TABLE `user_type_access`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaint_complainant` FOREIGN KEY (`complainant_id`) REFERENCES `complainants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_complaint_type` FOREIGN KEY (`type_id`) REFERENCES `complaint_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_complaints_status` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  ADD CONSTRAINT `fk_attach_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attach_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `complaint_status_history`
--
ALTER TABLE `complaint_status_history`
  ADD CONSTRAINT `fk_hist_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hist_new_status` FOREIGN KEY (`new_status_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hist_old_status` FOREIGN KEY (`old_status_id`) REFERENCES `statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hist_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_type_access`
--
ALTER TABLE `user_type_access`
  ADD CONSTRAINT `fk_user_type_type` FOREIGN KEY (`type_id`) REFERENCES `complaint_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_type_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
