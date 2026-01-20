import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";

/* =======================
   ADMIN HOME PAGE 
======================= */
import Home from "./pages/Home";

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
   ADMIN – DOCTOR MASTER
======================= */
import DoctorList from "./dashboards/admin/doctors/DoctorList";
import DoctorForm from "./dashboards/admin/doctors/DoctorForm";
import DoctorView from "./dashboards/admin/doctors/DoctorView";

/* =======================
   ADMIN – ROOM MASTER
======================= */
import RoomCards from "./dashboards/admin/rooms/RoomCards";
import RoomForm from "./dashboards/admin/rooms/RoomForm";

/* =======================
   DEPARTMENT DASHBOARDS
======================= */
import LabDashboard from "./dashboards/departments/lab/LabDashboard";
import ECGDashboard from "./dashboards/departments/ecg/ECGDashboard";
import RadiologyDashboard from "./dashboards/departments/radiology/RadiologyDashboard";
import MRIDashboard from "./dashboards/departments/mri/MRIDashboard";
import SurgeryDashboard from "./dashboards/departments/surgery/SurgeryDashboard";
import PatientView from "./dashboards/registration/PatientView";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =======================
           ADMIN HOME PAGE ROUTES
        ======================= */}
        <Route path="/" element={<Home />} />

        {/* =======================
           AUTH ROUTES
        ======================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* =======================
           ADMIN DASHBOARD
        ======================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* =======================
           ADMIN – DOCTOR MASTER
        ======================= */}
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DoctorList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DoctorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DoctorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/doctors/view/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DoctorView />
            </ProtectedRoute>
          }
        />

        {/* =======================
           ADMIN – ROOM MASTER
        ======================= */}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RoomCards />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rooms/add"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RoomForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/rooms/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <RoomForm />
            </ProtectedRoute>
          }
        />

        {/* =======================
           REGISTRATION DESK
        ======================= */}
        <Route
          path="/registration"
          element={
            <ProtectedRoute allowedRoles={["REGISTRATION"]}>
              <RegistrationDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/registration/patient/:id"
          element={
            <ProtectedRoute allowedRoles={["REGISTRATION"]}>
              <PatientView />
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

        {/* =======================
           STAFF DASHBOARDS
        ======================= */}
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
