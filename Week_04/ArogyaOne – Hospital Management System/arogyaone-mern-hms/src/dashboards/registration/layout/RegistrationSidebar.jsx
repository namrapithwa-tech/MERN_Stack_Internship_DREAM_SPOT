import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

const RegistrationSidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <aside className="reg-sidebar">
      <div className="reg-brand">
        <span className="material-symbols-outlined">local_hospital</span>
        <div>
          <h5>ArogyaOne</h5>
          <small>Registration Desk</small>
        </div>
      </div>

      <nav className="reg-nav">
        <NavLink to="/registration" end>
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </NavLink>

        <NavLink to="/registration/walkin">
          <span className="material-symbols-outlined">person_add</span>
          New Walk-in Patients
        </NavLink>

        <NavLink to="/registration/appointment">
          <span className="material-symbols-outlined">calendar_month</span>
          Appointments
        </NavLink>

        <NavLink to="/registration/patients">
          <span className="material-symbols-outlined">groups</span>
          Patients
        </NavLink>

        <NavLink to="/registration/search">
          <span className="material-symbols-outlined">person_search</span>
          Search / Old Patient
        </NavLink>

        <NavLink to="/registration/room-allocation">
          <span className="material-symbols-outlined">bed</span>
          Room Allocation
        </NavLink>

        <NavLink to="/registration/rooms">
          <span className="material-symbols-outlined">meeting_room</span>
          Rooms
        </NavLink>
      </nav>

      <div className="reg-sidebar-footer">
        <button onClick={logout}>
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default RegistrationSidebar;
