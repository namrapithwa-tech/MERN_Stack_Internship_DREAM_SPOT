import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/registration.css';
import OPDSlip from '../components/OPDSlip'; // Assuming OPDSlip is in the parent's components folder
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReVisit = () => {
  // --- STATE ---
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form & Print State
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedIds, setGeneratedIds] = useState(null);
  const slipRef = useRef();

  const initialFormState = {
    doctorId: '', consultation_fee: 0,
    weight: '', height: '', bp: '', sugar: 'false', temp: '',
    paymentMode: 'Cash', upiTransactionId: '',
    opdSlot: 'Morning'
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DOCTORS ON LOAD ---
  useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
        } catch (err) { console.error("Error fetching doctors", err); }
    };
    fetchDoctors();
  }, []);

  // --- SEARCH HANDLER ---
  const handleSearch = async (e) => {
      e.preventDefault();
      if (!searchTerm.trim()) return;
      
      setIsSearching(true);
      try {
          const res = await api.get('/patients');
          const term = searchTerm.toLowerCase();
          const filtered = res.data.filter(p => 
              (p.mobile_number || '').includes(term) || 
              (p.id || '').toLowerCase().includes(term) ||
              (p.patient_full_name || '').toLowerCase().includes(term)
          );
          setSearchResults(filtered);
      } catch (error) {
          console.error("Search failed", error);
      } finally {
          setIsSearching(false);
      }
  };

  const handleSelectPatient = (patient) => {
      setSelectedPatient(patient);
      setSearchResults([]);
      setSearchTerm('');
  };

  const handleClearPatient = () => {
      setSelectedPatient(null);
      setFormData(initialFormState);
      setSelectedDoctor(null);
  };

  // --- FORM HANDLERS ---
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

  const handleClearForm = () => {
      setFormData(initialFormState);
      setSelectedDoctor(null);
      setGeneratedIds(null);
  };

  const generateIDs = () => {
      const timestamp = Date.now();
      const year = new Date().getFullYear();
      return {
          opdId: `OPD-${year}-${timestamp}`,
          vitalsId: `V-${timestamp}`
      };
  };

  // --- PRINT & SAVE FUNCTION ---
  const handlePrintAndSave = async () => {
    setIsSubmitting(true);
    const ids = generatedIds; 
    const today = new Date().toISOString();
    const todayDateOnly = new Date().toISOString().split('T')[0];

    try {
        // A. PREPARE PAYLOADS (NO PATIENT PAYLOAD)
        const vitalsPayload = {
            id: ids.vitalsId,
            patientId: selectedPatient.id,
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
            appointment_id: null,
            patient_id: selectedPatient.id,
            patient_name: selectedPatient.patient_full_name,
            patient_age: Number(selectedPatient.age),
            patient_gender: selectedPatient.gender,
            patient_bloodgroup: selectedPatient.blood_group,
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

        // C. API CALLS (Parallel Execution - Only Vitals & OPD)
        await Promise.all([
            api.post('/vitals', vitalsPayload),
            api.post('/opd_consultations', opdPayload)
        ]);

        alert("Re-Visit Registration Successful! Slip Downloaded.");
        setShowPreview(false);
        handleClearForm();
        handleClearPatient(); // Reset back to search screen

    } catch (error) {
        console.error("Registration Failed", error);
        alert("Failed to register re-visit. Check server connection.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Combine patient data and form data for the OPDSlip
  const slipData = selectedPatient && generatedIds ? {
      ...formData,
      fullName: selectedPatient.patient_full_name,
      mobile: selectedPatient.mobile_number,
      age: selectedPatient.age,
      gender: selectedPatient.gender,
      bloodGroup: selectedPatient.blood_group,
      patientId: selectedPatient.id,
      opdId: generatedIds.opdId,
      opdTimings: formData.opdSlot === 'Morning' ? '09:30 AM - 12:30 PM' : '05:00 PM - 07:00 PM'
  } : null;

  return (
    <div className="container-fluid">
       <h4 className="fw-bold text-dark mb-4">Search / Re-Visit Registration</h4>

       {/* --- PHASE 1: SEARCH PATIENT --- */}
       {!selectedPatient && (
           <div className="reg-container mb-4">
               <div className="section-title">Find Existing Patient</div>
               <form onSubmit={handleSearch} className="row g-3 align-items-end">
                   <div className="col-md-6">
                       <label className="reg-label">Search by UHID, Name, or Mobile Number</label>
                       <input 
                           type="text" 
                           className="reg-input" 
                           placeholder="Enter search term..." 
                           value={searchTerm} 
                           onChange={(e) => setSearchTerm(e.target.value)} 
                           required 
                       />
                   </div>
                   <div className="col-md-3">
                       <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isSearching}>
                           <i className="fa-solid fa-magnifying-glass me-2"></i> {isSearching ? 'Searching...' : 'Search'}
                       </button>
                   </div>
               </form>

               {/* Search Results Table */}
               {searchResults.length > 0 && (
                   <div className="mt-4 border rounded overflow-hidden">
                       <table className="table table-hover align-middle mb-0">
                           <thead className="bg-light">
                               <tr>
                                   <th className="ps-3">UHID</th>
                                   <th>Name</th>
                                   <th>Mobile</th>
                                   <th>Age/Gender</th>
                                   <th className="text-end pe-3">Action</th>
                               </tr>
                           </thead>
                           <tbody>
                               {searchResults.map(p => (
                                   <tr key={p.id}>
                                       <td className="ps-3 fw-bold text-primary">{p.id}</td>
                                       <td className="fw-bold">{p.patient_full_name}</td>
                                       <td>{p.mobile_number}</td>
                                       <td>{p.age} Y / {p.gender}</td>
                                       <td className="text-end pe-3">
                                           <button className="btn btn-sm btn-success fw-bold px-3" onClick={() => handleSelectPatient(p)}>
                                               Select
                                           </button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               )}
               {searchResults.length === 0 && searchTerm && !isSearching && (
                   <div className="mt-3 text-danger small"><i className="fa-solid fa-circle-exclamation me-1"></i> Press Search to find patients.</div>
               )}
           </div>
       )}

       {/* --- PHASE 2: RE-VISIT FORM --- */}
       {selectedPatient && (
           <div className="reg-container">
              
              {/* Locked Patient Info */}
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light border rounded">
                  <div>
                      <h5 className="fw-bold text-primary mb-1">{selectedPatient.patient_full_name} <span className="text-dark fs-6 fw-normal">({selectedPatient.id})</span></h5>
                      <div className="text-muted small">
                          <span className="me-3"><i className="fa-solid fa-phone me-1"></i> {selectedPatient.mobile_number}</span>
                          <span className="me-3"><i className="fa-solid fa-user me-1"></i> {selectedPatient.age} Y, {selectedPatient.gender}</span>
                          <span><i className="fa-solid fa-droplet text-danger me-1"></i> {selectedPatient.blood_group || 'N/A'}</span>
                      </div>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={handleClearPatient}>
                      <i className="fa-solid fa-xmark me-1"></i> Change Patient
                  </button>
              </div>

              <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  setGeneratedIds(generateIDs());
                  setShowPreview(true); 
              }}>
                
                {/* DOCTOR & TIMING */}
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

                {/* VITALS */}
                <div className="section-title">New Vitals (Optional)</div>
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

                {/* PAYMENT & CONFIRMATION */}
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
                        <button type="button" className="btn btn-secondary w-50 py-2" onClick={handleClearForm}>Clear</button>
                        <button type="submit" className="btn btn-primary w-50 py-2 fw-bold">
                            <i className="fa-solid fa-print"></i> Register
                        </button>
                    </div>
                </div>

              </form>
           </div>
       )}

       {/* PREVIEW MODAL */}
       {showPreview && generatedIds && slipData && (
         <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Confirm & Print Re-Visit Slip</h5>
                        <button className="btn-close" onClick={() => setShowPreview(false)}></button>
                    </div>
                    <div className="modal-body bg-secondary bg-opacity-10 p-4 overflow-auto" style={{maxHeight: '70vh'}}>
                        <div className="d-flex justify-content-center">
                            <OPDSlip 
                                ref={slipRef} 
                                data={slipData} 
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

export default ReVisit;