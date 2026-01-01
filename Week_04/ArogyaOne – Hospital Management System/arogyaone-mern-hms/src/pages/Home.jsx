import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5">
      <h1>ArogyaOne Multispeciality Hospital</h1>
      <p>One Platform, Complete Healthcare</p>

      <Link to="/doctors" className="btn btn-primary">
        Book Appointment
      </Link>

      <hr></hr>

      <Link to="/login" className="btn btn-success">
        Log in
      </Link>

    </div>
  );
};

export default Home;
