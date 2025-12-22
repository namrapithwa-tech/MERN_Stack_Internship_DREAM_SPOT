import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then(res => setDoctor(res.data));
  }, [id]);

  if (!doctor) return null;

  return (
    <div className="container mt-4">
      <h3>{doctor.full_name}</h3>
      <p>Qualifications: {doctor.qualification}</p>
      <p>Department: {doctor.department}</p>
      <p>Experience: {doctor.experience_years}</p>
      <p>Consultation Fees: ₹{doctor.consultation_fee}</p>
      <p>Avilable Days: {doctor.available_days.join(',')}</p>
      <p>OPD Timmings: Morning :{doctor.opd_timings.morning}, Evening :{doctor.opd_timings.evening}</p>
      <p>Language Spoken : {doctor.languages_spoken.join(',')}</p>
      <p>{doctor.introduction}</p>
      <Link
        to={`/book-appointment/${doctor.id}`}
        className="btn btn-success"
      >
        Book Appointment
      </Link>
    </div>
  );
};

export default DoctorProfile;
