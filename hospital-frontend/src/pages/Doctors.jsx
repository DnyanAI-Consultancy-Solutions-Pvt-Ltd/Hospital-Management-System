import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function Doctors() {

  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    specialization: "",
    qualification: "",
    experienceYears: "",
    consultationFee: "",
    roomNumber: ""
  });


  // =========================
  // Get Logged-in User Token
  // =========================

  const getToken = () => {

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return user?.token;
  };


  // =========================
  // Load Doctors
  // =========================

  const loadDoctors = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/doctors`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to load doctors");
      }

      const data = await response.json();

      setDoctors(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadDoctors();
  }, []);


  // =========================
  // Form Change
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };


  // =========================
  // Create Doctor
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/doctors`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },

          body: JSON.stringify({

            // Account Details

            fullName: form.fullName,
            email: form.email,
            username: form.username,
            password: form.password,

            // Professional Details

            specialization: form.specialization,
            qualification: form.qualification,

            experienceYears:
              form.experienceYears
                ? Number(form.experienceYears)
                : null,

            consultationFee:
              form.consultationFee
                ? Number(form.consultationFee)
                : null,

            roomNumber: form.roomNumber
          })
        }
      );

      const text = await response.text();

      if (!response.ok) {

        throw new Error(
          text || "Doctor creation failed"
        );
      }


      // Success

      setMessage(
        "Doctor account and profile created successfully."
      );

      setForm({
        fullName: "",
        email: "",
        username: "",
        password: "",
        specialization: "",
        qualification: "",
        experienceYears: "",
        consultationFee: "",
        roomNumber: ""
      });

      setShowForm(false);

      await loadDoctors();

    } catch (err) {

      setError(err.message);

    } finally {

      setSaving(false);

    }
  };


  // =========================
  // Open Doctor Details
  // =========================

  const handleViewDetails = (doctorId) => {

    navigate(`/doctors/${doctorId}`);

  };


  // =========================
  // Render
  // =========================

  return (

    <div className="doctor-page">

      {/* =========================
          Page Header
      ========================== */}

      <div className="page-title">

        <div>

          <h2>Doctor Management</h2>

          <p>
            Manage hospital doctors and their professional information.
          </p>

        </div>

        <div>

          <button
            className="save-btn"
            onClick={() => {

              setShowForm(!showForm);
              setError("");
              setMessage("");

            }}
          >

            {showForm
              ? "✕ Close"
              : "➕ Add Doctor"}

          </button>

</div>
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10px"
  }}
>
         <button
  type="button"
  onClick={loadDoctors}
  title="Refresh Doctors"
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


      {/* =========================
          Success Message
      ========================== */}

      {message && (

        <div className="success-message">

          ✓ {message}

        </div>

      )}


      {/* =========================
          Error Message
      ========================== */}

      {error && (

        <div className="error-message">

          ✕ {error}

        </div>

      )}


      {/* =========================
          Add Doctor Form
      ========================== */}

      {showForm && (

        <div className="patient-card">

          <h3>Add Doctor</h3>


          <form onSubmit={handleSubmit}>


            {/* =====================
                Account Details
            ====================== */}

            <h4
              style={{
                marginBottom: "15px",
                color: "#0f4c81"
              }}
            >

              Doctor Account Details

            </h4>


            <div className="form-grid">


              <div className="form-group">

                <label>Full Name *</label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter doctor full name"
                  required
                />

              </div>


              <div className="form-group">

                <label>Email *</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  required
                />

              </div>


              <div className="form-group">

                <label>Username *</label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />

              </div>


              <div className="form-group">

                <label>Password *</label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter temporary password"
                  required
                />

              </div>

            </div>


            {/* =====================
                Professional Details
            ====================== */}

            <h4
              style={{
                marginTop: "25px",
                marginBottom: "15px",
                color: "#0f4c81"
              }}
            >

              Professional Details

            </h4>


            <div className="form-grid">


              <div className="form-group">

                <label>Specialization *</label>

                <input
                  type="text"
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  required
                />

              </div>


              <div className="form-group">

                <label>Qualification</label>

                <input
                  type="text"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                />

              </div>


              <div className="form-group">

                <label>Experience (Years)</label>

                <input
                  type="number"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 5"
                />

              </div>


              <div className="form-group">

                <label>Consultation Fee</label>

                <input
                  type="number"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500"
                />

              </div>


              <div className="form-group">

                <label>Room Number</label>

                <input
                  type="text"
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                />

              </div>

            </div>


            {/* =====================
                Save Doctor
            ====================== */}

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >

              {saving
                ? "Creating Doctor..."
                : "Create Doctor"}

            </button>

          </form>

        </div>

      )}


      {/* =========================
          Doctor List
      ========================== */}

      {!showForm && (

        <>

          {loading ? (

            <div className="patient-card">

             <div className="dashboard-loading">
  <span className="dashboard-loader"></span>
  <span>Loading Doctors...</span>
</div>

            </div>

          ) : doctors.length === 0 ? (

            <div className="patient-card">

              <p>
                No doctor profiles found.
              </p>

            </div>

          ) : (

            <div className="patient-card">

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>Doctor</th>

                      <th>Specialization</th>

                      <th>Qualification</th>

                      <th>Experience</th>

                      <th>Consultation Fee</th>

                      <th>Room</th>

                      <th>Status</th>

                      <th>Action</th>

                    </tr>

                  </thead>


                  <tbody>

                    {doctors.map((doctor) => (

                      <tr key={doctor.id}>


                        {/* Doctor */}

                        <td>

                          <strong>
                            {doctor.fullName}
                          </strong>

                          <br />

                          <small>
                            @{doctor.username}
                          </small>

                        </td>


                        {/* Specialization */}

                        <td>
                          {doctor.specialization}
                        </td>


                        {/* Qualification */}

                        <td>
                          {doctor.qualification || "-"}
                        </td>


                        {/* Experience */}

                        <td>
                          {doctor.experienceYears ?? 0} years
                        </td>


                        {/* Fee */}

                        <td>
                          ₹{doctor.consultationFee ?? 0}
                        </td>


                        {/* Room */}

                        <td>
                          {doctor.roomNumber || "-"}
                        </td>


                        {/* Status */}

                        <td>

                          {doctor.available ? (

                            <span className="status-active">

                              Available

                            </span>

                          ) : (

                            <span className="status-inactive">

                              Not Available

                            </span>

                          )}

                        </td>


                        {/* Action */}

                        <td>

                          <button
                            type="button"
                            className="save-btn"
                            onClick={() =>
                              handleViewDetails(doctor.id)
                            }
                          >

                            👁 View Details

                          </button>

                        </td>


                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </>

      )}

    </div>

  );
}

export default Doctors;