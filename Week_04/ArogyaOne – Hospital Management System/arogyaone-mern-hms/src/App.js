import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

/* =======================
   PUBLIC WEBSITE PAGES
======================= */
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import BookAppointment from "./pages/BookAppointment";
import AppointmentSlip from "./pages/AppointmentSlip";

/* =======================
   DASHBOARDS
======================= */
import AdminDashboard from "./dashboards/admin/AdminDashboard";
import DoctorDashboard from "./dashboards/doctor/DoctorDashboard";
import RegistrationDashboard from "./dashboards/registration/RegistrationDashboard";
import BillingDashboard from "./dashboards/billing/BillingDashboard";
import PatientDashboard from "./dashboards/patient/PatientDashboard";

/* =======================
   REGISTRATION FLOW
======================= */
import RegistrationConfirm from "./dashboards/registration/RegistrationConfirm";

/* =======================
   DEPARTMENT DASHBOARDS
======================= */
import LabDashboard from "./dashboards/departments/lab/LabDashboard";
import ECGDashboard from "./dashboards/departments/ecg/ECGDashboard";
import RadiologyDashboard from "./dashboards/departments/radiology/RadiologyDashboard";
import MRIDashboard from "./dashboards/departments/mri/MRIDashboard";
import SurgeryDashboard from "./dashboards/departments/surgery/SurgeryDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =======================
           PUBLIC ROUTES
        ======================= */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="/appointment-slip/:appointmentId" element={<AppointmentSlip />} />

        {/* =======================
           AUTH ROUTES
        ======================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* =======================
           ADMIN & STAFF DASHBOARDS
        ======================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registration"
          element={
            <ProtectedRoute allowedRoles={["REGISTRATION"]}>
              <RegistrationDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registration/confirm/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["REGISTRATION"]}>
              <RegistrationConfirm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={["BILLING"]}>
              <BillingDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* =======================
           DEPARTMENT DASHBOARDS
        ======================= */}
        <Route
          path="/department/lab"
          element={
            <ProtectedRoute allowedRoles={["LAB"]}>
              <LabDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department/ecg"
          element={
            <ProtectedRoute allowedRoles={["ECG"]}>
              <ECGDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department/radiology"
          element={
            <ProtectedRoute allowedRoles={["RADIOLOGY"]}>
              <RadiologyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department/mri"
          element={
            <ProtectedRoute allowedRoles={["MRI"]}>
              <MRIDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department/surgery"
          element={
            <ProtectedRoute allowedRoles={["SURGERY"]}>
              <SurgeryDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
