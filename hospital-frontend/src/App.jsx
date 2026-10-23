
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DoctorModule from "./pages/DoctorModule";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientList from "./pages/PatientList";
import PatientDetails from "./pages/PatientDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import DoctorDetails from "./pages/DoctorDetails";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getRole(user) {
  return String(
    user?.role || user?.user?.role || user?.userRole || ""
  ).toUpperCase();
}

function ProtectedRoute({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminOnlyRoute({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (getRole(user) !== "ADMIN") {
    return <Navigate to="/doctor-module" replace />;
  }

  return children;
}

function DoctorModuleRoute({ children }) {
  const user = getUser();
  const role = getRole(user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN" && role !== "DOCTOR") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Doctor module outside Admin layout */}
       <Route
  path="/doctor-module"
  element={
    <DoctorModuleRoute>
      <DoctorModule />
    </DoctorModuleRoute>
  }
/>
        {/* Admin pages inside MainLayout */}
        <Route
          path="/"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <PatientList />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/patients/register"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <Patients />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/patients/:id"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <PatientDetails />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/doctors"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <Doctors />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/doctors/:id"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <DoctorDetails />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <AdminOnlyRoute>
              <MainLayout>
                <Appointments />
              </MainLayout>
            </AdminOnlyRoute>
          }
        />

        {/* Redirect unknown URLs according to role */}
        <Route
          path="*"
          element={
            getRole(getUser()) === "DOCTOR" ? (
              <Navigate to="/doctor-module" replace />
            ) : getRole(getUser()) === "ADMIN" ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;