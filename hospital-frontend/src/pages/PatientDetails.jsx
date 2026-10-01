import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);

  const [error, setError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

  useEffect(() => {
    loadPatientDetails();
  }, [id]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      setAppointmentLoading(true);

      setError("");
      setAppointmentError("");

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        throw new Error("Please login again");
      }

      const user = JSON.parse(storedUser);

      if (!user || !user.token) {
        throw new Error("Please login again");
      }

      // ==========================================
      // Get Patient Details
      // ==========================================

      const patientResponse = await fetch(
        `${API_BASE_URL}/api/patients/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const patientText = await patientResponse.text();

      if (!patientResponse.ok) {
        let errorMessage =
          `Patient details could not be loaded (${patientResponse.status})`;

        if (patientText) {
          try {
            const errorData = JSON.parse(patientText);

            errorMessage =
              errorData.message ||
              errorData.error ||
              errorMessage;
          } catch {
            errorMessage = patientText;
          }
        }

        throw new Error(errorMessage);
      }

      const patientData = patientText
        ? JSON.parse(patientText)
        : null;

      setPatient(patientData);

      // ==========================================
      // Get Patient Appointment History
      // ==========================================

      try {
        const appointmentResponse = await fetch(
          `${API_BASE_URL}/api/appointments/patient/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const appointmentText =
          await appointmentResponse.text();

        if (!appointmentResponse.ok) {
          let errorMessage =
            `Patient appointments could not be loaded (${appointmentResponse.status})`;

          if (appointmentText) {
            try {
              const errorData =
                JSON.parse(appointmentText);

              errorMessage =
                errorData.message ||
                errorData.error ||
                errorMessage;
            } catch {
              errorMessage = appointmentText;
            }
          }

          throw new Error(errorMessage);
        }

        const appointmentData = appointmentText
          ? JSON.parse(appointmentText)
          : [];

        setAppointments(
          Array.isArray(appointmentData)
            ? appointmentData
            : []
        );
      } catch (err) {
        console.error(
          "Appointment history error:",
          err
        );

        setAppointmentError(err.message);
        setAppointments([]);
      }
    } catch (err) {
      console.error(
        "Patient details error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
      setAppointmentLoading(false);
    }
  };

  // ==========================================
  // Get Last Appointment
  // ==========================================

  const getLastAppointment = () => {
    if (
      !appointments ||
      appointments.length === 0
    ) {
      return null;
    }

    return [...appointments].sort((a, b) => {
      const dateA = new Date(
        `${a.appointmentDate}T${
          a.appointmentTime || "00:00:00"
        }`
      );

      const dateB = new Date(
        `${b.appointmentDate}T${
          b.appointmentTime || "00:00:00"
        }`
      );

      return dateB - dateA;
    })[0];
  };

  const lastAppointment = getLastAppointment();

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="table-message">
        Loading patient details...
      </div>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <div className="error-message">
        ✕ {error}

        <div style={{ marginTop: "15px" }}>
          <button
            className="back-btn"
            onClick={() =>
              navigate("/patients")
            }
          >
            ← Back to Patients
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // Patient Not Found
  // ==========================================

  if (!patient) {
    return (
      <div className="table-message">
        Patient not found.

        <div style={{ marginTop: "15px" }}>
          <button
            className="back-btn"
            onClick={() =>
              navigate("/patients")
            }
          >
            ← Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-details-page">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="page-title">

        <div>
          <h2>Patient Details</h2>

          <p>
            Complete information of the registered
            patient.
          </p>
        </div>

        <button
          className="back-btn"
          onClick={() =>
            navigate("/patients")
          }
        >
          ← Back to Patients
        </button>

      </div>

      {/* ==========================================
          Patient Header Card
      ========================================== */}

      <div className="patient-profile-card">

        <div className="patient-avatar">
          {patient.fullName
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div className="patient-profile-info">

          <h3>
            {patient.fullName}
          </h3>

          <p>
            Registration No:
            <strong>
              {" "}
              {patient.registrationNumber}
            </strong>
          </p>

        </div>

      </div>

      {/* ==========================================
          Personal Information
      ========================================== */}

      <div className="details-card">

        <h3>Personal Information</h3>

        <div className="details-grid">

          <div className="detail-item">
            <span>Full Name</span>

            <strong>
              {patient.fullName || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Date of Birth</span>

            <strong>
              {patient.dateOfBirth || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Gender</span>

            <strong>
              {patient.gender || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Blood Group</span>

            <strong>
              {patient.bloodGroup || "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* ==========================================
          Contact Information
      ========================================== */}

      <div className="details-card">

        <h3>Contact Information</h3>

        <div className="details-grid">

          <div className="detail-item">
            <span>Mobile Number</span>

            <strong>
              {patient.mobileNumber || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Email</span>

            <strong>
              {patient.email || "-"}
            </strong>
          </div>

          <div className="detail-item detail-full">
            <span>Address</span>

            <strong>
              {patient.address || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span>Emergency Contact</span>

            <strong>
              {patient.emergencyContact || "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* ==========================================
          Registration Information
      ========================================== */}

      <div className="details-card">

        <h3>Registration Information</h3>

        <div className="details-grid">

          <div className="detail-item">

            <span>
              Registration Number
            </span>

            <strong className="registration-number">
              {patient.registrationNumber || "-"}
            </strong>

          </div>

          <div className="detail-item">

            <span>Patient ID</span>

            <strong>
              {patient.id || "-"}
            </strong>

          </div>

          <div className="detail-item">

            <span>Registered On</span>

            <strong>
              {patient.createdAt
                ? new Date(
                    patient.createdAt
                  ).toLocaleString()
                : "-"}
            </strong>

          </div>

        </div>

      </div>

      {/* ==========================================
          Last Visit
      ========================================== */}

      <div className="details-card">

        <h3>Last Visit</h3>

        {appointmentLoading ? (

          <p>
            Loading appointment information...
          </p>

        ) : appointmentError ? (

          <p className="error-message">
            ✕ {appointmentError}
          </p>

        ) : !lastAppointment ? (

          <p>
            No previous appointments found.
          </p>

        ) : (

          <div className="details-grid">

            {/* Last Doctor */}

            <div className="detail-item">

              <span>Last Doctor</span>

              <strong
                style={{
                  cursor: lastAppointment.doctorId
                    ? "pointer"
                    : "default",
                  color: lastAppointment.doctorId
                    ? "#0F4C81"
                    : "inherit",
                  textDecoration:
                    lastAppointment.doctorId
                      ? "underline"
                      : "none"
                }}
                onClick={() => {
                  if (
                    lastAppointment.doctorId
                  ) {
                    navigate(
                      `/doctors/${lastAppointment.doctorId}`
                    );
                  }
                }}
              >
                {lastAppointment.doctorName ||
                  "-"}
              </strong>

            </div>

            {/* Specialization */}

            <div className="detail-item">

              <span>
                Specialization
              </span>

              <strong>
                {lastAppointment.specialization ||
                  "-"}
              </strong>

            </div>

            {/* Last Visit Date */}

            <div className="detail-item">

              <span>
                Last Visit Date
              </span>

              <strong>
                {lastAppointment.appointmentDate ||
                  "-"}
              </strong>

            </div>

            {/* Visit Time */}

            <div className="detail-item">

              <span>Visit Time</span>

              <strong>
                {lastAppointment.appointmentTime ||
                  "-"}
              </strong>

            </div>

            {/* Reason */}

            <div className="detail-item">

              <span>Reason</span>

              <strong>
                {lastAppointment.reason ||
                  "-"}
              </strong>

            </div>

            {/* Referred By */}

            <div className="detail-item">

              <span>Referred By</span>

              <strong>
                {lastAppointment.referredBy ||
                  "-"}
              </strong>

            </div>

            {/* Status */}

            <div className="detail-item">

              <span>Status</span>

              <strong>
                {lastAppointment.status ||
                  "-"}
              </strong>

            </div>

          </div>

        )}

      </div>

      {/* ==========================================
          Previous Appointments
      ========================================== */}

      <div className="details-card">

        <h3>Previous Appointments</h3>

        {appointmentLoading ? (

          <p>
            Loading appointments...
          </p>

        ) : appointmentError ? (

          <p className="error-message">
            ✕ {appointmentError}
          </p>

        ) : appointments.length === 0 ? (

          <p>
            No appointment history available.
          </p>

        ) : (

          <div
            style={{
              overflowX: "auto"
            }}
          >

            <table className="patient-table">

              <thead>

                <tr>

                  <th>Date</th>

                  <th>Time</th>

                  <th>Doctor</th>

                  <th>
                    Specialization
                  </th>

                  <th>Reason</th>

                  <th>
                    Referred By
                  </th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {[...appointments]
                  .sort((a, b) => {

                    const dateA =
                      new Date(
                        `${a.appointmentDate}T${
                          a.appointmentTime ||
                          "00:00:00"
                        }`
                      );

                    const dateB =
                      new Date(
                        `${b.appointmentDate}T${
                          b.appointmentTime ||
                          "00:00:00"
                        }`
                      );

                    return dateB - dateA;
                  })
                  .map((appointment) => (

                    <tr
                      key={appointment.id}
                    >

                      <td>
                        {appointment.appointmentDate ||
                          "-"}
                      </td>

                      <td>
                        {appointment.appointmentTime ||
                          "-"}
                      </td>

                      <td>

                        <span
                          style={{
                            cursor:
                              appointment.doctorId
                                ? "pointer"
                                : "default",
                            color:
                              appointment.doctorId
                                ? "#0F4C81"
                                : "inherit",
                            textDecoration:
                              appointment.doctorId
                                ? "underline"
                                : "none"
                          }}
                          onClick={() => {
                            if (
                              appointment.doctorId
                            ) {
                              navigate(
                                `/doctors/${appointment.doctorId}`
                              );
                            }
                          }}
                        >
                          {appointment.doctorName ||
                            "-"}
                        </span>

                      </td>

                      <td>
                        {appointment.specialization ||
                          "-"}
                      </td>

                      <td>
                        {appointment.reason ||
                          "-"}
                      </td>

                      <td>
                        {appointment.referredBy ||
                          "-"}
                      </td>

                      <td>
                        {appointment.status ||
                          "-"}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default PatientDetails;