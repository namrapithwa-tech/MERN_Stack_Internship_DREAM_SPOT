import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import api from '../../api/axios';
import '../../assets/css/registration.css';
import OPDSlip from './components/OPDSlip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NewWalkIn = () => {
  // --- HOOKS ---
  const location = useLocation();
  const appointmentData = location.state?.appointmentData; // Get passed data

  // --- STATE ---
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW STATE TO HOLD IDS SO THEY DON'T CHANGE BETWEEN PREVIEW AND SAVE
  const [generatedIds, setGeneratedIds] = useState(null);
  
  const slipRef = useRef(); 

  // Initial State
  const initialState = {
    fullName: '', mobile: '', age: '', gender: 'Male', bloodGroup: '',
    doctorId: '', consultation_fee: 0,
    weight: '', height: '', bp: '', sugar: 'false', temp: '',
    paymentMode: 'Cash', upiTransactionId: '',
    opdSlot: 'Morning'
  };

  const [formData, setFormData] = useState(initialState);

  // --- 1. FETCH DOCTORS ---
  useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
        } catch (err) { console.error("Error fetching doctors", err); }
    };
    fetchDoctors();
  }, []);

  // --- 2. PRE-FILL FORM IF APPOINTMENT DATA EXISTS ---
  useEffect(() => {
    if (doctors.length > 0 && appointmentData) {
        // Find the doctor to get the fee
        const doc = doctors.find(d => d.id === appointmentData.doctorId);
        const fee = doc ? doc.consultation_fee : 0;
        
        // Normalize Time Slot
        let slot = 'Morning';
        if (appointmentData.time && appointmentData.time.toLowerCase().includes('evening')) {
            slot = 'Evening';
        }

        setFormData(prev => ({
            ...prev,
            fullName: appointmentData.name || '',
            mobile: appointmentData.phone || '',
            age: appointmentData.age || '',
            gender: appointmentData.gender || 'Male',
            doctorId: appointmentData.doctorId || '',
            consultation_fee: fee,
            opdSlot: slot
        }));
        
        setSelectedDoctor(doc);
    }
  }, [doctors, appointmentData]);

  // --- HANDLERS ---
  const handleInput = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      if (name === 'doctorId') {
          const doc = doctors.find(d => d.id === value);
          setSelectedDoctor(doc);
          setFormData(prev => ({ 
              ...prev, 
              doctorId: value, 
              consultation_fee: doc ? doc.consultation_fee : 0 
          }));
      }
  };

  const handleClear = () => {
      setFormData(initialState);
      setSelectedDoctor(null);
      setGeneratedIds(null); // Clear IDs on reset
  };

  const generateIDs = () => {
      const timestamp = Date.now();
      const year = new Date().getFullYear();
      return {
          patientId: `P-${year}-${timestamp}`,
          opdId: `OPD-${year}-${timestamp}`,
          vitalsId: `V-${timestamp}`
      };
  };

  // --- PRINT & SAVE FUNCTION ---
  const handlePrintAndSave = async () => {
    setIsSubmitting(true);
    
    // USE THE IDS GENERATED WHEN THE PREVIEW OPENED
    const ids = generatedIds; 
    
    const today = new Date().toISOString();
    const todayDateOnly = new Date().toISOString().split('T')[0];

    try {
        // A. PREPARE PAYLOADS
        const patientPayload = {
            id: ids.patientId,
            patient_full_name: formData.fullName,
            age: Number(formData.age),
            gender: formData.gender,
            mobile_number: formData.mobile,
            blood_group: formData.bloodGroup,
            consultant_doctor_id: formData.doctorId,
            consultant_doctor_name: selectedDoctor?.full_name || selectedDoctor?.name,
            // LOGIC: If appointmentData exists, type is APPOINTMENT
            registration_type: appointmentData ? "APPOINTMENT" : "WALK-IN",
            created_at: today,
            created_by: "REGISTRATION"
        };

        const vitalsPayload = {
            id: ids.vitalsId,
            patientId: ids.patientId,
            weight: formData.weight,
            height: formData.height,
            blood_pressure: formData.bp,
            temprature: formData.temp,
            sugar: formData.sugar,
            recorded_by: "REGISTRATION",
            recorded_at: today
        };

        const opdPayload = {
            id: ids.opdId,
            appointment_id: appointmentData ? appointmentData.id : null, // Link Appointment ID
            patient_id: ids.patientId,
            patient_name: formData.fullName,
            patient_age: Number(formData.age),
            patient_gender: formData.gender,
            patient_bloodgroup: formData.bloodGroup,
            doctor_id: formData.doctorId,
            doctor_name: selectedDoctor?.full_name || selectedDoctor?.name,
            department: selectedDoctor?.department,
            visit_type: "OPD",
            opd_date: todayDateOnly,
            opd_time_slot: formData.opdSlot,
            opd_timings: formData.opdSlot === 'Morning' ? '09:30 AM - 12:30 PM' : '05:00 PM - 07:00 PM',
            chief_complaint: null, diagnosis: null, clinical_notes: null, medicines: [], LabTest_advised: [],
            consultation_fee: Number(formData.consultation_fee),
            payment: {
                status: "PAID",
                mode: formData.paymentMode.toUpperCase(),
                amount_paid: Number(formData.consultation_fee),
                transaction_id: formData.upiTransactionId || null,
                payment_date: todayDateOnly
            },
            follow_up_required: false, is_billed: true, is_closed: false
        };

        // B. GENERATE PDF
        const canvas = await html2canvas(slipRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`OPD_Slip_${ids.opdId}.pdf`);

        // C. API CALLS (Parallel Execution)
        const apiCalls = [
            api.post('/patients', patientPayload),
            api.post('/vitals', vitalsPayload),
            api.post('/opd_consultations', opdPayload)
        ];

        // D. IF APPOINTMENT: Update Status to CONFIRMED
        if (appointmentData) {
            apiCalls.push(api.patch(`/appointments/${appointmentData.id}`, {
                status: 'CONFIRMED',
                patientId: ids.patientId
            }));
        }

        await Promise.all(apiCalls);

        alert("Registration Successful! Slip Downloaded.");
        setShowPreview(false);
        handleClear();

    } catch (error) {
        console.error("Registration Failed", error);
        alert("Failed to register patient. Check server connection.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
       <div className="d-flex justify-content-between align-items-center mb-4">
           <h4 className="fw-bold text-dark m-0">
               {appointmentData ? <span className="text-primary"><i className="fa-solid fa-calendar-check me-2"></i>Confirm Appointment</span> : 'New Walk-In Registration'}
           </h4>
           {appointmentData && <span className="badge bg-primary">Appt ID: {appointmentData.id}</span>}
       </div>

       <div className="reg-container">
          <form onSubmit={(e) => { 
              e.preventDefault(); 
              // GENERATE IDS ONCE WHEN CLICKING REGISTER
              setGeneratedIds(generateIDs());
              setShowPreview(true); 
          }}>
            
            {/* 1. PERSONAL INFO */}
            <div className="section-title">Personal Information</div>
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label className="reg-label">Full Name <span className="text-danger">*</span></label>
                    <input type="text" name="fullName" value={formData.fullName} className="reg-input" required onChange={handleInput} />
                </div>
                <div className="col-md-3">
                    <label className="reg-label">Mobile Number <span className="text-danger">*</span></label>
                    <input type="tel" name="mobile" value={formData.mobile} className="reg-input" required maxLength="10" onChange={handleInput} />
                </div>
                <div className="col-md-2">
                    <label className="reg-label">Age <span className="text-danger">*</span></label>
                    <input type="number" name="age" value={formData.age} className="reg-input" required onChange={handleInput} />
                </div>
                <div className="col-md-3">
                    <label className="reg-label">Gender <span className="text-danger">*</span></label>
                    <select name="gender" value={formData.gender} className="reg-select" onChange={handleInput}>
                        <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="reg-label">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} className="reg-select" onChange={handleInput}>
                        <option value="">Select</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                </div>
            </div>

            {/* 2. DOCTOR & TIMING */}
            <div className="section-title">Consultation Details</div>
            <div className="row g-4 mb-4">
                <div className="col-md-5">
                    <label className="reg-label">Consultant Doctor <span className="text-danger">*</span></label>
                    <select name="doctorId" value={formData.doctorId} className="reg-select" required onChange={handleInput}>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.full_name} ({doc.department})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="reg-label">OPD Slot</label>
                    <div className="d-flex gap-3 mt-2">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="opdSlot" value="Morning" checked={formData.opdSlot === 'Morning'} onChange={handleInput}/>
                            <label className="form-check-label">Morning 09:00 AM - 12:30 PM</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="opdSlot" value="Evening" checked={formData.opdSlot === 'Evening'} onChange={handleInput}/>
                            <label className="form-check-label">Evening 05:00 PM - 07:00 PM</label>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. VITALS */}
            <div className="section-title">Vitals (Optional)</div>
            <div className="vitals-grid mb-4">
                <div>
                    <label className="reg-label">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} className="reg-input" onChange={handleInput} />
                </div>
                <div>
                    <label className="reg-label">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} className="reg-input" onChange={handleInput} />
                </div>
                <div>
                    <label className="reg-label">BP (mmHg)</label>
                    <input type="text" name="bp" value={formData.bp} placeholder="120/80" className="reg-input" onChange={handleInput} />
                </div>
                <div>
                    <label className="reg-label">Temp (°F)</label>
                    <input type="number" name="temp" value={formData.temp} className="reg-input" onChange={handleInput} />
                </div>
                <div>
                     <label className="reg-label">Sugar/Diabetes?</label>
                     <select name="sugar" value={formData.sugar} className="reg-select" onChange={handleInput}>
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                     </select>
                </div>
            </div>

            {/* 4. PAYMENT */}
            <div className="section-title">Payment & Confirmation</div>
            <div className="row g-3 align-items-end">
                <div className="col-md-2">
                    <label className="reg-label">Fee (₹)</label>
                    <input type="text" value={formData.consultation_fee} readOnly className="reg-input bg-light fw-bold" />
                </div>
                <div className="col-md-3">
                    <label className="reg-label">Payment Mode</label>
                    <div className="d-flex gap-3 mt-2">
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="paymentMode" value="Cash" checked={formData.paymentMode === 'Cash'} onChange={handleInput}/>
                            <label className="form-check-label">Cash</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="paymentMode" value="UPI" checked={formData.paymentMode === 'UPI'} onChange={handleInput}/>
                            <label className="form-check-label">UPI</label>
                        </div>
                    </div>
                </div>
                {formData.paymentMode === 'UPI' ? (
                    <div className="col-md-4">
                        <label className="reg-label">Transaction ID</label>
                        <input type="text" name="upiTransactionId" value={formData.upiTransactionId} className="reg-input" placeholder="Enter UPI Ref No" required onChange={handleInput} />
                    </div>
                ) : <div className="col-md-4"></div>}
                
                <div className="col-md-3 d-flex gap-2">
                    <button type="button" className="btn btn-secondary w-50 py-2" onClick={handleClear}>Clear</button>
                    <button type="submit" className="btn btn-primary w-50 py-2 fw-bold">
                        <i className="fa-solid fa-print"></i> Register
                    </button>
                </div>
            </div>

          </form>
       </div>

       {/* PREVIEW MODAL */}
       {showPreview && generatedIds && (
         <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm & Print Slip</h5>
                        <button className="btn-close" onClick={() => setShowPreview(false)}></button>
                    </div>
                    <div className="modal-body bg-secondary bg-opacity-10 p-4 overflow-auto" style={{maxHeight: '70vh'}}>
                        <div className="d-flex justify-content-center">
                            <OPDSlip 
                                ref={slipRef} 
                                data={{
                                    ...formData, 
                                    // USE THE STATE IDS HERE
                                    opdId: generatedIds.opdId,
                                    patientId: generatedIds.patientId,
                                    opdTimings: formData.opdSlot === 'Morning' ? '09:30 AM - 12:30 PM' : '05:00 PM - 07:00 PM'
                                }} 
                                doctor={selectedDoctor} 
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={() => setShowPreview(false)}>Cancel</button>
                        <button className="btn btn-success fw-bold" disabled={isSubmitting} onClick={handlePrintAndSave}>
                            {isSubmitting ? 'Processing...' : 'Confirm & Print'}
                        </button>
                    </div>
                </div>
            </div>
         </div>
       )}

    </div>
  );
};

export default NewWalkIn;