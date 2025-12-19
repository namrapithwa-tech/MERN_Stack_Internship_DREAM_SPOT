import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const RegistrationDashboard = () => {
  const [appointmentId, setAppointmentId] = useState("");
  const [appointment, setAppointment] = useState(null);
  const navigate = useNavigate();

  const searchAppointment = async () => {
    try {
      const res = await api.get(`/appointments/${appointmentId}`);
      setAppointment(res.data);
    } catch (error) {
      alert("Appointment not found");
      setAppointment(null);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registration Desk</h2>

      {/* SEARCH BOX */}
      <div className="card p-3 mb-3">
        <label>Enter Appointment Number</label>
        <input
          className="form-control mb-2"
          placeholder="e.g. A1700000000000"
          onChange={(e) => setAppointmentId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={searchAppointment}>
          Search Appointment
        </button>
      </div>

      {/* APPOINTMENT DETAILS */}
      {appointment && (
        <div className="card p-3">
          <h5>Appointment Details</h5>
          <p><b>Name:</b> {appointment.name}</p>
          <p><b>Phone:</b> {appointment.phone}</p>
          <p><b>Date:</b> {appointment.date}</p>
          <p><b>Time:</b> {appointment.time}</p>
          <p><b>Status:</b> {appointment.status}</p>

          {appointment.status === "PENDING" && (
            <button
              className="btn btn-success"
              onClick={() =>
                navigate(`/registration/confirm/${appointment.id}`)
              }
            >
              Confirm Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationDashboard;
