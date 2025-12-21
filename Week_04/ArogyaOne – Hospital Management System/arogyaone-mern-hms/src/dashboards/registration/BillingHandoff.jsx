import { Link } from "react-router-dom";

const BillingHandoff = ({ patientId }) => {
  return (
    <div className="card p-3 mt-3">
      <h6>Billing Status</h6>
      <p>Status: <span className="badge bg-warning">Pending</span></p>

      <Link
        to={`/billing?patientId=${patientId}`}
        className="btn btn-primary btn-sm"
      >
        Go to Billing
      </Link>
    </div>
  );
};

export default BillingHandoff;
