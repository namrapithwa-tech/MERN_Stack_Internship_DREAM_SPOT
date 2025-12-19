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
      <h3>{doctor.name}</h3>
      <p>Department: {doctor.department}</p>
      <p>Experience: {doctor.experience}</p>
      <p>Consultation Fees: ₹{doctor.fees}</p>

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
