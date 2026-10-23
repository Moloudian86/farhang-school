import { Route, Routes } from "react-router-dom";
import PanelLayout from "./components/panel/PanelLayout";
import { PanelRedirect, RequireAuth, RoleGate } from "./components/panel/RoleGate";
import Layout from "./components/layout/Layout";
import About from "./pages/About";
import ComingSoon from "./pages/ComingSoon";
import Contact from "./pages/Contact";
import Enrollment from "./pages/Enrollment";
import Events from "./pages/Events";
import Facilities from "./pages/Facilities";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";
import Login from "./pages/Login";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import AdminDashboard from "./pages/panel/admin/AdminDashboard";
import AdminEnrollments from "./pages/panel/admin/AdminEnrollments";
import AdminMessages from "./pages/panel/admin/AdminMessages";
import ParentScope from "./pages/panel/ParentScope";
import {
  AnnouncementsPage, AttendancePage, ExamsPage, GradesPage, HomeworkPage, MessagesPage, ProfilePage, ReportCardPage, SchedulePage,
} from "./pages/panel/shared/StudentPages";
import StudentScope from "./pages/panel/StudentScope";
import TeacherAttendance from "./pages/panel/teacher/TeacherAttendance";
import TeacherClasses from "./pages/panel/teacher/TeacherClasses";
import TeacherGrades from "./pages/panel/teacher/TeacherGrades";
import TeacherHomework from "./pages/panel/teacher/TeacherHomework";
import TeacherSchedule from "./pages/panel/teacher/TeacherSchedule";
import TuitionPage from "./pages/panel/TuitionPage";
import Staff from "./pages/Staff";

/** The pages a student sees, and a parent sees for his child. Both scopes provide the data. */
const studentPages = (
  <>
    <Route index element={<ProfilePage />} />
    <Route path="schedule" element={<SchedulePage />} />
    <Route path="grades" element={<GradesPage />} />
    <Route path="report-card" element={<ReportCardPage />} />
    <Route path="homework" element={<HomeworkPage />} />
    <Route path="attendance" element={<AttendancePage />} />
    <Route path="announcements" element={<AnnouncementsPage />} />
    <Route path="messages" element={<MessagesPage />} />
    <Route path="exams" element={<ExamsPage />} />
  </>
);

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="staff" element={<Staff />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="news" element={<News />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>

      {/* Private panels: must be logged in, and each role only gets its own folder */}
      <Route path="panel" element={<RequireAuth><PanelLayout /></RequireAuth>}>
        <Route index element={<PanelRedirect />} />

        <Route path="admin" element={<RoleGate role="ADMIN" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        <Route path="teacher" element={<RoleGate role="TEACHER" />}>
          <Route index element={<TeacherClasses />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="homework" element={<TeacherHomework />} />
          <Route path="schedule" element={<TeacherSchedule />} />
        </Route>

        <Route path="student" element={<RoleGate role="STUDENT" />}>
          <Route element={<StudentScope />}>{studentPages}</Route>
        </Route>

        <Route path="parent" element={<RoleGate role="PARENT" />}>
          <Route element={<ParentScope />}>
            {studentPages}
            <Route path="tuition" element={<TuitionPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
