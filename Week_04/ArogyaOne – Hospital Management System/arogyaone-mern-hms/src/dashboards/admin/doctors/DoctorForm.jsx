import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const LANGUAGES = ["Gujarati", "Hindi", "English"];
const DEPARTMENTS = [
  "Physician",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Dermatology",
  "ENT",
  "General Surgery",
  "Urology",
  "Radiology",
  "Anesthesiology",
  "Pathology",
  "Emergency Medicine"
];


const DoctorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    full_name: "",
    email: "",
    department: "",
    qualification: "",
    experience_years: "",
    languages_spoken: [],
    available_days: [],
    opd_timings: { morning: "", evening: "" },
    consultation_fee: "",
    salary: "",
    introduction: "",
    doctor_image: "",
    is_available: true
  });

  useEffect(() => {
    if (id) {
      api.get(`/doctors/${id}`).then(res => setDoctor(res.data));
    }
  }, [id]);

  /* ---------- Helpers ---------- */

  const toggleArrayValue = (field, value) => {
    setDoctor(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${id || "D-" + Date.now()}.jpg`;
    setDoctor({ ...doctor, doctor_image: `media/doctors/${fileName}` });
  };

  /* ---------- Submit ---------- */

  const handleSubmit = async () => {
    if (id) {
      await api.put(`/doctors/${id}`, doctor);
    } else {
      const doctorId = `D-${new Date().getFullYear()}-${Date.now()}`;

      await api.post("/doctors", {
        id: doctorId,
        ...doctor,
        doctor_image: doctor.doctor_image || `media/doctors/${doctorId}.jpg`
      });

      await api.post("/users", {
        email: doctor.email,
        password: "doctor123",
        role: "DOCTOR",
        linked_id: doctorId
      });
    }

    navigate("/admin/doctors");
  };

  return (
    <AdminLayout>
      <h4 className="mb-3">{id ? "Edit Doctor" : "Add Doctor"}</h4>

      {/* BASIC DETAILS */}
      <input
        className="form-control mb-2"
        placeholder="Full Name"
        value={doctor.full_name}
        onChange={e => setDoctor({ ...doctor, full_name: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="Email"
        value={doctor.email}
        onChange={e => setDoctor({ ...doctor, email: e.target.value })}
      />

      <label className="fw-bold">Department</label>
      <select
        className="form-control mb-3"
        value={doctor.department}
        onChange={e => setDoctor({ ...doctor, department: e.target.value })}
      >
        <option value="">Select Department</option>
        {DEPARTMENTS.map(dep => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      <input
        className="form-control mb-2"
        placeholder="Qualification"
        value={doctor.qualification}
        onChange={e => setDoctor({ ...doctor, qualification: e.target.value })}
      />

      <input
        className="form-control mb-3"
        placeholder="Experience (Years)"
        value={doctor.experience_years}
        onChange={e => setDoctor({ ...doctor, experience_years: e.target.value })}
      />

      {/* LANGUAGES */}
      <label className="fw-bold">Languages Spoken</label>
      <div className="mb-3">
        {LANGUAGES.map(lang => (
          <div className="form-check form-check-inline" key={lang}>
            <input
              type="checkbox"
              className="form-check-input"
              checked={doctor.languages_spoken.includes(lang)}
              onChange={() => toggleArrayValue("languages_spoken", lang)}
            />
            <label className="form-check-label">{lang}</label>
          </div>
        ))}
      </div>

      {/* AVAILABLE DAYS */}
      <label className="fw-bold">Available Days</label>
      <div className="mb-3">
        {DAYS.map(day => (
          <div className="form-check form-check-inline" key={day}>
            <input
              type="checkbox"
              className="form-check-input"
              checked={doctor.available_days.includes(day)}
              onChange={() => toggleArrayValue("available_days", day)}
            />
            <label className="form-check-label">{day}</label>
          </div>
        ))}
      </div>

      {/* OPD TIMINGS */}
      <label className="fw-bold">OPD Timings</label>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Morning (e.g. 09:00 AM - 12:30 PM)"
            value={doctor.opd_timings.morning}
            onChange={e =>
              setDoctor({
                ...doctor,
                opd_timings: { ...doctor.opd_timings, morning: e.target.value }
              })
            }
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Evening (e.g. 05:00 PM - 07:00 PM)"
            value={doctor.opd_timings.evening}
            onChange={e =>
              setDoctor({
                ...doctor,
                opd_timings: { ...doctor.opd_timings, evening: e.target.value }
              })
            }
          />
        </div>
      </div>

      {/* FEES & SALARY */}
      <input
        className="form-control mb-2"
        placeholder="Consultation Fee"
        value={doctor.consultation_fee}
        onChange={e => setDoctor({ ...doctor, consultation_fee: e.target.value })}
      />

      <input
        className="form-control mb-3"
        placeholder="Monthly Salary"
        value={doctor.salary}
        onChange={e => setDoctor({ ...doctor, salary: e.target.value })}
      />

      {/* INTRODUCTION */}
      <textarea
        className="form-control mb-3"
        placeholder="Brief Introduction / Profile Summary"
        rows="3"
        value={doctor.introduction}
        onChange={e => setDoctor({ ...doctor, introduction: e.target.value })}
      />

      {/* IMAGE */}
      <label className="fw-bold">Doctor Photo</label>
      <input
        type="file"
        className="form-control mb-3"
        onChange={handleImageUpload}
      />

      {/* AVAILABILITY */}
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          checked={doctor.is_available}
          onChange={() =>
            setDoctor({ ...doctor, is_available: !doctor.is_available })
          }
        />
        <label className="form-check-label">
          Doctor Currently Available
        </label>
      </div>

      <button className="btn btn-success" onClick={handleSubmit}>
        Save Doctor
      </button>
    </AdminLayout>
  );
};

export default DoctorForm;
