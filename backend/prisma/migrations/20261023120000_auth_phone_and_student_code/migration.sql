-- ============================================================================
-- Auth redesign (Task 1)
--   * users.email is removed; users.phone is added (login for ADMIN / TEACHER / PARENT)
--   * students get a permanent student_code + entry_year / entry_grade / entry_sequence
--   * parents.phone becomes unique
--
-- NO ROWS ARE DELETED. Existing students and parents keep all their data.
-- The ONLY data that disappears is the e-mail address of existing user accounts (that is the goal).
--
-- Needs MySQL 5.7+ (or MariaDB 10.2+). Back the database up first (mysqldump) if it holds real data.
--
-- After this migration:
--   * PARENT users get their phone copied from parents.phone (when it is a valid 09xxxxxxxxx number).
--   * STUDENT users keep phone = NULL and log in with the new student_code.
--   * ADMIN / TEACHER users get phone = NULL. Run `npx prisma db seed` (it upgrades the demo accounts),
--     or set it by hand:  UPDATE users SET phone = '09xxxxxxxxx' WHERE id = ...;
--
-- MySQL DDL can't be rolled back, so the steps that can FAIL (unique indexes on existing data) come first.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) parents.phone must be unique (fails here, before anything else changed, if two parents share a phone).
--    Find duplicates with:
--      SELECT phone, COUNT(*) FROM parents GROUP BY phone HAVING COUNT(*) > 1;
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX `parents_phone_key` ON `parents`(`phone`);

-- ---------------------------------------------------------------------------
-- 2) students: add the new columns as NULLABLE first, so existing rows are accepted
-- ---------------------------------------------------------------------------
ALTER TABLE `students`
    ADD COLUMN `student_code` VARCHAR(20) NULL,
    ADD COLUMN `entry_year` INTEGER NULL,
    ADD COLUMN `entry_grade` INTEGER NULL,
    ADD COLUMN `entry_sequence` INTEGER NULL;

-- Best available guess for existing students (their real entry data was never stored):
--   entry_year  = first 4 digits of their class academic year ("1405-1406" -> 1405);
--                 without a class: the Jalali year of the row's created_at (approximate)
--   entry_grade = their current grade_level
UPDATE `students` s
LEFT JOIN `classes` c ON c.`id` = s.`class_id`
SET s.`entry_year` = COALESCE(
        CASE WHEN c.`academic_year` REGEXP '^[0-9]{4}' THEN CAST(SUBSTRING(c.`academic_year`, 1, 4) AS UNSIGNED) END,
        YEAR(s.`created_at`) - CASE
            WHEN MONTH(s.`created_at`) > 3 OR (MONTH(s.`created_at`) = 3 AND DAY(s.`created_at`) >= 21) THEN 621
            ELSE 622
        END
    ),
    s.`entry_grade` = s.`grade_level`;

-- Sequence = position inside (entry_year, entry_grade), oldest student first.
-- (A temporary table is used because MySQL does not allow UPDATE ... SELECT on the same table.)
CREATE TEMPORARY TABLE `tmp_student_sequence` AS
    SELECT s.`id` AS `id`, COUNT(*) AS `seq`
    FROM `students` s
    JOIN `students` o
      ON o.`entry_year` = s.`entry_year` AND o.`entry_grade` = s.`entry_grade` AND o.`id` <= s.`id`
    GROUP BY s.`id`;

UPDATE `students` s
JOIN `tmp_student_sequence` t ON t.`id` = s.`id`
SET s.`entry_sequence` = t.`seq`,
    s.`student_code` = CONCAT(s.`entry_year`, '-', s.`entry_grade`, '-', LPAD(t.`seq`, 3, '0'));

DROP TEMPORARY TABLE `tmp_student_sequence`;

-- Now every row has a value: make the columns required and unique.
ALTER TABLE `students`
    MODIFY `student_code` VARCHAR(20) NOT NULL,
    MODIFY `entry_year` INTEGER NOT NULL,
    MODIFY `entry_grade` INTEGER NOT NULL,
    MODIFY `entry_sequence` INTEGER NOT NULL;

CREATE UNIQUE INDEX `students_student_code_key` ON `students`(`student_code`);
CREATE UNIQUE INDEX `students_entry_year_entry_grade_entry_sequence_key` ON `students`(`entry_year`, `entry_grade`, `entry_sequence`);

-- ---------------------------------------------------------------------------
-- 3) users: add phone, copy parent phones, then drop email
-- ---------------------------------------------------------------------------
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(15) NULL;

-- Parent accounts keep working: their login phone is the phone already stored on the parent row.
UPDATE `users` u
JOIN `parents` p ON p.`user_id` = u.`id`
SET u.`phone` = p.`phone`
WHERE u.`role` = 'PARENT' AND p.`phone` REGEXP '^09[0-9]{9}$';

CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);

-- Last step: the e-mail goes away.
DROP INDEX `users_email_key` ON `users`;
ALTER TABLE `users` DROP COLUMN `email`;
