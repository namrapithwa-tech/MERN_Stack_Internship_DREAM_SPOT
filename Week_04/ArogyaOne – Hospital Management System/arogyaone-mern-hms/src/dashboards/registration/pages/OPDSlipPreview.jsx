import { useEffect, useState } from "react";
import generateOPDSlipPDF from "../utils/generateOPDSlipPDF";
import "../../../assets/css/registration/opd-slip.css";


const OPDSlipPreview = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("OPD_PREVIEW_DATA");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return null;

  const { opdId, patientId, patient, doctor, fee } = data;

  return (
    <div className="opd-preview-container">
      <div id="opd-slip" className="opd-slip">
        {/* HEADER */}
        <div className="opd-header">
          <img src="/logo192.png" alt="Hospital Logo" />
          <div>
            <h3>ArogyaOne Hospital</h3>
            <p>Rajkot, Gujarat</p>
            <p>Emergency: +91 99999 88888</p>
            <p>Email: support@arogyaone.com</p>
          </div>
        </div>

        <hr />

        <h4 className="text-center">OPD SLIP</h4>

        {/* PATIENT INFO */}
        <section>
          <h6>Patient Information</h6>
          <p><b>Patient ID:</b> {patientId}</p>
          <p><b>Name:</b> {patient.full_name}</p>
          <p><b>Age / Gender:</b> {patient.age} / {patient.gender}</p>
          <p><b>Blood Group:</b> {patient.blood_group || "N/A"}</p>
          <p><b>Mobile:</b> {patient.mobile}</p>
        </section>

        {/* DOCTOR INFO */}
        <section>
          <h6>Doctor Information</h6>
          <p><b>Doctor:</b> {doctor.full_name}</p>
          <p><b>Department:</b> {doctor.department}</p>
          <p><b>OPD Timings:</b> {doctor.opd_timings?.morning}</p>
        </section>

        {/* PAYMENT */}
        <section>
          <h6>Payment Details</h6>
          <p><b>Consultation Fee:</b> ₹{fee}</p>
          <p><b>Mode:</b> CASH / UPI</p>
        </section>

        <div className="opd-footer">
          <p>Subject to Rajkot Jurisdiction only</p>
          <div className="sign-box">Signature & Stamp</div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="text-center mt-4">
        <button
          className="btn btn-success px-4"
          onClick={() => generateOPDSlipPDF()}
        >
          Print OPD Slip
        </button>
      </div>
    </div>
  );
};

export default OPDSlipPreview;
