import { Navigate, Route, Routes } from "react-router-dom";

// ================= AUTH =================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Logout from "./pages/auth/Logout";
import Unauthorized from "./pages/auth/Unauthorized";

// ================= COMMON =================
import Settings from "./pages/settings/Settings";
import Notifications from "./pages/notifications/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import AIChat from "./pages/AIChat";
// ================= STUDENT =================
import StudentProfile from "./pages/student/MyProfile";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAlumniSearch from "./pages/student/AlumniSearch";
import StudentAlumniProfile from "./pages/student/AlumniProfile";
import MentorSearch from "./pages/student/MentorSearch";
import StudentMentorRequests from "./pages/student/MentorRequests";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import StudentEvents from "./pages/student/Events";

// ================= ALUMNI =================
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import AlumniJobs from "./pages/alumni/Jobs";
import JobApplications from "./pages/alumni/JobApplications";
import AlumniMentorProfile from "./pages/alumni/MentorProfile";
import AlumniMentorRequests from "./pages/alumni/MentorRequests";
import AlumniEvents from "./pages/alumni/Events";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import AlumniManagement from "./pages/admin/AlumniManagement";
import AlumniEngagement from "./pages/admin/AlumniEngagement";
import JobsManagement from "./pages/admin/JobsManagement";
import EventManagement from "./pages/admin/EventsManagement";
import UserManagement from "./pages/admin/UserManagement";

function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* =====================================================
          COMMON AUTHENTICATED ROUTES
          STUDENT + ALUMNI + ADMIN
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["STUDENT", "ALUMNI", "ADMIN"]} />
        }
      >
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/ask-ai" element={<AIChat />} />
      </Route>

      {/* =====================================================
          STUDENT ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        <Route path="/student/profile" element={<StudentProfile />} />

        <Route path="/student/alumni" element={<StudentAlumniSearch />} />

        <Route path="/student/alumni/:id" element={<StudentAlumniProfile />} />

        <Route path="/student/mentors" element={<MentorSearch />} />

        <Route
          path="/student/mentor-requests"
          element={<StudentMentorRequests />}
        />

        <Route path="/student/jobs" element={<StudentJobs />} />

        <Route path="/student/applications" element={<StudentApplications />} />

        <Route path="/student/events" element={<StudentEvents />} />
      </Route>

      {/* =====================================================
          ALUMNI ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["ALUMNI"]} />}>
        <Route path="/alumni/dashboard" element={<AlumniDashboard />} />

        <Route path="/alumni/profile" element={<AlumniProfile />} />

        <Route path="/alumni/jobs" element={<AlumniJobs />} />

        <Route
          path="/alumni/jobs/:jobId/applications"
          element={<JobApplications />}
        />

        <Route
          path="/alumni/mentor-profile"
          element={<AlumniMentorProfile />}
        />

        <Route
          path="/alumni/mentor-requests"
          element={<AlumniMentorRequests />}
        />

        <Route path="/alumni/events" element={<AlumniEvents />} />
      </Route>

      {/* =====================================================
          ADMIN ROUTES
      ===================================================== */}

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/alumni" element={<AlumniManagement />} />

        <Route path="/admin/engagement" element={<AlumniEngagement />} />

        <Route path="/admin/jobs" element={<JobsManagement />} />

        <Route path="/admin/events" element={<EventManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>

      {/* =====================================================
          DEFAULT ROUTE
      ===================================================== */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* =====================================================
          UNKNOWN URL
      ===================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
