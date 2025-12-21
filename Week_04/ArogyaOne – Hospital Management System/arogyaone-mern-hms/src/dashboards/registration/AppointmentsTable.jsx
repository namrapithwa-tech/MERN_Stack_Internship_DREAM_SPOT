import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/appointments").then(res => setAppointments(res.data));
  }, []);

  const filtered = searchId
    ? appointments.filter(a => a.id === searchId)
    : appointments;

  return (
    <>
      <h5>Appointments</h5>

      <input
        className="form-control mb-2"
        placeholder="Search Appointment ID"
        onChange={e => setSearchId(e.target.value)}
      />

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Appointment ID</th>
            <th>Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.name}</td>
              <td>{a.doctorId}</td>
              <td>{a.date} {a.time}</td>
              <td>{a.status}</td>
              <td>
                {a.status === "PENDING" && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                      navigate(`/registration/confirm/${a.id}`)
                    }
                  >
                    Confirm
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AppointmentsTable;
