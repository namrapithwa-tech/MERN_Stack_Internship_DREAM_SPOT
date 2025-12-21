import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import RegistrationLayout from "./RegistrationLayout";

const DischargePatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admission, setAdmission] = useState(null);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data));
    api.get(`/admissions?patient_id=${id}`).then(res => setAdmission(res.data[0]));
  }, [id]);

  const discharge = async () => {
    const dischargeDate = new Date();
    const admitDate = new Date(admission.admission_date);
    const totalDays =
      Math.ceil((dischargeDate - admitDate) / (1000 * 60 * 60 * 24));

    // Update admission
    await api.patch(`/admissions/${admission.id}`, {
      discharge_date: dischargeDate.toISOString(),
      total_days: totalDays,
      status: "DISCHARGED"
    });

    // Free room
    await api.patch(`/rooms/${admission.room_id}`, {
      is_available: true,
      allocated_patient_id: null
    });

    // Update patient
    await api.patch(`/patients/${id}`, {
      room_number: null
    });

    alert("Patient discharged successfully");
    navigate("/registration");
  };

  if (!admission || !patient) return null;

  return (
    <RegistrationLayout>
      <h4>Discharge Patient</h4>

      <p><b>Patient:</b> {patient.full_name}</p>
      <p><b>Room:</b> {patient.room_number}</p>
      <p><b>Admitted On:</b> {new Date(admission.admission_date).toLocaleDateString()}</p>

      <button className="btn btn-danger" onClick={discharge}>
        Confirm Discharge
      </button>
    </RegistrationLayout>
  );
};

export default DischargePatient;
