import { useEffect, useState } from "react";
import API_BASE_URL from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Patient Search
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearching, setPatientSearching] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    referredBy: ""
  });

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const getToken = () => {
    return getUser()?.token;
  };

  // ==========================
  // Load Appointments
  // ==========================

  const loadAppointments = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || "Unable to load appointments"
        );
      }

      const data = await response.json();

      setAppointments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ==========================
  // Load Doctors
  // ==========================

  const loadDoctors = async () => {
    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/doctors/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          text || "Unable to load doctors"
        );
      }

      const data = await response.json();

      setDoctors(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ==========================
  // Load Initial Data
  // ==========================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadAppointments(),
        loadDoctors()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================
  // Patient Search
  // ==========================

  const handlePatientSearch = async (value) => {
    setPatientSearch(value);

    // If user changes the selected patient
    // clear previous selection
    if (
      selectedPatient &&
      value !== selectedPatient.fullName
    ) {
      setSelectedPatient(null);

      setForm((previous) => ({
        ...previous,
        patientId: ""
      }));
    }

    if (!value.trim()) {
      setPatientResults([]);
      return;
    }

    try {
      setPatientSearching(true);

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/api/patients/search?query=${encodeURIComponent(
          value.trim()
        )}&page=0&size=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text || "Patient search failed"
        );
      }

      const data = await response.json();

      setPatientResults(data.content || []);
    } catch (err) {
      console.error("Patient search error:", err);
      setPatientResults([]);
    } finally {
      setPatientSearching(false);
    }
  };

  // ==========================
  // Select Patient
  // ==========================

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);

    setPatientSearch(patient.fullName);

    setPatientResults([]);

    setForm((previous) => ({
      ...previous,
      patientId: patient.id
    }));
  };

  // ==========================
  // Form Change
  // ==========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ==========================
  // Book Appointment
  // ==========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!selectedPatient || !form.patientId) {
        throw new Error(
          "Please search and select a patient."
        );
      }

      if (!form.doctorId) {
        throw new Error(
          "Please select a doctor."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/appointments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },

          body: JSON.stringify({
            patientId: Number(form.patientId),
            doctorId: Number(form.doctorId),
            appointmentDate: form.appointmentDate,
            appointmentTime: form.appointmentTime,
            reason: form.reason,
            referredBy: form.referredBy
          })
        }
      );

     const text = await response.text();

if (!response.ok) {
  throw new Error(
    text || "Appointment booking failed"
  );
}

const data = JSON.parse(text);

setMessage(
  `Appointment booked successfully. Token No: ${data.tokenNumber}`
);

      // Reset form
      setForm({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
      });

      setPatientSearch("");
      setPatientResults([]);
      setSelectedPatient(null);

      setShowForm(false);

      await loadAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // Update Status
  // ==========================

  const updateStatus = async (
    appointmentId,
    status
  ) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/status?status=${status}`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          text ||
            "Unable to update appointment status"
        );
      }

      setMessage(
        `Appointment status changed to ${status}.`
      );

      await loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  // ==========================
  // Status Badge
  // ==========================

  const getStatusClass = (status) => {
    switch (status) {
      case "BOOKED":
        return "status-booked";

      case "WAITING":
        return "status-waiting";

      case "IN_CONSULTATION":
        return "status-consultation";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // ==========================
  // Today's Date
  // ==========================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <div className="doctor-page">

      {/* ==========================
          PAGE HEADER
          ========================== */}

      <div className="page-title">

        <div>
          <h2>Appointment Management</h2>

          <p>
            Manage patient appointments and OPD
            scheduling.
          </p>
        </div>

        <div>

          <button
            className="save-btn"
            onClick={() => {
              setShowForm(!showForm);
              setError("");
              setMessage("");

              if (showForm) {
                setPatientSearch("");
                setPatientResults([]);
                setSelectedPatient(null);

                setForm({
                  patientId: "",
                  doctorId: "",
                  appointmentDate: "",
                  appointmentTime: "",
                  reason: ""
                });
              }
            }}
          >
            {showForm
              ? "✕ Close"
              : "➕ Book Appointment"}
          </button>

          <button
            className="save-btn"
            onClick={loadAppointments}
            style={{
              marginLeft: "10px"
            }}
          >
            ↻ Refresh
          </button>

        </div>

      </div>

      {/* ==========================
          MESSAGES
          ========================== */}

      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ✕ {error}
        </div>
      )}

      {/* ==========================
          BOOK APPOINTMENT FORM
          ========================== */}

      {showForm && (

        <div className="patient-card">

          <h3>Book Appointment</h3>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              {/* ==========================
                  SEARCH PATIENT
                  ========================== */}

              <div
                className="form-group"
                style={{
                  position: "relative"
                }}
              >

                <label>
                  Search Patient *
                </label>

                <input
                  type="text"
                  placeholder="Search by name, mobile or registration number..."
                  value={patientSearch}
                  onChange={(e) =>
                    handlePatientSearch(
                      e.target.value
                    )
                  }
                  autoComplete="off"
                />

                {/* Searching */}

                {patientSearching && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "5px"
                    }}
                  >
                    Searching patients...
                  </small>
                )}

                {/* Patient Results */}

                {!patientSearching &&
                  patientResults.length > 0 && (

                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        zIndex: 1000,
                        maxHeight: "250px",
                        overflowY: "auto",
                        boxShadow:
                          "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    >

                      {patientResults.map(
                        (patient) => (

                          <div
                            key={patient.id}
                            onClick={() =>
                              handleSelectPatient(
                                patient
                              )
                            }
                            style={{
                              padding: "12px",
                              cursor: "pointer",
                              borderBottom:
                                "1px solid #eee"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "#f5f9ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "#fff";
                            }}
                          >

                            <strong>
                              {patient.fullName}
                            </strong>

                            <br />

                            <small>
                              Reg No:{" "}
                              {patient.registrationNumber}
                              {" | "}
                              Mobile:{" "}
                              {patient.mobileNumber}
                            </small>

                            {patient.gender && (
                              <>
                                {" | "}
                                <small>
                                  {patient.gender}
                                </small>
                              </>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  )}

                {/* No Patient Found */}

                {!patientSearching &&
                  patientSearch.trim() &&
                  patientResults.length === 0 &&
                  !selectedPatient && (

                    <small
                      style={{
                        display: "block",
                        marginTop: "5px"
                      }}
                    >
                      No patient found.
                    </small>

                  )}

                {/* Selected Patient */}

                {selectedPatient && (

                  <div
                    style={{
                      marginTop: "8px",
                      padding: "10px",
                      background: "#f0f8ff",
                      border:
                        "1px solid #cce5ff",
                      borderRadius: "6px"
                    }}
                  >

                    <strong>
                      ✓ {selectedPatient.fullName}
                    </strong>

                    <br />

                    <small>
                      Registration No:{" "}
                      {
                        selectedPatient.registrationNumber
                      }
                      {" | "}
                      Mobile:{" "}
                      {
                        selectedPatient.mobileNumber
                      }
                    </small>

                  </div>

                )}

              </div>

              {/* ==========================
                  DOCTOR
                  ========================== */}

              <div className="form-group">

                <label>
                  Doctor *
                </label>

                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Doctor
                  </option>

                  {doctors.map((doctor) => (

                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      Dr. {doctor.fullName}
                      {" - "}
                      {doctor.specialization}
                    </option>

                  ))}

                </select>

              </div>

              {/* ==========================
                  DATE
                  ========================== */}

              <div className="form-group">

                <label>
                  Appointment Date *
                </label>

                <input
                  type="date"
                  name="appointmentDate"
                  value={
                    form.appointmentDate
                  }
                  onChange={handleChange}
                  min={today}
                  required
                />

              </div>

              {/* ==========================
                  TIME
                  ========================== */}

              <div className="form-group">

                <label>
                  Appointment Time *
                </label>

                <input
                  type="time"
                  name="appointmentTime"
                  value={
                    form.appointmentTime
                  }
                  onChange={handleChange}
                  required
                />

              </div>

              {/* ==========================
                  REASON
                  ========================== */}

              <div
                className="form-group"
                style={{
                  gridColumn: "1 / -1"
                }}
              >

                <label>
                  Reason / Symptoms
                </label>

                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="Enter reason or symptoms"
                  maxLength="500"
                  rows="4"
                />

              </div>

            </div>
<div className="form-group">
  <label>Referred By</label>
  <input
    type="text"
    name="referredBy"
    value={form.referredBy}
    onChange={handleChange}
    placeholder="Enter referring doctor / hospital / person"
  />
</div>
            {/* ==========================
                SUBMIT
                ========================== */}

            <button
              type="submit"
              className="save-btn"
              disabled={
                saving || !selectedPatient
              }
            >

              {saving
                ? "Booking..."
                : "📅 Book Appointment"}

            </button>

          </form>

        </div>

      )}

      {/* ==========================
          APPOINTMENT LIST
          ========================== */}

      <div className="patient-card">

        <div className="page-title">

          <div>

            <h3>Appointments</h3>

            <p>
              All scheduled patient
              appointments.
            </p>

          </div>

        </div>

        {loading ? (

          <p>
            Loading appointments...
          </p>

        ) : appointments.length === 0 ? (

          <p>
            No appointments found.
          </p>

        ) : (

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>ID</th>
<th>Token</th>
                  <th>Patient</th>

                  <th>Doctor</th>

                  <th>Specialization</th>

                  <th>Date</th>

                  <th>Time</th>

                  <th>Reason</th>
<th>Referred By</th>
                  <th>Status</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {appointments.map(
                  (appointment) => (

                    <tr
                      key={appointment.id}
                    >

                      <td>
                        #{appointment.id}
                      </td>

<td>
  <strong>
    {appointment.tokenNumber || "-"}
  </strong>
</td>

                      <td>

                        <strong>
                          {
                            appointment.patientName
                          }
                        </strong>

                        <br />

                        <small>
                          {
                            appointment.registrationNumber
                          }
                        </small>

                      </td>

                      <td>
                        Dr.{" "}
                        {
                          appointment.doctorName
                        }
                      </td>

                      <td>
                        {
                          appointment.specialization
                        }
                      </td>

                      <td>
                        {
                          appointment.appointmentDate
                        }
                      </td>

                      <td>
                        {
                          appointment.appointmentTime
                        }
                      </td>

                      <td>
                        {
                          appointment.reason || "-"
                        }
                      </td>
<td>{appointment.referredBy || "-"}</td>
                      <td>

                        <span
                          className={getStatusClass(
                            appointment.status
                          )}
                        >
                          {
                            appointment.status
                          }
                        </span>

                      </td>

                      <td>

                        {appointment.status ===
                          "BOOKED" && (

                          <button
                            className="appointment-action-btn"
                            onClick={() =>
                              updateStatus(
                                appointment.id,
                                "WAITING"
                              )
                            }
                          >
                            Waiting
                          </button>

                        )}

                        {appointment.status ===
                          "WAITING" && (

                          <button
                            className="appointment-action-btn"
                            onClick={() =>
                              updateStatus(
                                appointment.id,
                                "IN_CONSULTATION"
                              )
                            }
                          >
                            Start Consultation
                          </button>

                        )}

                        {appointment.status ===
                          "IN_CONSULTATION" && (

                          <button
                            className="appointment-action-btn"
                            onClick={() =>
                              updateStatus(
                                appointment.id,
                                "COMPLETED"
                              )
                            }
                          >
                            Complete
                          </button>

                        )}

                        {appointment.status !==
                          "COMPLETED" &&
                          appointment.status !==
                            "CANCELLED" && (

                          <button
                            className="appointment-cancel-btn"
                            onClick={() =>
                              updateStatus(
                                appointment.id,
                                "CANCELLED"
                              )
                            }
                          >
                            Cancel
                          </button>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Appointments;