import RegistrationSidebar from "./RegistrationSidebar";
import RegistrationTopbar from "./RegistrationTopbar";
import "../../../assets/css/registration.css";

const RegistrationLayout = ({ children, pageTitle, pageDesc }) => {
  return (
    <div className="reg-wrapper">
      <RegistrationSidebar />

      <div className="reg-content">
        <RegistrationTopbar
          title={pageTitle}
          description={pageDesc}
        />

        <main className="reg-main">
          {children}
        </main>

        <footer className="reg-footer">
          © {new Date().getFullYear()} ArogyaOne Hospital Management System
        </footer>
      </div>
    </div>
  );
};

export default RegistrationLayout;
