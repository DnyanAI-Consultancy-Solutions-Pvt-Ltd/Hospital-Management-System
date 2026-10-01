function Dashboard() {
    
  return (
    <div className="dashboard">

      <div className="welcome-section">
        <div>
          <h2>Welcome back, Admin 👋</h2>
          <p>Here is today's hospital overview.</p>
        </div>
<button
  className="dashboard-action-btn"
  onClick={() => window.location.href = "/patients/register"}
>
  👤 Register Patient
</button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div>
            <span>Total Patients</span>
            <h3>120</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🩺</div>
          <div>
            <span>Total Doctors</span>
            <h3>25</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div>
            <span>Appointments</span>
            <h3>18</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛏️</div>
          <div>
            <span>Available Beds</span>
            <h3>42</h3>
          </div>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Patients</h3>
            <button>View All</button>
          </div>

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
              <tr>
                <td>Rahul Patil</td>
                <td>PAT-2026-000001</td>
                <td>Male</td>
                <td><span className="status active-status">Active</span></td>
              </tr>

              <tr>
                <td>Priya Sharma</td>
                <td>PAT-2026-000002</td>
                <td>Female</td>
                <td><span className="status active-status">Active</span></td>
              </tr>

              <tr>
                <td>Amit Deshmukh</td>
                <td>PAT-2026-000003</td>
                <td>Male</td>
                <td><span className="status active-status">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="dashboard-card">

          <div className="card-header">
            <h3>Today's Appointments</h3>
            <button>View All</button>
          </div>

          <div className="appointment">
            <div className="appointment-time">09:30 AM</div>

            <div>
              <strong>Rahul Patil</strong>
              <span>Dr. Sharma • General Medicine</span>
            </div>
          </div>

          <div className="appointment">
            <div className="appointment-time">11:00 AM</div>

            <div>
              <strong>Priya Sharma</strong>
              <span>Dr. Mehta • Cardiology</span>
            </div>
          </div>

          <div className="appointment">
            <div className="appointment-time">02:30 PM</div>

            <div>
              <strong>Amit Deshmukh</strong>
              <span>Dr. Patil • Orthopedics</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;