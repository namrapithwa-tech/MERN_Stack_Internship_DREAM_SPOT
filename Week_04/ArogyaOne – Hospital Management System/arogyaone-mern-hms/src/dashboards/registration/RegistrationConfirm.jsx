import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import RegistrationLayout from "./RegistrationLayout";
import generateOPDSlip from "./OPDSlipPDF";

const RegistrationConfirm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [vitals, setVitals] = useState({
    weight: "",
    height: "",
    bp: "",
    blood_group: ""
  });

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`)
      .then(res => setAppointment(res.data));
  }, [appointmentId]);

  const confirmAppointment = async () => {
    const year = new Date().getFullYear();
    const patientId = `P/${year}/${Date.now()}`;

    // Create patient
    await api.post("/patients", {
      id: patientId,
      full_name: appointment.name,
      age: appointment.age,
      gender: appointment.gender,
      mobile_number: appointment.phone,
      blood_group: vitals.blood_group,
      consultant_doctor_id: appointment.doctorId,
      registration_type: "APPOINTMENT",
      created_at: new Date().toISOString()
    });

    // Update appointment
    await api.patch(`/appointments/${appointmentId}`, {
      patientId,
      status: "CONFIRMED"
    });

    // Save vitals
    await api.post("/vitals", {
      patientId,
      weight: vitals.weight,
      height: vitals.height,
      blood_pressure: vitals.bp,
      blood_group: vitals.blood_group,
      recorded_by: "REGISTRATION",
      recorded_at: new Date().toISOString()
    });

    // Generate OPD Slip
    generateOPDSlip({
      patientId,
      full_name: appointment.name,
      blood_group: vitals.blood_group,
      doctorId: appointment.doctorId,
      date: new Date().toLocaleDateString()
    });

    alert("Appointment confirmed, Patient ID generated & OPD Slip printed");
    navigate("/registration");
  };

  if (!appointment) return null;

  return (
    <RegistrationLayout>
      <h4>Confirm Appointment</h4>

      <div className="card p-3 mb-3">
        <p><b>Appointment ID:</b> {appointment.id}</p>
        <p><b>Name:</b> {appointment.name}</p>
        <p><b>Doctor:</b> {appointment.doctorId}</p>
      </div>

      <input
        className="form-control mb-2"
        placeholder="Weight"
        onChange={e => setVitals({ ...vitals, weight: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Height"
        onChange={e => setVitals({ ...vitals, height: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="BP"
        onChange={e => setVitals({ ...vitals, bp: e.target.value })}
      />

      <select
        className="form-control mb-3"
        onChange={e => setVitals({ ...vitals, blood_group: e.target.value })}
      >
        <option value="">Blood Group</option>
        <option>A+</option><option>A-</option>
        <option>B+</option><option>B-</option>
        <option>O+</option><option>O-</option>
        <option>AB+</option><option>AB-</option>
      </select>

      <button className="btn btn-success" onClick={confirmAppointment}>
        Confirm & Print OPD Slip
      </button>
    </RegistrationLayout>
  );
};

export default RegistrationConfirm;
