import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";

const RegistrationTopbar = ({ title, description }) => {
  const { user } = useContext(AuthContext);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="reg-topbar">
      <div>
        <h6>{title}</h6>
        <small>{description}</small>
      </div>

      <div className="reg-topbar-right">
        <div className="reg-datetime">
          <span className="material-symbols-outlined">schedule</span>
          {dateTime}
        </div>

        <div className="reg-user">
          <strong>{user?.full_name || "Registration User"}</strong>
          <small>{user?.role}</small>
        </div>
      </div>
    </header>
  );
};

export default RegistrationTopbar;
