import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";

function PatientList() {
 const navigate = useNavigate();
  const emptyForm = {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    mobileNumber: "",
    email: "",
    address: "",
    emergencyContact: ""
  };

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [deletePatient, setDeletePatient] = useState(null);

  const loadPatients = async () => {
  try {
    setLoading(true);
    setError("");

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      throw new Error("Please login again");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/patients`,
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
        data.message || "Failed to load patients"
      );
    }

    setPatients(data);

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {

    const searchText = search.toLowerCase();

    return (
      patient.fullName?.toLowerCase().includes(searchText) ||
      patient.registrationNumber?.toLowerCase().includes(searchText) ||
      patient.mobileNumber?.includes(searchText)
    );
  });

  const handleEdit = (patient) => {

    setEditingPatient(patient);

    setFormData({
      fullName: patient.fullName || "",
      dateOfBirth: patient.dateOfBirth || "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      mobileNumber: patient.mobileNumber || "",
      email: patient.email || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || ""
    });

    setMessage("");
    setError("");
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/patients/${editingPatient.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Patient update failed"
        );
      }

      setMessage(
        "Patient details updated successfully."
      );

      setEditingPatient(null);
      setFormData(emptyForm);

      await loadPatients();

    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {

    setEditingPatient(null);
    setFormData(emptyForm);
    setError("");
    setMessage("");
  };

  const confirmDelete = async () => {

    if (!deletePatient) {
      return;
    }

    try {

      setError("");
      setMessage("");
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.token) {
  throw new Error("Please login again");
}
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${deletePatient.id}`,
        {
          method: "DELETE",
          headers: {
      "Authorization": `Bearer ${user.token}`
    }
        }
      );

      if (!response.ok) {

        let errorMessage = "Patient deletion failed";

        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // Ignore non-JSON response
        }

        throw new Error(errorMessage);
      }

      setDeletePatient(null);

      setMessage(
        "Patient deleted successfully."
      );

      await loadPatients();

    } catch (err) {

      setDeletePatient(null);
      setError(err.message);
    }
  };

  return (
    <div className="patient-list-page">

      {/* ================= PAGE HEADER ================= */}

      <div className="page-title">

        <div>
          <h2>Patient List</h2>

          <p>
            View and manage registered patients.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadPatients}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ================= MESSAGES ================= */}

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


      {/* ================= EDIT FORM ================= */}

      {editingPatient && (

        <div className="edit-patient-card">

          <div className="edit-patient-header">

            <div>
              <h3>Edit Patient</h3>

              <p>
                Registration No:
                <strong>
                  {" "}{editingPatient.registrationNumber}
                </strong>
              </p>
            </div>

            <button
              type="button"
              className="close-edit-btn"
              onClick={cancelEdit}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleUpdate}>

            <div className="form-grid">

              <div className="form-group">

                <label>Full Name *</label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
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


              <div className="form-group">

                <label>Mobile Number *</label>

                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
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
                />

              </div>


              <div className="form-group full-width">

                <label>Address</label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
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
                  maxLength="10"
                />

              </div>

            </div>


            <div className="edit-form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
              >
                Update Patient
              </button>

            </div>

          </form>

        </div>
      )}


      {/* ================= PATIENT TABLE ================= */}

      <div className="patient-list-card">

        <div className="patient-list-toolbar">

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search by name, registration number or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="patient-count">
            Total Patients:{" "}
            <strong>
              {filteredPatients.length}
            </strong>
          </div>
<button
  className="register-patient-btn"
  onClick={() => navigate("/patients/register")}
>
  + Patient Registration
</button>
        </div>


        {loading ? (

          <div className="table-message">
            Loading patients...
          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="table-message">
            No patients found.
          </div>

        ) : (

          <div className="table-container">

            <table className="patient-table">

              <thead>

                <tr>

                  <th>Registration No</th>
                  <th>Patient Name</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Blood Group</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {filteredPatients.map((patient) => (

                  <tr key={patient.id}>

                    <td>
                      <span className="registration-number">
                        {patient.registrationNumber}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {patient.fullName}
                      </strong>
                    </td>

                    <td>
                      {patient.gender}
                    </td>

                    <td>
                      {patient.dateOfBirth || "-"}
                    </td>

                    <td>
                      {patient.bloodGroup || "-"}
                    </td>

                    <td>
                      {patient.mobileNumber}
                    </td>

                    <td>
                      {patient.email || "-"}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                             className="view-btn"
                              title="View Patient"
                              onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          👁️
                          </button>

                        <button
                          className="edit-btn"
                          title="Edit Patient"
                          onClick={() => handleEdit(patient)}
                        >
                          ✏️
                        </button>

                        <button
                          className="delete-btn"
                          title="Delete Patient"
                          onClick={() => setDeletePatient(patient)}
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ================= DELETE CONFIRMATION ================= */}

      {deletePatient && (

        <div className="modal-overlay">

          <div className="delete-modal">

            <div className="delete-icon">
              ⚠️
            </div>

            <h3>
              Delete Patient?
            </h3>

            <p>
              Are you sure you want to delete
              <strong>
                {" "}{deletePatient.fullName}
              </strong>
              ?
            </p>

            <p className="delete-warning">
              This action cannot be undone.
            </p>


            <div className="delete-actions">

              <button
                className="cancel-btn"
                onClick={() => setDeletePatient(null)}
              >
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={confirmDelete}
              >
                Delete Patient
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default PatientList;