const AppointmentStats = ({ today, pending, completed }) => (
  <div className="row g-3 mb-4">
    <div className="col-md-4">
      <div className="stat-card p-4">
        <p className="text-muted small">Today Appointments</p>
        <h3>{today}</h3>
      </div>
    </div>
    <div className="col-md-4">
      <div className="stat-card p-4">
        <p className="text-muted small">Pending</p>
        <h3>{pending}</h3>
      </div>
    </div>
    <div className="col-md-4">
      <div className="stat-card p-4">
        <p className="text-muted small">Completed</p>
        <h3>{completed}</h3>
      </div>
    </div>
  </div>
);

export default AppointmentStats;
