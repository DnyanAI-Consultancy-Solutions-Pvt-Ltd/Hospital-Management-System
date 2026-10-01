import { useState } from "react";
import API_BASE_URL from "../services/api";

function Patients() {

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    email: "",
    address: "",
    emergencyContact: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Returning patient search
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Search returning patient
  const handlePatientSearch = async () => {

    if (!searchQuery.trim()) {
      setPatients([]);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.token) {
        throw new Error("Please login again");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/patients/search?query=${encodeURIComponent(searchQuery.trim())}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${user.token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Patient search failed"
        );
      }

      setPatients(data.content || []);

    } catch (err) {

      setSearchError(err.message);
      setPatients([]);

    } finally {

      setSearchLoading(false);

    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.token) {
        throw new Error("Please login again");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Patient registration failed"
        );
      }

      setMessage(
        `Patient registered successfully. Registration No: ${data.registrationNumber}`
      );

      setFormData({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        mobileNumber: "",
        email: "",
        address: "",
        emergencyContact: ""
      });

    } catch (err) {

      setError(err.message);

    }
  };

  const handleClear = () => {

    setFormData({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      mobileNumber: "",
      email: "",
      address: "",
      emergencyContact: ""
    });

    setMessage("");
    setError("");
  };

  return (

    <div className="patient-page">

      <div className="page-title">
        <div>
          <h2>Patient Registration</h2>
          <p>
            Register a new patient or search for an existing patient.
          </p>
        </div>
      </div>

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

      {/* =========================================
          RETURNING PATIENT SEARCH
      ========================================= */}

      <div className="patient-card">

        <div className="form-section">

          <h3>Returning Patient Search</h3>

          <div className="form-grid">

            <div className="form-group full-width">

              <label>Search Patient</label>

              <div
                style={{
                  display: "flex",
                  gap: "10px"
                }}
              >

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handlePatientSearch();
                    }
                  }}
                  placeholder="Search by name, mobile number or registration number"
                />

                <button
                  type="button"
                  className="save-btn"
                  onClick={handlePatientSearch}
                >
                  🔍 Search
                </button>

              </div>

            </div>

          </div>

          {searchLoading && (
            <p>Searching patient...</p>
          )}

          {searchError && (
            <div className="error-message">
              ✕ {searchError}
            </div>
          )}

          {/* Search Results */}

          {patients.length > 0 && (

            <div className="patient-search-results">

              <h4>Search Results</h4>

              {patients.map((patient) => (

                <div
                  key={patient.id}
                  className="patient-result"
                >

                  <div>
                    <strong>
                      {patient.fullName}
                    </strong>

                    <p>
                      Registration No:{" "}
                      {patient.registrationNumber}
                    </p>

                    <p>
                      Mobile:{" "}
                      {patient.mobileNumber}
                    </p>

                    <p>
                      Gender:{" "}
                      {patient.gender || "Not available"}
                    </p>

                    <p>
                      Blood Group:{" "}
                      {patient.bloodGroup || "Not available"}
                    </p>

                    <p>
                      Address:{" "}
                      {patient.address || "Not available"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="save-btn"
                  >
                    View Patient
                  </button>

                </div>

              ))}

            </div>

          )}

          {!searchLoading &&
            searchQuery.trim() &&
            patients.length === 0 &&
            !searchError && (
              <p>No patient found.</p>
            )
          }

        </div>

      </div>


      {/* =========================================
          NEW PATIENT REGISTRATION
      ========================================= */}

      <div className="patient-card">

        <form onSubmit={handleSubmit}>

          <div className="form-section">

            <h3>Personal Information</h3>

            <div className="form-grid">

              <div className="form-group">

                <label>Full Name *</label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />

              </div>


              <div className="form-group">

                <label>Date of Birth</label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Gender *</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>

                  <option value="OTHER">
                    Other
                  </option>

                </select>

              </div>


              <div className="form-group">

                <label>Blood Group</label>

                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Blood Group
                  </option>

                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>

                </select>

              </div>

            </div>

          </div>


          {/* Contact Information */}

          <div className="form-section">

            <h3>Contact Information</h3>

            <div className="form-grid">

              <div className="form-group">

                <label>Mobile Number *</label>

                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="10 digit mobile number"
                  maxLength="10"
                  required
                />

              </div>


              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                />

              </div>


              <div className="form-group full-width">

                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter patient address"
                  rows="3"
                />

              </div>


              <div className="form-group">

                <label>Emergency Contact</label>

                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="Emergency contact number"
                  maxLength="10"
                />

              </div>

            </div>

          </div>


          {/* Buttons */}

          <div className="form-actions">

            <button
              type="reset"
              className="cancel-btn"
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Register Patient
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Patients;