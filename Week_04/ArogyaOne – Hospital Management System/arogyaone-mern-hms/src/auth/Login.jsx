import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await api.get(
      `/users?email=${email}&password=${password}`
    );

    if (res.data.length === 0) {
      alert("Invalid Email or Password");
      return;
    }

    const user = res.data[0];
    login(user);

    switch (user.role) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "REGISTRATION":
        navigate("/registration");
        break;
      case "DOCTOR":
        navigate("/doctor");
        break;
      case "NURSE":
        navigate("/nurse");
        break;
      case "BILLING":
        navigate("/billing");
        break;
      case "PATIENT":
        navigate("/patient");
        break;
      case "LAB":
        navigate("/department/lab");
        break;
      case "ECG":
        navigate("/department/ecg");
        break;
      case "RADIOLOGY":
        navigate("/department/radiology");
        break;
      case "MRI":
        navigate("/department/mri");
        break;
      case "SURGERY":
        navigate("/department/surgery");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="container mt-5 col-md-4">
      <h3 className="text-center mb-3">ArogyaOne Login</h3>

      <input
        className="form-control mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="form-control mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;
