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
      <div className="card p-4">
        <div className="row">
          
          {/* Doctor Image */}
          <div className="col-md-3 text-center">
            <img
              src={`/${doctor.doctor_image}`}
              alt="Doctor"
              className="img-fluid rounded mb-3"
              style={{ maxHeight: "220px", objectFit: "cover" }}
            />
            <span
              className={`badge ${
                doctor.is_available ? "bg-success" : "bg-danger"
              }`}
            >
              {doctor.is_available ? "Available" : "Unavailable"}
            </span>
          </div>

          {/* Doctor Details */}
          <div className="col-md-9">
            <h3 className="mb-1">{doctor.full_name}</h3>
            <p className="text-muted mb-3">{doctor.department}</p>

            <div className="row">
              <div className="col-md-6">
                <p><b>Email:</b> {doctor.email}</p>
                <p><b>Qualification:</b> {doctor.qualification}</p>
                <p><b>Experience:</b> {doctor.experience_years} years</p>
                <p><b>Languages Spoken:</b> {doctor.languages_spoken?.join(", ")}</p>
              </div>

              <div className="col-md-6">
                <p><b>Available Days:</b> {doctor.available_days?.join(", ")}</p>
                <p><b>OPD Timings:</b></p>
                <p className="mb-1">
                  Morning: {doctor.opd_timings?.morning}
                </p>
                <p>
                  Evening: {doctor.opd_timings?.evening}
                </p>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-md-4">
                <p><b>Consultation Fee:</b> ₹{doctor.consultation_fee}</p>
              </div>
              <div className="col-md-4">
                <p><b>Monthly Salary:</b> ₹{doctor.salary}</p>
              </div>
            </div>

            <hr />

            <p>
              <b>Introduction:</b><br />
              {doctor.introduction}
            </p>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default DoctorView;
