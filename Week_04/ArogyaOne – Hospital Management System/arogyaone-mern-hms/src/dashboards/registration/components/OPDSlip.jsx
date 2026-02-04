import React, { forwardRef } from 'react';
import logo from '../../../assets/images/logo.png'; // Ensure you have a logo placeholder

const OPDSlip = forwardRef(({ data, doctor }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="bg-white p-4" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <div className="d-flex align-items-center gap-3">
             {/* Replace src with your actual logo path */}
            <div src={logo} style={{width:'60px', height:'60px',borderRadius:'50%'}}></div> 
            <div>
                <h4 className="fw-bold m-0 text-primary">AROGYA ONE HOSPITAL</h4>
                <small className="text-muted">Multi-Speciality & Trauma Center</small>
            </div>
        </div>
        <div className="text-end small">
            <p className="m-0"><strong>Emergency:</strong> +91 91733 16294</p>
            <p className="m-0"> Mavdi Chokadi, 150ft Ring Road, Rajkot, Gujarat</p>
            <p className="m-0"> info@arogyaone.com</p>
        </div>
      </div>

      {/* TITLE */}
      <div className="text-center mb-4">
        <h3 className="fw-bold text-decoration-underline">OPD SLIP</h3>
        <p className="m-0 badge bg-light text-dark border">
            Slip No: {data.opdId} | Date: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* PATIENT INFO */}
      <div className="row mb-3 border p-3 rounded mx-1">
        <div className="col-md-6">
            <p className="mb-1"><strong>Patient Name:</strong> {data.fullName.toUpperCase()}</p>
            <p className="mb-1"><strong>Age / Gender:</strong> {data.age} Y / {data.gender}</p>
            <p className="mb-0"><strong>Contact:</strong> {data.mobile}</p>
        </div>
        <div className="col-md-6 text-end">
            <p className="mb-1"><strong>UHID:</strong> {data.patientId}</p>
            <p className="mb-1"><strong>Blood Group:</strong> {data.bloodGroup || 'N/A'}</p>
            <p className="mb-0"><strong>Visit Type:</strong> WALK-IN</p>
        </div>
      </div>

      {/* DOCTOR INFO */}
      <div className="row mb-4 mx-1">
         <div className="col-12 bg-light p-2 border rounded">
            <p className="mb-1"><strong>Consultant:</strong> {doctor?.full_name} <span className="text-muted">({doctor?.department})</span></p>
            <p className="mb-0"><strong>OPD Slot:</strong> {data.opdSlot} ({data.opdTimings})</p>
         </div>
      </div>

      {/* PAYMENT INFO */}
      <table className="table table-bordered mb-5">
        <thead className="table-light">
            <tr>
                <th>Description</th>
                <th className="text-end">Amount (₹)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Consultation Charges</td>
                <td className="text-end">{data.consultation_fee}.00</td>
            </tr>
            <tr>
                <td className="text-end fw-bold">Total Paid ({data.paymentMode})</td>
                <td className="text-end fw-bold">{data.consultation_fee}.00</td>
            </tr>
        </tbody>
      </table>

      {/* FOOTER */}
      <div className="row mt-5 pt-5 align-items-end">
         <div className="col-6 text-muted small">
            * Terms & Conditions Apply.<br/>
            * Subject to Rajkot Jurisdiction only.<br/>
            * Valid for 3 Months for re-consultation.
         </div>
         <div className="col-6 text-end">
            <div className="border-top d-inline-block pt-2" style={{width: '200px'}}>
                <small>Authorized Signatory</small>
            </div>
         </div>
      </div>

    </div>
  );
});

export default OPDSlip;