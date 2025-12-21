import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="bg-dark text-white p-3" style={{ width: "220px", minHeight: "100vh" }}>
      <h5>ArogyaOne Admin</h5>
      <hr />
      <Link to="/admin/doctors" className="d-block text-white mb-2">
        Doctors
      </Link>
      <Link to="/admin/rooms" className="d-block text-white mb-2">
        Rooms
      </Link>
    </div>
  );
};

export default AdminSidebar;
