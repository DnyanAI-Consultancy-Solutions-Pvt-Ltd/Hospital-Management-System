import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../services/api";

function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.token || "";
  };

  useEffect(() => {
    fetchDoctor();
    fetchDoctorAppointments();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/doctors/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Failed to load doctor details");
      }

      const data = text ? JSON.parse(text) : null;

      setDoctor(data);
    } catch (err) {
      console.error("Doctor details error:", err);
      setError(err.message || "Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      setAppointmentLoading(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/doctor/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Failed to load doctor appointments");
      }

      const data = text ? JSON.parse(text) : [];

      const sortedAppointments = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const dateA = new Date(
              `${a.appointmentDate || ""}T${a.appointmentTime || "00:00"}`
            );

            const dateB = new Date(
              `${b.appointmentDate || ""}T${b.appointmentTime || "00:00"}`
            );

            return dateB - dateA;
          })
        : [];

      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Doctor appointments error:", err);
      setAppointments([]);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return date;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");

    const d = new Date();
    d.setHours(Number(hours), Number(minutes), 0, 0);

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClass = (status) => {
    if (!status) return "status-default";

    return `status-${status.toLowerCase().replace(/_/g, "-")}`;
  };

  if (loading) {
    return (
      <div className="doctor-details-page">
        <div className="loading-box">
          Loading doctor details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-details-page">
        <div className="error-box">
          <h3>Unable to load doctor</h3>
          <p>{error}</p>

          <button
            className="back-btn"
            onClick={() => navigate("/appointments")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-details-page">
        <div className="error-box">
          <h3>Doctor not found</h3>

          <button
            className="back-btn"
            onClick={() => navigate("/appointments")}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-details-page">

      {/* Header */}
      <div className="details-header">
        <div>
          <h1>Doctor Details</h1>
          <p>Complete doctor profile and appointment information</p>
        </div>

        <button
          className="back-btn"
          onClick={() => navigate("/appointments")}
        >
          ← Back to Appointments
        </button>
      </div>

      {/* Doctor Profile */}
      <div className="doctor-profile-card">

        <div className="doctor-avatar">
          {(
            doctor.fullName ||
            doctor.doctorName ||
            "D"
          )
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="doctor-profile-info">
          <h2>
            {doctor.fullName ||
              doctor.doctorName ||
              "-"}
          </h2>

          <p className="specialization-text">
            {doctor.specialization || "Doctor"}
          </p>

          <div className="doctor-meta">

            <span>
              Doctor ID:
              <strong>{doctor.id || id}</strong>
            </span>

            <span>
              Availability:
              <strong>
                {doctor.available ? "Available" : "Not Available"}
              </strong>
            </span>

          </div>
        </div>

      </div>

      {/* Professional Information */}
      <section className="details-section">

        <div className="section-title">
          <span className="section-icon">🩺</span>

          <div>
            <h2>Professional Information</h2>
            <p>Doctor professional details</p>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-item">
            <span>Doctor Name</span>
            <strong>
              {doctor.fullName ||
                doctor.doctorName ||
                "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Specialization</span>
            <strong>
              {doctor.specialization || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Doctor ID</span>
            <strong>
              {doctor.id || id}
            </strong>
          </div>

          <div className="detail-item">
            <span>Availability</span>

            <strong
              className={
                doctor.available
                  ? "available-text"
                  : "not-available-text"
              }
            >
              {doctor.available
                ? "Available"
                : "Not Available"}
            </strong>
          </div>

        </div>

      </section>

      {/* Contact Information */}
      <section className="details-section">

        <div className="section-title">
          <span className="section-icon">📞</span>

          <div>
            <h2>Contact Information</h2>
            <p>Doctor contact details</p>
          </div>
        </div>

        <div className="details-grid">

          <div className="detail-item">
            <span>Email</span>
            <strong>
              {doctor.email || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Mobile Number</span>
            <strong>
              {doctor.mobileNumber ||
                doctor.phoneNumber ||
                "-"}
            </strong>
          </div>

        </div>

      </section>

      {/* Appointments */}
      <section className="details-section">

        <div className="section-title">
          <span className="section-icon">📅</span>

          <div>
            <h2>Appointments</h2>
            <p>
              Patient appointments assigned to this doctor
            </p>
          </div>
        </div>

        {appointmentLoading ? (
          <div className="loading-box">
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-box">
            No appointments found for this doctor.
          </div>
        ) : (
          <div className="table-container">

            <table className="appointments-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Registration No.</th>
                  <th>Reason</th>
                  <th>Referred By</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {appointments.map((appointment) => (
                  <tr key={appointment.id}>

                    <td>
                      {formatDate(
                        appointment.appointmentDate
                      )}
                    </td>

                    <td>
                      {formatTime(
                        appointment.appointmentTime
                      )}
                    </td>

                    <td>
                      <strong>
                        {appointment.patientName || "-"}
                      </strong>
                    </td>

                    <td>
                      {appointment.registrationNumber || "-"}
                    </td>

                    <td>
                      {appointment.reason || "-"}
                    </td>

                    <td>
                      {appointment.referredBy || "-"}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status || "-"}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default DoctorDetails;