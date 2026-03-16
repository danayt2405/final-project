-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2025 at 09:12 PM
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
  `email` varchar(254) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `anonymous` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `complainants`
--

INSERT INTO `complainants` (`id`, `full_name`, `phone`, `email`, `position`, `department`, `anonymous`) VALUES
(1, 'John Doe', '+2519...', NULL, NULL, NULL, 0),
(2, 'John Doe', '+2519...', NULL, NULL, NULL, 0),
(3, 'John Doe', '+2519...', NULL, NULL, NULL, 0),
(4, 'Jane Doe', '1234567890', 'jane.doe@example.com', 'Manager', 'HR', 0);

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
(6, 'INS-20251113-93240C0B', 1, 2, 'Office 10', '2025-11-12', 'Example complaint', NULL, 'John Doe', 'Executed', 'HR', NULL, NULL, NULL, 'Complaint has been resolved', NULL, '2025-11-13 07:43:12', '2025-11-13 07:43:12', NULL),
(7, 'INS-20251113-78449599', 2, 2, 'Office 10', '2025-11-12', 'Example complaint', NULL, 'John Doe', 'Planned', 'HR', NULL, '\nThis is some additional information.', 3, 'Investigation completed.', '2025-11-16 11:13:12', '2025-11-13 08:04:51', '2025-11-13 08:04:51', NULL),
(8, 'INS-20251113-8E209908', 3, 2, 'Office 10', '2025-11-12', 'Example complaint', NULL, 'mm Doe', 'Planned', 'HR', NULL, NULL, NULL, NULL, NULL, '2025-11-13 08:29:32', '2025-11-13 08:29:32', NULL),
(10, 'INS-20251116-42D3B530', 4, 1, 'New York', '2025-11-01', NULL, 'None', 'John Doe', NULL, 'IT', 'Software Engineer', 'This is a test complaint.', 1, NULL, NULL, '2025-11-16 10:59:02', '2025-11-16 10:59:02', NULL),
(11, 'INS-20251116-CCA06756', NULL, 2, NULL, '2025-11-16', 'Water leakage', NULL, 'Mek T', NULL, 'HR', 'Clerk', NULL, 1, NULL, NULL, '2025-11-16 16:03:32', '2025-11-16 16:03:32', NULL);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `complaint_status_history`
--
ALTER TABLE `complaint_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
