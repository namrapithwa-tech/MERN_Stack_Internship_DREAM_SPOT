import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

const RegistrationConfirm = () => {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [vitals, setVitals] = useState({
    weight: "",
    height: "",
    bp: ""
  });

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`)
      .then(res => setAppointment(res.data));
  }, [appointmentId]);

  const confirmAppointment = async () => {
    const patientId = "P" + Date.now();

    await api.post("/patients", {
      id: patientId,
      name: appointment.name,
      phone: appointment.phone,
      age: appointment.age,
      gender: appointment.gender
    });

    await api.patch(`/appointments/${appointmentId}`, {
      patientId,
      status: "CONFIRMED"
    });

    // Save vitals (optional future use)
    await api.post("/vitals", {
      patientId,
      ...vitals,
      date: new Date().toISOString()
    });

    alert("Appointment confirmed and Patient ID generated");
  };

  if (!appointment) return null;

  return (
    <div className="container mt-4">
      <h3>Confirm Appointment</h3>

      <input
        placeholder="Weight"
        className="form-control mb-2"
        onChange={e => setVitals({ ...vitals, weight: e.target.value })}
      />

      <input
        placeholder="Height"
        className="form-control mb-2"
        onChange={e => setVitals({ ...vitals, height: e.target.value })}
      />

      <input
        placeholder="BP"
        className="form-control mb-3"
        onChange={e => setVitals({ ...vitals, bp: e.target.value })}
      />

      <button className="btn btn-success" onClick={confirmAppointment}>
        Confirm & Generate Patient ID
      </button>
    </div>
  );
};

export default RegistrationConfirm;
