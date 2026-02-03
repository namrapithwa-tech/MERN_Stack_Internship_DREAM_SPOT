import { useEffect, useState } from "react";
import api from "../../../api/axios";
import previewOPDSlip from "../utils/opdSlipPreview";

const WalkInPatientForm = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    age: "",
    gender: "Male",
    blood_group: "",
    doctor_id: "",
    weight: "",
    height: "",
    bp: "",
    sugar: "",
    temp: "",
    payment_mode: "CASH",
    transaction_id: ""
  });

  const selectedDoctor = doctors.find(d => d.id === form.doctor_id);

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const year = new Date().getFullYear();
    const patientId = `P/${year}/${Date.now()}`;
    const opdId = `OPD/${year}/${Date.now()}`;

    /** 1️⃣ Save Patient */
    await api.post("/patients", {
      id: patientId,
      full_name: form.full_name,
      mobile_number: form.mobile,
      age: form.age,
      gender: form.gender,
      blood_group: form.blood_group,
      created_at: new Date().toISOString()
    });

    /** 2️⃣ Save OPD */
    const opdPayload = {
      id: opdId,
      patient_id: patientId,
      patient_name: form.full_name,
      patient_age: form.age,
      patient_gender: form.gender,
      patinet_bloodgroup: form.blood_group,

      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.full_name,
      department: selectedDoctor.department,

      visit_type: "OPD",
      opd_date: new Date().toISOString().split("T")[0],
      opd_timings: selectedDoctor.opd_timings,

      consultation_fee: selectedDoctor.consultation_fee,

      payment: {
        status: "PAID",
        mode: form.payment_mode,
        amount_paid: selectedDoctor.consultation_fee,
        transaction_id:
          form.payment_mode === "UPI" ? form.transaction_id : null,
        payment_date: new Date().toISOString()
      },

      created_by: "REGISTRATION",
      created_at: new Date().toISOString(),
      is_billed: true,
      is_closed: false
    };

    await api.post("/opd_consultations", opdPayload);

    /** 3️⃣ Preview OPD Slip */
    previewOPDSlip({
      opdId,
      patientId,
      patient: form,
      doctor: selectedDoctor,
      fee: selectedDoctor.consultation_fee
    });

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
      <h5 className="mb-4 fw-bold">Patient Details</h5>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Full Name *</label>
          <input className="form-control" name="full_name" required onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Mobile *</label>
          <input className="form-control" name="mobile" required onChange={handleChange} />
        </div>

        <div className="col-md-3">
          <label className="form-label">Age *</label>
          <input className="form-control" name="age" type="number" onChange={handleChange} />
        </div>

        <div className="col-md-5">
          <label className="form-label">Gender *</label>
          <select className="form-select" name="gender" onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Blood Group</label>
          <select className="form-select" name="blood_group" onChange={handleChange}>
            <option value="">Select</option>
            <option>A+</option><option>B+</option><option>O+</option>
            <option>A-</option><option>B-</option><option>O-</option>
            <option>AB+</option><option>AB-</option>
          </select>
        </div>

        <div className="col-12">
          <label className="form-label">Consultant Doctor *</label>
          <select className="form-select" name="doctor_id" required onChange={handleChange}>
            <option value="">Select Doctor</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.full_name} ({d.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className="my-4" />

      <h6 className="fw-bold mb-3">Payment</h6>
      <div className="row g-3">
        <div className="col-md-4">
          <select className="form-select" name="payment_mode" onChange={handleChange}>
            <option>CASH</option>
            <option>UPI</option>
          </select>
        </div>

        {form.payment_mode === "UPI" && (
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="UPI Transaction ID"
              name="transaction_id"
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button className="btn btn-light border" type="reset">
          Clear
        </button>

        <button className="btn btn-success fw-bold" disabled={loading}>
          {loading ? "Processing..." : "Register & Preview OPD Slip"}
        </button>
      </div>
    </form>
  );
};

export default WalkInPatientForm;
