/**
 * Demo logins created by the seed (development only; the login page lists them when running `npm run dev`).
 *   ADMIN / TEACHER / PARENT -> phone + password
 *   STUDENT                  -> student code + password
 * Never use these in a real school: change or delete them before going live.
 */
export const DEMO = {
  admin: { phone: "09120000001", password: "Admin@12345" },
  teacher: { phone: "09120000002", password: "Teacher@12345" },
  parent: { phone: "09121234567", password: "Parent@12345" },
  // The demo student is the first student of the demo class; his code comes from the entry data below.
  student: { password: "Student@12345" },
} as const;

/** The demo class is "ششم الف" in 1405-1406. Its students are treated as having entered in 1405, grade 6. */
export const DEMO_ENTRY = { year: 1405, grade: 6 } as const;
