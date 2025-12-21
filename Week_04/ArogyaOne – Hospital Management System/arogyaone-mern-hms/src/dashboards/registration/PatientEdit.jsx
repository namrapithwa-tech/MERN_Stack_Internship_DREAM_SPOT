import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import RegistrationLayout from "./RegistrationLayout";

const PatientEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(res => setPatient(res.data));
  }, [id]);

  const saveChanges = async () => {
    await api.put(`/patients/${id}`, patient);
    alert("Patient updated");
    navigate(`/registration/patient/view/${id}`);
  };

  if (!patient) return null;

  return (
    <RegistrationLayout>
      <h4>Edit Patient</h4>

      <input
        className="form-control mb-2"
        value={patient.full_name}
        onChange={e => setPatient({ ...patient, full_name: e.target.value })}
      />

      <input
        className="form-control mb-2"
        value={patient.age}
        onChange={e => setPatient({ ...patient, age: e.target.value })}
      />

      <input
        className="form-control mb-2"
        value={patient.mobile_number}
        onChange={e => setPatient({ ...patient, mobile_number: e.target.value })}
      />

      <button className="btn btn-success" onClick={saveChanges}>
        Save
      </button>
    </RegistrationLayout>
  );
};

export default PatientEdit;
