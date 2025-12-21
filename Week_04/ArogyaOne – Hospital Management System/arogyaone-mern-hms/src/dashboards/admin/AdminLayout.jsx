import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1">
        <AdminTopbar />
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
