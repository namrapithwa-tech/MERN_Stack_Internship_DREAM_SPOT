import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Our Doctors</h3>

      <div className="row">
        {doctors.map(d => (
          <div className="col-md-4 mb-3" key={d.id}>
            <div className="card p-3">
              <h5>{d.name}</h5>
              <p>{d.department}</p>
              <p>Fees: ₹{d.fees}</p>

              <Link to={`/doctors/${d.id}`} className="btn btn-outline-primary">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
