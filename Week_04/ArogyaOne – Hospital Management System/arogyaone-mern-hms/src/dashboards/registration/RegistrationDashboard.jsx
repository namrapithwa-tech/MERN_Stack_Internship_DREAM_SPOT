import RegistrationLayout from "./RegistrationLayout";
import AppointmentsTable from "./AppointmentsTable";
import WalkInPatientForm from "./WalkInPatientForm";
import PatientsTable from "./PatientsTable";

const RegistrationDashboard = () => {
  return (
    <RegistrationLayout>
      <div className="row mb-4">
        <div className="col-md-7">
          <AppointmentsTable />
        </div>
        <div className="col-md-5">
          <WalkInPatientForm />
        </div>
      </div>

      <hr />

      <PatientsTable />
    </RegistrationLayout>
  );
};

export default RegistrationDashboard;
