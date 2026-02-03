const AppointmentTable = ({ appointments, onConfirm }) => (
  <table className="table table-hover">
    <thead>
      <tr>
        <th>ID</th>
        <th>Patient</th>
        <th>Phone</th>
        <th>Doctor</th>
        <th>Date & Time</th>
        <th>Status</th>
        <th className="text-end">Action</th>
      </tr>
    </thead>
    <tbody>
      {appointments.map(a => (
        <tr key={a.id}>
          <td>{a.id}</td>
          <td>{a.patient_name}</td>
          <td>{a.phone}</td>
          <td>{a.doctor_name}</td>
          <td>{a.date} {a.time}</td>
          <td>
            <span className={`badge ${a.status === "PENDING" ? "bg-warning" : "bg-success"}`}>
              {a.status}
            </span>
          </td>
          <td className="text-end">
            {a.status === "PENDING" && (
              <button className="btn btn-success btn-sm" onClick={() => onConfirm(a)}>
                Confirm
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AppointmentTable;
