import { useEffect, useState } from "react";
import api from "../../api/axios";
import generateOPDSlip from "./OPDSlipPDF";

const WalkInPatientForm = () => {
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    gender: "",
    blood_group: "",
    mobile_number: "",
    doctorId: "",
    weight: "",
    height: "",
    blood_pressure: ""
  });

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const handleSubmit = async () => {
    const year = new Date().getFullYear();
    const patientId = `P/${year}/${Date.now()}`;

    await api.post("/patients", {
      id: patientId,
      full_name: form.full_name,
      age: form.age,
      gender: form.gender,
      blood_group: form.blood_group,
      mobile_number: form.mobile_number,
      consultant_doctor_id: form.doctorId
    });

    await api.post("/vitals", {
      patientId,
      weight: form.weight,
      height: form.height,
      blood_pressure: form.blood_pressure,
      blood_group: form.blood_group,
      recorded_by: "REGISTRATION",
      recorded_at: new Date().toISOString()
    });

    generateOPDSlip({
      patientId,
      ...form,
      date: new Date().toLocaleDateString()
    });
  };

  return (
    <>
      <h5>Direct Walk-In Patient</h5>

      <input className="form-control mb-2" placeholder="Patient Name"
        onChange={e => setForm({ ...form, full_name: e.target.value })} />

      <input className="form-control mb-2" placeholder="Age"
        onChange={e => setForm({ ...form, age: e.target.value })} />

      <select className="form-control mb-2"
        onChange={e => setForm({ ...form, blood_group: e.target.value })}>
        <option value="">Blood Group</option>
        <option>A+</option><option>A-</option>
        <option>B+</option><option>B-</option>
        <option>O+</option><option>O-</option>
        <option>AB+</option><option>AB-</option>
      </select>

      <select className="form-control mb-2"
        onChange={e => setForm({ ...form, doctorId: e.target.value })}>
        <option value="">Select Doctor</option>
        {doctors.map(d => (
          <option key={d.id} value={d.id}>{d.full_name}</option>
        ))}
      </select>

      <button className="btn btn-primary" onClick={handleSubmit}>
        Register & Print OPD Slip
      </button>
    </>
  );
};

export default WalkInPatientForm;
