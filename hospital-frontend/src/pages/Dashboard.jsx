
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Dashboard() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

const displayName =
  savedUser.fullName ||
  savedUser.name ||
  savedUser.username ||
  "User";

const userRole = String(savedUser.role || "")
  .toUpperCase()
  .replace(/^ROLE_/, "");
  const navigate = useNavigate();
const [stats, setStats] = useState({
  totalPatients: 0,
  totalDoctors: 0,
  emergencyAppointments: 0,
  availableBeds: 0,
});
  const [recentPatients, setRecentPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


useEffect(() => {
  let active = true;

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      setError("");

      const [statsResponse, appointmentsResponse, patientsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/dashboard/today-appointments`, { headers }),
          fetch(`${API_BASE_URL}/api/dashboard/recent-patients`, { headers }),
        ]);

      if (!statsResponse.ok) {
        throw new Error(
          `Dashboard stats failed with status ${statsResponse.status}`
        );
      }

      if (!appointmentsResponse.ok) {
        throw new Error(
          `Today's appointments failed with status ${appointmentsResponse.status}`
        );
      }

      if (!patientsResponse.ok) {
        throw new Error(
          `Recent patients failed with status ${patientsResponse.status}`
        );
      }

      const [statsData, appointmentsData, patientsData] =
        await Promise.all([
          statsResponse.json(),
          appointmentsResponse.json(),
          patientsResponse.json(),
        ]);

      if (!active) return;

     setStats({
  totalPatients: statsData.totalPatients ?? 0,
  totalDoctors: statsData.totalDoctors ?? 0,
  emergencyAppointments: statsData.emergencyAppointments ?? 0,
  availableBeds: statsData.availableBeds ?? null,
});

      setTodayAppointments(
        Array.isArray(appointmentsData) ? appointmentsData : []
      );

      setRecentPatients(
        Array.isArray(patientsData) ? patientsData : []
      );
    } catch (err) {
      if (active) {
        setError(err.message || "Unable to load dashboard");
      }
    } finally {
      if (active) setLoading(false);
    }
  };

  loadDashboard();

  const intervalId = setInterval(loadDashboard, 30000);

  return () => {
    active = false;
    clearInterval(intervalId);
  };
}, []);

  const formatTime = (value) => {
    if (!value) return "Time not set";

    // Supports Java LocalTime strings such as "10:00:00"
    const match = String(value).match(/^(\d{1,2}):(\d{2})/);

    if (match) {
      let hours = Number(match[1]);
      const minutes = match[2];
      const suffix = hours >= 12 ? "PM" : "AM";

      hours = hours % 12 || 12;

      return `${String(hours).padStart(2, "0")}:${minutes} ${suffix}`;
    }

    // Do not try to parse values such as "10:00 AM" as a Date.
    return String(value);
  };

  const patientName = (patient) =>
    patient.fullName ||
    patient.name ||
    patient.patientName ||
    "Unnamed Patient";

  const patientNumber = (patient) =>
    patient.registrationNumber ||
    patient.patientNumber ||
    patient.patientId ||
    patient.id ||
    "—";

  const appointmentPatient = (appointment) =>
    appointment.patientName ||
    appointment.patient?.fullName ||
    appointment.patient?.name ||
    "Patient";

  const appointmentDoctor = (appointment) =>
    appointment.doctorName ||
    appointment.doctor?.fullName ||
    appointment.doctor?.name ||
    "Doctor not assigned";

  const appointmentDepartment = (appointment) =>
    appointment.department ||
    appointment.doctor?.specialization ||
    appointment.specialization ||
    "Department not specified";

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <div>
        <h2>Welcome back, {displayName} 👋</h2>
<p>
  {userRole === "RECEPTIONIST"
    ? "Here is your reception dashboard overview."
    : "Here is your hospital overview."}
</p>
        </div>

        <button
          className="dashboard-action-btn"
          onClick={() => navigate("/patients/register")}
        >
          👤 Register Patient
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <strong>Dashboard data could not be loaded.</strong>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        
<div
  className="stat-card clickable-card"
  onClick={() => navigate("/patients")}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/patients");
    }
  }}
>
  <div className="stat-icon">👤</div>
  <div>
    <span>Total Patients</span>
    <h3>{loading ? "..." : stats.totalPatients}</h3>
  </div>
</div>


        
<div
  className="stat-card clickable-card"
  onClick={() => navigate("/doctors")}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/doctors");
    }
  }}
>
  <div className="stat-icon">🩺</div>
  <div>
    <span>Total Doctors</span>
    <h3>{loading ? "..." : stats.totalDoctors}</h3>
  </div>
</div>


      <div
  className="stat-card clickable-card"
onClick={() => navigate("/appointments?emergency=true")}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate("/appointments?emergency=true");
    }
  }}
>
  <div className="stat-icon">🚑</div>
  <div>
    <span>Emergency Appointments</span>
    <h3>{loading ? "..." : stats.emergencyAppointments}</h3>
  </div>
</div>
        <div className="stat-card">
          <div className="stat-icon">🛏️</div>
          <div>
            <span>Available Beds</span>
            <h3>
              {loading
                ? "..."
                : stats.availableBeds === null
                ? "0"
                : stats.availableBeds}
            </h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Patients</h3>
            <button onClick={() => navigate("/patients")}>
              View All
            </button>
          </div>

          {loading ? (
            <p>Loading patients...</p>
          ) : recentPatients.length === 0 ? (
            <p>No recent patients available.</p>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Registration No.</th>
                    <th>Gender</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentPatients.map((patient, index) => (
                    <tr key={patient.id ?? index}>
                      <td>{patientName(patient)}</td>
                      <td>{patientNumber(patient)}</td>
                      <td>{patient.gender || "—"}</td>
                      <td>
                        <span className="status active-status">
                          {patient.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Today's Appointments</h3>
            <button onClick={() => navigate("/appointments")}>
              View All
            </button>
          </div>

          {loading ? (
            <p>Loading appointments...</p>
          ) : todayAppointments.length === 0 ? (
            <p>No appointments scheduled for today.</p>
          ) : (
            todayAppointments.map((appointment, index) => (
              <div
                className="appointment"
                key={appointment.id ?? index}
              >
                <div className="appointment-time">
                  {formatTime(
                    appointment.appointmentTime ||
                    appointment.time ||
                    appointment.startTime
                  )}
                </div>

                <div>
                  <strong>{appointmentPatient(appointment)}</strong>
                  <span>
                    {appointmentDoctor(appointment)} •{" "}
                    {appointmentDepartment(appointment)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
