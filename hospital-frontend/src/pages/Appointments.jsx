import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API_BASE_URL from "../services/api";
import Swal from "sweetalert2";
function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
const emergencyOnly = searchParams.get("emergency") === "true";

const filteredAppointments = emergencyOnly
  ? appointments.filter(
      (a) => a.emergency === true || a.emergency === "true"
    )
  : appointments;

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
 // New Patient Registration
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const [patientForm, setPatientForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    email: "",
    address: "",
    emergencyContact: ""
  });
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
      description: "",
    referredBy: "",
    emergency: false
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

  setPatientForm({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    email: "",
    address: "",
    emergencyContact: ""
  });

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

  // Auto-fill Patient Registration Fields
  setPatientForm({
    fullName: patient.fullName || "",
    dateOfBirth: patient.dateOfBirth || "",
    gender: patient.gender || "",
    bloodGroup: patient.bloodGroup || "",
    mobileNumber: patient.mobileNumber || "",
    email: patient.email || "",
    address: patient.address || "",
    emergencyContact: patient.emergencyContact || ""
  });

  setForm((previous) => ({
    ...previous,
    patientId: patient.id
  }));
};

  // ==========================
  // Form Change
  // ==========================
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setForm((previous) => ({
    ...previous,
    [name]: type === "checkbox" ? checked : value
  }));
};
// New Patient Form Change
const handlePatientFormChange = (e) => {
  const { name, value } = e.target;

  setPatientForm((previous) => ({
    ...previous,
    [name]: value
  }));
};
const handleRegisterPatient = async () => {
  try {
    setSaving(true);
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/api/patients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(patientForm)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Patient registration failed"
      );
    }

    // Select newly registered patient
    setSelectedPatient(data);
    setPatientSearch(data.fullName);

    setForm((previous) => ({
      ...previous,
      patientId: data.id
    }));

    setPatientResults([]);
    setShowNewPatientForm(false);

    await Swal.fire({
      icon: "success",
      title: "Patient Registered!",
      text: `Registration Number: ${data.registrationNumber}`,
      confirmButtonColor: "#2563eb"
    });

  } catch (err) {
    setError(err.message);

    await Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: err.message
    });

  } finally {
    setSaving(false);
  }
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
let patientId = form.patientId;

// Existing patient नसल्यास नवीन patient register करा
if (!selectedPatient || !patientId) {
  const patientResponse = await fetch(
    `${API_BASE_URL}/api/patients`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(patientForm)
    }
  );

  const patientData = await patientResponse.json();

  if (!patientResponse.ok) {
    throw new Error(
      patientData.message || "Patient registration failed"
    );
  }

  patientId = patientData.id;
  setSelectedPatient(patientData);
  setForm((previous) => ({
    ...previous,
    patientId: patientData.id
  }));
}
    if (!form.doctorId) {
      throw new Error("Please select a doctor.");
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
patientId: Number(patientId),
          doctorId: Number(form.doctorId),
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          reason: form.reason,
          description: form.description,
          referredBy: form.referredBy,
          emergency: form.emergency
        })
      }
    );

    const text = await response.text();

    if (!response.ok) {
      throw new Error(text || "Appointment booking failed");
    }

    const data = JSON.parse(text);

    // Reset Form
    setForm({
      patientId: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      description: "",
      referredBy: "",
      emergency: false
    });

    setPatientSearch("");
    setPatientResults([]);
    setSelectedPatient(null);
    setShowForm(false);

    // Refresh Appointment List
    await loadAppointments();

    // Professional Success Popup
    await Swal.fire({
      icon: "success",
      title: "Appointment Booked Successfully!",
      html: `
        <div style="font-size:14px;color:#64748b;">
          Patient appointment has been booked successfully.
          <br/><br/>
          <strong style="color:#1e293b;">Token Number</strong>
          <div id="appointment-token"
            style="
              margin-top:6px;
              padding:8px;
              background:#f1f5f9;
              border-radius:6px;
              font-size:18px;
              font-weight:600;
              color:#2563eb;
            ">
          </div>
        </div>
      `,
      didOpen: () => {
        document.getElementById("appointment-token").textContent =
          data.tokenNumber ?? "Generated Successfully";
      },
      confirmButtonText: "Done",
      confirmButtonColor: "#2563eb",
      allowOutsideClick: false,
      customClass: {
        popup: "medinexa-success-popup"
      }
    });

  } catch (err) {
    setError(err.message);

    await Swal.fire({
      icon: "error",
      title: "Appointment Booking Failed",
      text: err.message,
      confirmButtonText: "Try Again",
      confirmButtonColor: "#dc2626"
    });

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
          </div>
          <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px"
  }}
><button
  type="button"
  onClick={loadAppointments}
  title="Refresh Appointments"
  disabled={loading}
  style={{
    width: "34px",
    height: "34px",
    minWidth: "34px",
    padding: "0",
    border: "1px solid #dbeafe",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#2563eb",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  ↻
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
  gridColumn: "1 / -1",
  position: "relative",
  width: "100%",
  zIndex: 100
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
{/* Patient Results */}
{!patientSearching && patientResults.length > 0 && (
  <div
    style={{
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      width: "100%",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      zIndex: 99999,
      maxHeight: "200px",
      overflowY: "auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }}
  >
    {patientResults.map((patient) => (
      <div
        key={patient.id}
        onClick={() => handleSelectPatient(patient)}
        style={{
          padding: "10px",
          cursor: "pointer",
          borderBottom: "1px solid #eee"
        }}
      >
        <strong>{patient.fullName}</strong>
        <br />
        <small>
          Reg No: {patient.registrationNumber} | Mobile: {patient.mobileNumber}
        </small>
      </div>
    ))}
  </div>
)}

{/* Patient Registration Details */}
<div
  className="form-grid"
  style={{
    gridColumn: "1 / -1",
    width: "100%",
    marginTop: "15px",
    padding: "20px",
    border: "1px solid #dbeafe",
    borderRadius: "10px",
    background: "#f8fbff"
  }}
><h3 style={{ gridColumn: "1 / -1" }}>
  🏥 Patient Information
</h3>
    <div className="form-group">
      <label>Patient Full Name *</label>
      <input
        type="text"
        name="fullName"
        value={patientForm.fullName}
        onChange={handlePatientFormChange}
        required
      />
    </div>

    <div className="form-group">
      <label>Date of Birth</label>
      <input
        type="date"
        name="dateOfBirth"
        value={patientForm.dateOfBirth}
        onChange={handlePatientFormChange}
      />
    </div>

    <div className="form-group">
      <label>Gender *</label>
      <select
        name="gender"
        value={patientForm.gender}
        onChange={handlePatientFormChange}
        required
      >
        <option value="">Select Gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHER">Other</option>
      </select>
    </div>

    <div className="form-group">
      <label>Blood Group</label>
      <select
        name="bloodGroup"
        value={patientForm.bloodGroup}
        onChange={handlePatientFormChange}
      >
        <option value="">Select Blood Group</option>
        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
          (group) => (
            <option key={group} value={group}>
              {group}
            </option>
          )
        )}
      </select>
    </div>

    <div className="form-group">
      <label>Mobile Number *</label>
      <input
        type="tel"
        name="mobileNumber"
        value={patientForm.mobileNumber}
        onChange={handlePatientFormChange}
        maxLength="10"
        required
      />
    </div>

    <div className="form-group">
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={patientForm.email}
        onChange={handlePatientFormChange}
      />
    </div>

    <div className="form-group">
      <label>Emergency Contact</label>
      <input
        type="tel"
        name="emergencyContact"
        value={patientForm.emergencyContact}
        onChange={handlePatientFormChange}
        maxLength="10"
      />
    </div>

    <div className="form-group">
      <label>Address</label>
      <textarea
        name="address"
        value={patientForm.address}
        onChange={handlePatientFormChange}
        rows="3"
      />
    </div>

    <div style={{ gridColumn: "1 / -1" }}>
      <button
        type="button"
        className="save-btn"
        onClick={handleRegisterPatient}
        disabled={saving}
      >
        {saving ? "Registering..." : "Register Patient & Continue"}
      </button>
    </div>
  </div>

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
<div className="form-group emergency-field">
  <label className="emergency-checkbox">
    <input
      type="checkbox"
      name="emergency"
      checked={form.emergency}
      onChange={handleChange}
    />
    <span>🚑 Emergency Appointment</span>
  </label>
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
            <div
  className="form-group"
  style={{ gridColumn: "1 / -1" }}
>
  <label>Description</label>

  <textarea
    name="description"
    value={form.description}
    onChange={handleChange}
    placeholder="Enter detailed patient description"
    maxLength="1000"
    rows="4"
  />
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
  disabled={saving}
>
  {saving
    ? "Processing..."
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

 <h2>
  {emergencyOnly
    ? "🚨 Emergency Appointments"
    : "Appointment Management"}
</h2>
<p>
  {emergencyOnly
    ? "All emergency patient appointments."
    : "All scheduled patient appointments."}
</p>
          
        </div>

        {loading ? (

          <p>
            Loading appointments...
          </p>

) : filteredAppointments.length === 0 ? (
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

                

                  <th>Date</th>

                  <th>Time</th>

                  <th>Reason</th>
                  <th>Description</th>
<th>Referred By</th>

                  <th>Status</th>

                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {filteredAppointments.map(
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
                      <td>{appointment.description || "-"}</td>
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