import RegistrationSidebar from "./RegistrationSidebar";
import RegistrationTopbar from "./RegistrationTopbar";

const RegistrationLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <RegistrationSidebar />
      <div className="flex-grow-1">
        <RegistrationTopbar />
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
};

export default RegistrationLayout;
