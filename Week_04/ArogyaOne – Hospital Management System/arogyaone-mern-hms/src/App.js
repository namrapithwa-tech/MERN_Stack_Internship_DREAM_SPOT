import './assets/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- AUTH ---
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import AuthProvider from "./context/AuthContext"; // Wrapping App in AuthProvider is Best Practice

// --- LAYOUT ---
import MainLayout from "./components/layout/MainLayout";

// --- ADMIN PAGES ---
import Home from "./pages/Home";
import AdminDashboard from "./dashboards/admin/AdminDashboard";
import DoctorList from "./dashboards/admin/doctors/DoctorList";
import DoctorForm from "./dashboards/admin/doctors/DoctorForm";
import DoctorView from "./dashboards/admin/doctors/DoctorView";
import RoomCards from "./dashboards/admin/rooms/RoomCards";
import RoomForm from "./dashboards/admin/rooms/RoomForm";

// --- OTHER DASHBOARDS ---
import DoctorDashboard from "./dashboards/doctor/DoctorDashboard";
import BillingDashboard from "./dashboards/billing/BillingDashboard";
import PatientDashboard from "./dashboards/patient/PatientDashboard";
import LabDashboard from "./dashboards/departments/lab/LabDashboard";
import ECGDashboard from "./dashboards/departments/ecg/ECGDashboard";
import RadiologyDashboard from "./dashboards/departments/radiology/RadiologyDashboard";
import MRIDashboard from "./dashboards/departments/mri/MRIDashboard";
import SurgeryDashboard from "./dashboards/departments/surgery/SurgeryDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =======================
              PUBLIC ROUTES
          ======================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* =======================
              ADMIN DASHBOARD & MASTERS
          ======================= */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MainLayout><AdminDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          {/* ADMIN: DOCTOR MASTER */}
          <Route path="/admin/doctors" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><DoctorList /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors/add" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><DoctorForm /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors/edit/:id" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><DoctorForm /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors/view/:id" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><DoctorView /></MainLayout>
            </ProtectedRoute>
          } />

          {/* ADMIN: ROOM MASTER */}
          <Route path="/admin/rooms" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><RoomCards /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms/add" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><RoomForm /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms/edit/:id" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout><RoomForm /></MainLayout>
            </ProtectedRoute>
          } />

          {/* =======================
              REGISTRATION DESK (CLEAN SLATE)
          ======================= */}
          {/* We will add your new routes here shortly:
              1. /registration/dashboard
              2. /registration/walkin
          */}

          {/* =======================
              STAFF DASHBOARDS (All Wrapped in MainLayout)
          ======================= */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <MainLayout><DoctorDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={["BILLING"]}>
                <MainLayout><BillingDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
                <MainLayout><PatientDashboard /></MainLayout>
            </ProtectedRoute>
          } />

          {/* =======================
              DEPARTMENT DASHBOARDS (All Wrapped in MainLayout)
          ======================= */}
          <Route path="/department/lab" element={
            <ProtectedRoute allowedRoles={["LAB"]}>
                <MainLayout><LabDashboard /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/department/ecg" element={
            <ProtectedRoute allowedRoles={["ECG"]}>
                <MainLayout><ECGDashboard /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/department/radiology" element={
            <ProtectedRoute allowedRoles={["RADIOLOGY"]}>
                <MainLayout><RadiologyDashboard /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/department/mri" element={
            <ProtectedRoute allowedRoles={["MRI"]}>
                <MainLayout><MRIDashboard /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/department/surgery" element={
            <ProtectedRoute allowedRoles={["SURGERY"]}>
                <MainLayout><SurgeryDashboard /></MainLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;