import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/axios";
import AdminLayout from "../AdminLayout";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get("/doctors").then(res => setDoctors(res.data));
  }, []);

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between mb-3">
        <h4>Doctors</h4>
        <Link to="/admin/doctors/add" className="btn btn-primary">
          Add Doctor
        </Link>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Fees</th>
            <th>Available Days</th>
            <th>OPD Timings</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map(d => (
            <tr key={d.id}>
              <td>{d.full_name}</td>
              <td>{d.department}</td>
              <td>₹{d.consultation_fee}</td>
              <td>{d.available_days?.join(", ")}</td>
              <td>
                {d.opd_timings?.morning} / {d.opd_timings?.evening}
              </td>
              <td>
                <Link to={`/admin/doctors/view/${d.id}`} className="btn btn-sm btn-info me-1">
                  View
                </Link>
                <Link to={`/admin/doctors/edit/${d.id}`} className="btn btn-sm btn-warning">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default DoctorList;
