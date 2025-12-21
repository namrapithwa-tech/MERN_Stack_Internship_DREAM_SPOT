import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";

const DoctorView = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then(res => setDoctor(res.data));
  }, [id]);

  if (!doctor) return null;

  return (
    <AdminLayout>
      <h4>{doctor.full_name}</h4>
      <p><b>Department:</b> {doctor.department}</p>
      <p><b>Qualification:</b> {doctor.qualification}</p>
      <p><b>Experience:</b> {doctor.experience_years} years</p>
      <p><b>Languages:</b> {doctor.languages_spoken?.join(", ")}</p>
      <p><b>Fees:</b> ₹{doctor.consultation_fee}</p>
    </AdminLayout>
  );
};

export default DoctorView;
