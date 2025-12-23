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
      <div className="card p-4">
        <div className="row">
          <div className="col-md-3 text-center">
            <img
              src={`/${doctor.doctor_image}`}
              alt="Doctor"
              className="img-fluid rounded mb-3"
            />
          </div>

          <div className="col-md-9">
            <h3>{doctor.full_name}</h3>
            <p className="text-muted">{doctor.department}</p>

            <div className="row">
              <div className="col-md-6">
                <p><b>Qualification:</b> {doctor.qualification}</p>
                <p><b>Experience:</b> {doctor.experience_years} years</p>
                <p><b>Languages:</b> {doctor.languages_spoken.join(", ")}</p>
              </div>

              <div className="col-md-6">
                <p><b>Available Days:</b> {doctor.available_days.join(", ")}</p>
                <p><b>OPD Timings:</b></p>
                <p>Morning: {doctor.opd_timings.morning}</p>
                <p>Evening: {doctor.opd_timings.evening}</p>
                <p><b>Consultation Fee:</b> ₹{doctor.consultation_fee}</p>
              </div>
            </div>

            <hr />
            <p>{doctor.introduction}</p>

            <Link
              to={`/book-appointment/${doctor.id}`}
              className="btn btn-success"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
