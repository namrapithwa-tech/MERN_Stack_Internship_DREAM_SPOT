import RegistrationLayout from "../layout/RegistrationLayout";
import WalkInPatientForm from "../components/WalkInPatientForm";

const WalkInPatient = () => {
  return (
    <RegistrationLayout
      pageTitle="New Walk-in Patient"
      pageDesc="Register OPD patient and generate consultation slip"
    >
      <WalkInPatientForm />
    </RegistrationLayout>
  );
};

export default WalkInPatient;
