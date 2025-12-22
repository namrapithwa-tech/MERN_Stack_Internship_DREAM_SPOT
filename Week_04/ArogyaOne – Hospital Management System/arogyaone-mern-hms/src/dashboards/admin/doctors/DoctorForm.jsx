import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";

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
    is_available: true
  });

  useEffect(() => {
    if (id) {
      api.get(`/doctors/${id}`).then(res => setDoctor(res.data));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (id) {
      await api.put(`/doctors/${id}`, doctor);
    } else {
      const doctorId = `D-${new Date().getFullYear()}-${Date.now()}`;

      await api.post("/doctors", {
        id: doctorId,
        ...doctor
      });

      // create login user
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
      <h4>{id ? "Edit Doctor" : "Add Doctor"}</h4>

      <input className="form-control mb-2" placeholder="Full Name"
        value={doctor.full_name}
        onChange={e => setDoctor({ ...doctor, full_name: e.target.value })} />

      <input className="form-control mb-2" placeholder="Email"
        value={doctor.email}
        onChange={e => setDoctor({ ...doctor, email: e.target.value })} />

      <input className="form-control mb-2" placeholder="Department"
        value={doctor.department}
        onChange={e => setDoctor({ ...doctor, department: e.target.value })} />

      <input className="form-control mb-2" placeholder="Qualification"
        value={doctor.qualification}
        onChange={e => setDoctor({ ...doctor, qualification: e.target.value })} />

      <input className="form-control mb-2" placeholder="Experience (Years)"
        value={doctor.experience_years}
        onChange={e => setDoctor({ ...doctor, experience_years: e.target.value })} />

      <input className="form-control mb-2" placeholder="Consultation Fee"
        value={doctor.consultation_fee}
        onChange={e => setDoctor({ ...doctor, consultation_fee: e.target.value })} />

      <button className="btn btn-success" onClick={handleSubmit}>
        Save
      </button>
    </AdminLayout>
  );
};

export default DoctorForm;
