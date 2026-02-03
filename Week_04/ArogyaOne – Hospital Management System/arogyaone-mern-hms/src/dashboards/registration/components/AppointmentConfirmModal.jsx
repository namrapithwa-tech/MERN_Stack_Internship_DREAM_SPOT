import api from "../../../api/axios";
import { useState } from "react";

const AppointmentConfirmModal = ({ appointment, onClose }) => {
  const [vitals, setVitals] = useState({});

  const confirm = async () => {
    const patientId = `P/2026/${Date.now()}`;
    const opdId = `OPD/2026/${Date.now()}`;

    await api.post("/patients", {
      id: patientId,
      full_name: appointment.patient_name,
      mobile_number: appointment.phone
    });

    await api.post("/vitals", {
      patient_id: patientId,
      ...vitals,
      recorded_by: "REGISTRATION",
      recorded_at: new Date().toISOString()
    });

    await api.post("/opd_consultations", {
      id: opdId,
      appointment_id: appointment.id,
      patient_id: patientId,
      patient_name: appointment.patient_name,
      doctor_id: appointment.doctor_id,
      doctor_name: appointment.doctor_name,
      opd_date: appointment.date,
      created_by: "REGISTRATION",
      created_at: new Date().toISOString()
    });

    await api.patch(`/appointments/${appointment.id}`, {
      status: "CONFIRMED",
      patient_id: patientId
    });

    onClose();
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content p-4">
          <h5>Confirm Appointment</h5>
          <input className="form-control mb-2" placeholder="Weight"
            onChange={e => setVitals({ ...vitals, weight: e.target.value })} />
          <input className="form-control mb-2" placeholder="BP"
            onChange={e => setVitals({ ...vitals, blood_pressure: e.target.value })} />
          <button className="btn btn-success" onClick={confirm}>
            Confirm & Print OPD Slip
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmModal;
