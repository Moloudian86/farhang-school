# Database Schema (MySQL, 22 tables)

Source of truth: `backend/prisma/schema.prisma`. Tables are created by Prisma Migration.

## Public website content
| Table | Purpose |
|---|---|
| `school_info` | One row: name, slogan, intro, philosophy, contact info, hero/about images |
| `school_statistics` | Homepage counters (students, teachers, years ...) |
| `facilities` | School facilities (title, description, icon, `image_url`) |
| `teachers` | Staff directory (position, subject, degree, experience, `image_url`) |
| `news_categories` / `news` | News with category, DRAFT/PUBLISHED status, slug |
| `event_categories` / `events` | Events with date, time, location |
| `gallery_categories` / `gallery_images` | Gallery images (`image_url`, title, date, category) |

## Visitor forms
| Table | Purpose |
|---|---|
| `enrollments` | Student registration requests (PENDING / APPROVED / REJECTED) |
| `contact_messages` | Messages from the contact form (`is_read`) |

## School system (foundation for Admin / Teacher / Student / Parent panels)
| Table | Purpose |
|---|---|
| `users` | Login accounts, role = ADMIN / TEACHER / STUDENT / PARENT, hashed password. **No e-mail.** `phone` (unique) is the login name of ADMIN / TEACHER / PARENT; a STUDENT's user has no phone |
| `students`, `parents`, `parent_students` | People; parent <-> student is many-to-many (a student can have father and mother, each with an own account). `students.student_code` (unique) is the student's login name; `parents.phone` is unique |
| `classes`, `subjects`, `class_subjects` | Classes, subjects, weekly timetable with teacher |
| `grades`, `attendance`, `homeworks` | Scores, daily attendance (unique per student per day), homework |

## Main relations
- `users` 1:1 `teachers` / `students` / `parents` (optional link, so public staff can exist without an account)
- `classes` 1:N `students`; `classes` N:M `subjects` through `class_subjects`
- `students` 1:N `grades`, `attendance`
- `news` N:1 `news_categories`; `events` N:1 `event_categories`; `gallery_images` N:1 `gallery_categories`

## Images
Only the URL is stored (`image_url`). Demo data will use Unsplash URLs; later an upload endpoint
saves files in `backend/uploads` and stores `/uploads/...` in the same column, so nothing else changes.

## Login and student code
| Role | Logs in with |
|---|---|
| ADMIN / TEACHER / PARENT | `users.phone` (09xxxxxxxxx) + password |
| STUDENT | `students.student_code` + password |

Student code = `<entry year>-<entry grade>-<sequence>`, e.g. `1405-1-001`.
- `entry_year`, `entry_grade`, `entry_sequence` are stored in `students`; `student_code` is built from them by the **backend only**.
- The code is permanent. `entry_grade` is the grade when the student entered the school; the CURRENT grade is `students.grade_level` / `students.class_id`.
- The sequence counts inside (`entry_year` + `entry_grade`); unique indexes: `student_code` and (`entry_year`, `entry_grade`, `entry_sequence`).
- Code to build the next one: `backend/src/utils/studentCode.ts` (`allocateStudentCode`).
