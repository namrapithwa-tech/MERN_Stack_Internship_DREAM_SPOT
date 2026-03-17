import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/doctor.css';
import logo from '../../../assets/images/logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// IMPORTANT: Import your AuthContext (Adjust path if needed)
import { AuthContext } from '../../../context/AuthContext';

const OPDConsultation = () => {
    // Grab the logged-in user object from Context
    const { user } = useContext(AuthContext);

    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

    // Selected Patient & Form State
    const [selectedConsult, setSelectedConsult] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        chief_complaint: '',
        clinical_notes: '',
        diagnosis: '',
        LabTest_advised: '',
        follow_up_required: false,
        follow_up_date: '',
        medicines: []
    });

    const printRef = useRef();

    // Re-run the fetch ONLY when the 'user' object is ready
    useEffect(() => {
        if (user) {
            fetchTodayQueue();
        }
    }, [user]);

    const fetchTodayQueue = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const res = await api.get(`/opd_consultations?opd_date=${todayStr}`);
            
            // ==========================================
            // SECURITY FIX: Filter for Logged-In Doctor
            // ==========================================
            // We use user.linked_id because that maps to the 'D-2026-...' format in the OPD records!
            const loggedInDoctorId = user?.linked_id; 
            
            // Filter the data so this doctor ONLY sees their own queue
            const myConsultations = res.data.filter(c => c.doctor_id === loggedInDoctorId);

            // Sort so pending ones are at the top 
            const sortedData = myConsultations.sort((a, b) => a.is_closed - b.is_closed);
            setConsultations(sortedData);

            setStats({
                total: sortedData.length,
                pending: sortedData.filter(c => !c.is_closed).length,
                completed: sortedData.filter(c => c.is_closed).length
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching OPD queue:", error);
            setLoading(false);
        }
    };

    // --- FORM HANDLERS ---
    const handleConsultClick = (consult) => {
        setSelectedConsult(consult);
        setFormData({
            chief_complaint: consult.chief_complaint || '',
            clinical_notes: consult.clinical_notes || '',
            diagnosis: consult.diagnosis || '',
            LabTest_advised: consult.LabTest_advised ? consult.LabTest_advised.join(', ') : '',
            follow_up_required: consult.follow_up_required || false,
            follow_up_date: consult.follow_up_date || '',
            medicines: consult.medicines?.length > 0 ? consult.medicines : [{ medicine_name: '', dosage: '', duration_days: '' }]
        });
        setShowFormModal(true);
    };

    const handleAddMedicine = () => {
        setFormData({ ...formData, medicines: [...formData.medicines, { medicine_name: '', dosage: '', duration_days: '' }] });
    };

    const handleRemoveMedicine = (index) => {
        const newMeds = formData.medicines.filter((_, i) => i !== index);
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...formData.medicines];
        newMeds[index][field] = value;
        setFormData({ ...formData, medicines: newMeds });
    };

    const handleSaveConsultation = async (e) => {
        e.preventDefault();
        try {
            // Clean up empty medicines
            const cleanMeds = formData.medicines.filter(m => m.medicine_name.trim() !== '');
            // Convert Lab tests string to array
            const labTests = formData.LabTest_advised ? formData.LabTest_advised.split(',').map(t => t.trim()) : [];

            const payload = {
                chief_complaint: formData.chief_complaint,
                clinical_notes: formData.clinical_notes,
                diagnosis: formData.diagnosis,
                LabTest_advised: labTests,
                medicines: cleanMeds,
                follow_up_required: formData.follow_up_required,
                follow_up_date: formData.follow_up_required ? formData.follow_up_date : null,
                is_closed: true // Mark as completed
            };

            await api.patch(`/opd_consultations/${selectedConsult.id}`, payload);
            
            // Update local state to immediately show in print preview
            setSelectedConsult({ ...selectedConsult, ...payload });
            
            setShowFormModal(false);
            setShowPrintModal(true);
            fetchTodayQueue();
        } catch (error) {
            console.error("Failed to save consultation:", error);
            alert("Failed to save. Check server.");
        }
    };

    // --- PRINT HANDLER ---
    const generateRxPDF = async () => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Prescription_${selectedConsult.patient_name}_${selectedConsult.opd_date}.pdf`);
            } catch (err) {
                console.error("Print failed:", err);
            } finally {
                setIsPrinting(false);
                setShowPrintModal(false);
            }
        }, 500);
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-3">
            
            {/* STATS HEADER */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-primary border-4">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-users text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">My Total Queue</h6><h3 className="fw-bold mb-0">{stats.total}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-warning border-4">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-hourglass-half text-warning fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Pending Patients</h6><h3 className="fw-bold mb-0">{stats.pending}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-success border-4">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-check-double text-success fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Completed</h6><h3 className="fw-bold mb-0">{stats.completed}</h3></div>
                    </div>
                </div>
            </div>

            {/* QUEUE TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm rounded-3 border border-light">
                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold m-0 text-dark"><i className="fa-solid fa-list me-2 text-success"></i> My Waiting List (Today)</h5>
                    <span className="text-muted fw-bold">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-white text-muted small">
                        <tr>
                            <th className="ps-4">Token / OPD ID</th>
                            <th>Patient Details</th>
                            <th>Doctor & Dept</th>
                            <th>Slot</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consultations.length > 0 ? consultations.map((consult, index) => (
                            <tr key={consult.id} className={!consult.is_closed ? "bg-success bg-opacity-10" : ""}>
                                <td className="ps-4">
                                    <div className="fw-bold text-dark">#{index + 1}</div>
                                    <div className="small text-muted">{consult.id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-primary">{consult.patient_name}</div>
                                    <div className="small text-muted">{consult.patient_age} Y | {consult.patient_gender}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{consult.doctor_name}</div>
                                    <div className="small text-muted">{consult.department}</div>
                                </td>
                                <td>
                                    <span className="badge bg-light border text-dark"><i className="fa-regular fa-clock me-1"></i>{consult.opd_time_slot}</span>
                                </td>
                                <td>
                                    {consult.is_closed ? 
                                        <span className="badge bg-success rounded-pill px-3 py-2">Completed</span> : 
                                        <span className="badge bg-warning text-dark rounded-pill px-3 py-2">Waiting</span>
                                    }
                                </td>
                                <td className="text-center">
                                    {!consult.is_closed ? (
                                        <button className="btn btn-sm btn-success fw-bold px-3" onClick={() => handleConsultClick(consult)}>
                                            <i className="fa-solid fa-stethoscope me-2"></i> Consult
                                        </button>
                                    ) : (
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-outline-info" onClick={() => handleConsultClick(consult)} title="Edit Notes">
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button className="btn btn-sm btn-dark" onClick={() => { setSelectedConsult(consult); setShowPrintModal(true); }} title="Print Prescription">
                                                <i className="fa-solid fa-print"></i> Rx
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-5 text-muted fst-italic">No patients in your queue for today.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================
                MODAL: CLINICAL CONSULTATION FORM
            ========================================= */}
            {showFormModal && selectedConsult && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-notes-medical me-2"></i> Clinical Consultation</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowFormModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveConsultation}>
                                <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '75vh' }}>
                                    
                                    {/* Patient Banner */}
                                    <div className="d-flex justify-content-between align-items-center bg-light border p-3 rounded mb-4">
                                        <div>
                                            <h5 className="fw-bold text-primary m-0">{selectedConsult.patient_name}</h5>
                                            <small className="text-muted">UHID: {selectedConsult.patient_id} | {selectedConsult.patient_age}Y, {selectedConsult.patient_gender} | BG: <span className="text-danger fw-bold">{selectedConsult.patient_bloodgroup}</span></small>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 fs-6">
                                                <i className="fa-solid fa-user-doctor me-2"></i>{selectedConsult.doctor_name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="row g-4">
                                        {/* Left Column: Notes & Diagnosis */}
                                        <div className="col-md-5">
                                            <div className="mb-3">
                                                <label className="doc-label">Chief Complaint / Symptoms <span className="text-danger">*</span></label>
                                                <textarea className="doc-input" rows="2" required value={formData.chief_complaint} onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})} placeholder="e.g. Fever and dry cough for 3 days..."></textarea>
                                            </div>
                                            <div className="mb-3">
                                                <label className="doc-label">Final Diagnosis</label>
                                                <input type="text" className="doc-input border-primary bg-primary bg-opacity-10 fw-bold" value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} placeholder="e.g. Viral URI" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="doc-label">Clinical / Examination Notes</label>
                                                <textarea className="doc-input" rows="4" value={formData.clinical_notes} onChange={(e) => setFormData({...formData, clinical_notes: e.target.value})} placeholder="BP: 120/80, Temp: 99.5F..."></textarea>
                                            </div>
                                            <div className="mb-3">
                                                <label className="doc-label">Advised Lab Tests / Investigations</label>
                                                <input type="text" className="doc-input" value={formData.LabTest_advised} onChange={(e) => setFormData({...formData, LabTest_advised: e.target.value})} placeholder="e.g. CBC, Chest X-Ray (Comma separated)" />
                                            </div>
                                        </div>

                                        {/* Right Column: Rx & Follow-up */}
                                        <div className="col-md-7 border-start pl-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-bold text-dark m-0"><i className="fa-solid fa-prescription text-primary me-2 fs-3"></i>Prescription (Rx)</h5>
                                                <button type="button" className="btn btn-sm btn-outline-success fw-bold" onClick={handleAddMedicine}>+ Add Medicine</button>
                                            </div>

                                            {formData.medicines.map((med, index) => (
                                                <div className="row g-2 mb-3 align-items-center bg-light p-2 rounded border" key={index}>
                                                    <div className="col-5">
                                                        <label className="small fw-bold text-muted">Medicine Name</label>
                                                        <input type="text" className="form-control form-control-sm border-secondary" placeholder="e.g. Paracetamol 650mg" value={med.medicine_name} onChange={(e) => handleMedChange(index, 'medicine_name', e.target.value)} required />
                                                    </div>
                                                    <div className="col-3">
                                                        <label className="small fw-bold text-muted">Dosage</label>
                                                        <input type="text" className="form-control form-control-sm border-secondary" placeholder="e.g. 1-0-1" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} required />
                                                    </div>
                                                    <div className="col-3">
                                                        <label className="small fw-bold text-muted">Days</label>
                                                        <input type="number" className="form-control form-control-sm border-secondary" placeholder="e.g. 5" value={med.duration_days} onChange={(e) => handleMedChange(index, 'duration_days', e.target.value)} required />
                                                    </div>
                                                    <div className="col-1 text-center pt-4">
                                                        <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => handleRemoveMedicine(index)}>
                                                            <i className="fa-solid fa-circle-xmark fs-5"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.medicines.length === 0 && <div className="text-muted small fst-italic mb-3">No medicines added yet.</div>}

                                            <hr className="my-4"/>

                                            {/* Follow Up */}
                                            <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                                                <div className="form-check form-switch mb-2">
                                                    <input className="form-check-input fs-5" type="checkbox" id="followUpCheck" checked={formData.follow_up_required} onChange={(e) => setFormData({...formData, follow_up_required: e.target.checked})} />
                                                    <label className="form-check-label fw-bold ms-2 mt-1" htmlFor="followUpCheck">Follow-up Required?</label>
                                                </div>
                                                {formData.follow_up_required && (
                                                    <div className="mt-2 w-50">
                                                        <label className="small fw-bold text-muted">Next Visit Date</label>
                                                        <input type="date" className="form-control border-warning" required min={new Date().toISOString().split('T')[0]} value={formData.follow_up_date} onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Close</button>
                                    <button type="submit" className="btn btn-success fw-bold px-4"><i className="fa-solid fa-check me-2"></i>Save & Print Rx</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: PRINT PREVIEW
            ========================================= */}
            {showPrintModal && selectedConsult && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-4 text-center">
                            <h4 className="fw-bold mb-3 text-success"><i className="fa-solid fa-circle-check me-2"></i>Consultation Saved</h4>
                            <p className="text-muted mb-4">The clinical notes and prescription have been successfully recorded in the EMR.</p>
                            <button className="btn btn-dark btn-lg w-100 mb-3" disabled={isPrinting} onClick={generateRxPDF}>
                                <i className="fa-solid fa-print me-2"></i> {isPrinting ? 'Generating PDF...' : 'Print Prescription Layout'}
                            </button>
                            <button className="btn btn-link text-muted" onClick={() => setShowPrintModal(false)}>Back to Queue</button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN PRINT LAYOUT (A4 Rx Pad)
            ========================================= */}
            {selectedConsult && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <div className="print-offscreen" ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={logo} alt="Logo" style={{ width: '60px', height: '60px', marginRight: '15px' }} />
                                <div>
                                    <h1 style={{ margin: '0', color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}>ArogyaOne Hospital</h1>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>123 Health Avenue, Medical District, City</p>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Phone: +91 98765 43210 | www.arogyaone.com</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold' }}>{selectedConsult.doctor_name}</h3>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>{selectedConsult.department}</p>
                                <p style={{ margin: '0', fontSize: '12px' }}>Reg No: MED-2026-XYZ</p>
                            </div>
                        </div>

                        {/* PATIENT INFO BANNER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px' }}>
                            <div>
                                <strong>Patient Name:</strong> {selectedConsult.patient_name}<br/>
                                <strong>Age / Sex:</strong> {selectedConsult.patient_age} Years / {selectedConsult.patient_gender}<br/>
                                <strong>UHID:</strong> {selectedConsult.patient_id}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <strong>Date:</strong> {new Date(selectedConsult.opd_date).toLocaleDateString('en-GB')}<br/>
                                <strong>Day:</strong> {new Date(selectedConsult.opd_date).toLocaleDateString('en-GB', { weekday: 'long' })}<br/>
                                <strong>Consultation ID:</strong> {selectedConsult.id}
                            </div>
                        </div>

                        {/* CLINICAL BODY */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {/* Left Column (Vitals & Complaints) */}
                            <div style={{ width: '35%', borderRight: '1px solid #ccc', paddingRight: '15px' }}>
                                <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase' }}>Chief Complaint</h5>
                                <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{selectedConsult.chief_complaint || 'N/A'}</p>

                                <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '20px' }}>Clinical Notes</h5>
                                <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{selectedConsult.clinical_notes || 'N/A'}</p>

                                {selectedConsult.LabTest_advised && selectedConsult.LabTest_advised.length > 0 && (
                                    <>
                                        <h5 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '20px' }}>Investigations Advised</h5>
                                        <ul style={{ fontSize: '13px', paddingLeft: '20px' }}>
                                            {selectedConsult.LabTest_advised.map((test, i) => (
                                                <li key={i}>{test}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>

                            {/* Right Column (Rx) */}
                            <div style={{ width: '65%', paddingLeft: '5px' }}>
                                {selectedConsult.diagnosis && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <strong style={{ fontSize: '16px' }}>Diagnosis: </strong> 
                                        <span style={{ fontSize: '16px', color: '#dc3545', fontWeight: 'bold' }}>{selectedConsult.diagnosis}</span>
                                    </div>
                                )}

                                <h1 style={{ fontSize: '36px', fontFamily: 'serif', margin: '0 0 10px 0', color: '#10b981' }}>Rx</h1>
                                
                                {selectedConsult.medicines && selectedConsult.medicines.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                                                <th style={{ padding: '8px 0' }}>Medicine Name</th>
                                                <th style={{ padding: '8px 0' }}>Dosage</th>
                                                <th style={{ padding: '8px 0', textAlign: 'right' }}>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedConsult.medicines.map((med, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{i + 1}. {med.medicine_name}</td>
                                                    <td style={{ padding: '10px 0' }}>{med.dosage}</td>
                                                    <td style={{ padding: '10px 0', textAlign: 'right' }}>{med.duration_days} Days</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#888' }}>No medications prescribed.</p>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div style={{ position: 'absolute', bottom: '30px', left: '15px', right: '15px' }}>
                            {selectedConsult.follow_up_required && (
                                <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '5px', display: 'inline-block', marginBottom: '20px' }}>
                                    <strong style={{ color: '#856404' }}><i className="fa-solid fa-calendar-check me-2"></i>Next Follow-up Visit: </strong> 
                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{new Date(selectedConsult.follow_up_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#777' }}>
                                    Generated by ArogyaOne EMR System<br/>
                                    Valid only with Doctor's signature or digital stamp.
                                </div>
                                <div style={{ textAlign: 'center', width: '200px' }}>
                                    <div style={{ height: '40px' }}></div> {/* Space for physical signature */}
                                    <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '0 0 5px 0' }}/>
                                    <strong>{selectedConsult.doctor_name}</strong><br/>
                                    <span style={{ fontSize: '12px' }}>Signature & Stamp</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OPDConsultation;