-- Creates the (empty) database for Farhang School.
-- Safe to run more than once: "IF NOT EXISTS" means nothing is deleted or replaced.
-- utf8mb4 = full Persian + emoji support.

CREATE DATABASE IF NOT EXISTS farhang_school
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
