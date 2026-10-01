import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />

                  <Route path="/patients" element={<PatientList />} />

                  <Route
                    path="/patients/register"
                    element={<Patients />}
                  />

                  <Route
                    path="/patients/:id"
                    element={<PatientDetails />}
                  />
                  <Route
  path="/doctors"
  element={<Doctors />}
/>
<Route
  path="/appointments"
  element={<Appointments />}
/>
<Route
  path="/doctors/:id"
  element={<DoctorDetails />}
/>
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;