import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/doctor.css'; // Using doctor-specific styles
import logo from '../../../assets/images/logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DoctorAllPatients = () => {
    // --- STATE ---
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Stats
    const [stats, setStats] = useState({ total: 0, today: 0, walkin: 0, appt: 0 });

    // View EMR Modal & History State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]); // OPD History
    const [ipdHistory, setIpdHistory] = useState([]); // IPD History
    const [showModal, setShowModal] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Ref for Printing
    const historyRef = useRef();

    // --- FETCH PATIENTS ---
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            setPatients(res.data);
            calculateStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching patients", err);
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setStats({
            total: data.length,
            today: data.filter(p => p.created_at && p.created_at.startsWith(todayStr)).length,
            walkin: data.filter(p => p.registration_type === 'WALK-IN').length,
            appt: data.filter(p => p.registration_type === 'APPOINTMENT').length
        });
    };

    // --- FILTER LOGIC ---
    const filteredPatients = patients.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = (p.patient_full_name || '').toLowerCase().includes(searchLower) ||
            (p.mobile_number || '').includes(searchTerm) ||
            (p.id || '').toLowerCase().includes(searchLower);

        const matchGender = filterGender ? p.gender === filterGender : true;
        const matchDate = filterDate ? (p.created_at || '').startsWith(filterDate) : true;

        return matchSearch && matchGender && matchDate;
    });

    // --- HANDLER: VIEW FULL EMR HISTORY ---
    const handleView = async (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
        try {
            // Fetch both OPD consultations and IPD admissions concurrently
            const [opdRes, ipdRes] = await Promise.all([
                api.get(`/opd_consultations?patient_id=${patient.id}`),
                api.get(`/ipd_admissions?patient_id=${patient.id}`)
            ]);

            // Sort OPD Newest to Oldest
            const sortedOpdHistory = opdRes.data.sort((a, b) => new Date(b.opd_date) - new Date(a.opd_date));
            setPatientHistory(sortedOpdHistory);

            // Sort IPD Newest to Oldest
            const sortedIpdHistory = ipdRes.data.sort((a, b) => new Date(b.admission_date) - new Date(a.admission_date));
            setIpdHistory(sortedIpdHistory);
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
        setPatientHistory([]);
        setIpdHistory([]); 
    };

    // --- PDF PRINTER: MULTI-PAGE HISTORY ---
    const handlePrintHistory = async () => {
        setIsPrinting(true);
        try {
            const canvas = await html2canvas(historyRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            // First Page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            // Loop for Multi-page (if timeline is very long)
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Patient_EMR_${selectedPatient.id}.pdf`);
        } catch (err) {
            console.error("Print History Error", err);
        } finally {
            setIsPrinting(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-3">

            {/* STATS CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-primary border-4">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-hospital-user text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Total Hospital Patients</h6><h3 className="fw-bold mb-0">{stats.total}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-success border-4">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-user-plus text-success fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Registered Today</h6><h3 className="fw-bold mb-0">{stats.today}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-info border-4">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-users text-info fs-4"></i></div>
                        <div>
                            <h6 className="text-muted mb-0">Visit Types Matrix</h6>
                            <div className="fw-bold fs-5">
                                <span className="text-dark">Walk-in: {stats.walkin}</span> | <span className="text-primary">Appt: {stats.appt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="card-common bg-white p-4 mb-4 shadow-sm border border-light rounded-3">
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light" placeholder="Search Name, UHID, Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control bg-light" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select bg-light" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterGender(''); }}>Clear Filters</button>
                    </div>
                </div>
            </div>

            {/* READ-ONLY MASTER TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm rounded-3 border border-light">
                <div className="bg-light p-3 border-bottom fw-bold text-dark"><i className="fa-solid fa-folder-open me-2 text-success"></i>Patient EMR Directory</div>
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-white text-muted small">
                        <tr>
                            <th className="ps-4">UHID</th>
                            <th>Patient Details</th>
                            <th>Contact Info</th>
                            <th>Type</th>
                            <th>Registered On</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.length > 0 ? filteredPatients.map(p => (
                            <tr key={p.id}>
                                <td className="ps-4 fw-bold text-primary">{p.id}</td>
                                <td>
                                    <div className="fw-bold">{p.patient_full_name}</div>
                                    <small className="text-muted">{p.age} Y | {p.gender} | {p.blood_group || 'N/A'}</small>
                                </td>
                                <td>
                                    <div className="text-dark"><i className="fa-solid fa-phone me-2 text-muted"></i>{p.mobile_number}</div>
                                </td>
                                <td>
                                    <span className={`badge ${p.registration_type === 'WALK-IN' ? 'bg-secondary' : 'bg-primary'}`}>
                                        {p.registration_type || 'WALK-IN'}
                                    </span>
                                </td>
                                <td>
                                    <div className="small text-muted"><i className="fa-regular fa-calendar me-1"></i>{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}</div>
                                </td>
                                <td className="text-center">
                                    {/* Doctor only gets the View History button */}
                                    <button className="btn btn-sm btn-success fw-bold px-3 shadow-sm action-card-hover" onClick={() => handleView(p)} title="View Complete EMR">
                                        <i className="fa-solid fa-eye me-2"></i> View EMR
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-5 text-muted fst-italic">No patients found matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================
                MODAL: VIEW COMPREHENSIVE EMR (FIXED SCROLL)
            ========================================= */}
            {showModal && selectedPatient && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    {/* Added modal-dialog-centered to float nicely, relying entirely on modal-dialog-scrollable */}
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-notes-medical me-2"></i>Patient Electronic Medical Record (EMR)</h5>
                                <button className="btn-close btn-close-white" onClick={closeModal}></button>
                            </div>
                            
                            {/* Removed inline maxHeight and overflow-auto to let Bootstrap handle it */}
                            <div className="modal-body p-4 bg-light">
                                {/* Basic Info Banner */}
                                <div className="card border-0 shadow-sm mb-4 border-start border-4 border-success">
                                    <div className="card-body row align-items-center">
                                        <div className="col-md-6 border-end">
                                            <h4 className="fw-bold text-dark mb-1">{selectedPatient.patient_full_name}</h4>
                                            <p className="mb-0 text-primary fw-bold">{selectedPatient.id}</p>
                                        </div>
                                        <div className="col-md-6 text-muted">
                                            <div className="row">
                                                <div className="col-6"><p className="mb-1"><i className="fa-solid fa-user me-2 text-secondary"></i>{selectedPatient.age} Years, {selectedPatient.gender}</p></div>
                                                <div className="col-6"><p className="mb-1"><i className="fa-solid fa-droplet text-danger me-2"></i>BG: <strong>{selectedPatient.blood_group || 'Unknown'}</strong></p></div>
                                                <div className="col-6"><p className="mb-0"><i className="fa-solid fa-phone me-2 text-secondary"></i>{selectedPatient.mobile_number}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {/* --- OPD History Timeline --- */}
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm h-100 p-4">
                                            <h5 className="fw-bold mb-4 text-primary border-bottom pb-2"><i className="fa-solid fa-stethoscope me-2"></i>OPD Consultations</h5>
                                            {patientHistory.length > 0 ? (
                                                <div className="timeline ps-3 border-start border-primary border-2 ms-2">
                                                    {patientHistory.map((visit, index) => (
                                                        <div className="timeline-item position-relative mb-4" key={index}>
                                                            {/* Timeline dot */}
                                                            <div className="position-absolute bg-primary rounded-circle" style={{ width: '12px', height: '12px', left: '-23px', top: '5px' }}></div>
                                                            <div className="fw-bold text-dark mb-1">{new Date(visit.opd_date).toLocaleDateString('en-GB')} <span className="text-muted fw-normal ms-2">by {visit.doctor_name}</span></div>
                                                            <div className="small text-muted mb-2"><span className="badge bg-light text-dark border me-2">{visit.department}</span></div>

                                                            <div className="bg-light p-3 rounded mt-2 border">
                                                                <p className="mb-1 small"><strong>Complaint:</strong> {visit.chief_complaint || 'N/A'}</p>
                                                                <p className="mb-1 small"><strong>Diagnosis:</strong> <span className="text-danger fw-bold">{visit.diagnosis || 'Pending'}</span></p>

                                                                {visit.medicines && visit.medicines.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-top">
                                                                        <strong className="small text-success">Rx:</strong>
                                                                        <ul className="mb-0 small text-muted ps-3">
                                                                            {visit.medicines.map((m, i) => (
                                                                                <li key={i}>{m.medicine_name} ({m.dosage}) x {m.duration_days}d</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted fst-italic text-center mt-5">No past OPD consultations.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- IPD History Timeline --- */}
                                    <div className="col-lg-6">
                                        <div className="card border-0 shadow-sm h-100 p-4">
                                            <h5 className="fw-bold mb-4 text-danger border-bottom pb-2"><i className="fa-solid fa-bed-pulse me-2"></i>IPD Admissions</h5>
                                            {ipdHistory.length > 0 ? (
                                                <div className="timeline ps-3 border-start border-danger border-2 ms-2">
                                                    {ipdHistory.map((adm, index) => (
                                                        <div className="timeline-item position-relative mb-4" key={index}>
                                                            {/* Timeline dot */}
                                                            <div className="position-absolute bg-danger rounded-circle" style={{ width: '12px', height: '12px', left: '-23px', top: '5px' }}></div>
                                                            <div className="fw-bold text-dark mb-1">
                                                                {new Date(adm.admission_date).toLocaleDateString('en-GB')} 
                                                                {adm.status === 'DISCHARGED' && adm.discharge_details ? ` to ${new Date(adm.discharge_details.discharge_date).toLocaleDateString('en-GB')}` : ' (Active)'}
                                                            </div>
                                                            <div className="small text-muted mb-2">
                                                                <span className="badge bg-light text-dark border me-2">Room: {adm.room_number}</span>
                                                                Consultant: {adm.consultant_doctor_name}
                                                            </div>

                                                            <div className="bg-light p-3 rounded mt-2 border border-danger border-opacity-25">
                                                                <p className="mb-1 small"><strong>Reason:</strong> {adm.discharge_details?.reason_for_admission || 'N/A'}</p>
                                                                {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                                                    <>
                                                                        <p className="mb-1 small"><strong>Final Diagnosis:</strong> <span className="text-danger fw-bold">{adm.discharge_details.clinical_summary || 'N/A'}</span></p>
                                                                        <p className="mb-0 small"><strong>Discharge Cond:</strong> {adm.discharge_details.discharge_condition || 'N/A'}</p>
                                                                    </>
                                                                )}
                                                                {adm.status === 'ADMITTED' && (
                                                                    <span className="badge bg-danger mt-2">Currently Admitted</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted fst-italic text-center mt-5">No past IPD admissions.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer bg-white border-top">
                                <button className="btn btn-secondary" onClick={closeModal}>Close Viewer</button>
                                <button className="btn btn-dark fw-bold" onClick={handlePrintHistory} disabled={isPrinting || (patientHistory.length === 0 && ipdHistory.length === 0)}>
                                    <i className="fa-solid fa-file-pdf me-2"></i> {isPrinting ? 'Generating Report...' : 'Print Full Medical Record'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN LAYOUT FOR PDF GENERATION
            ========================================= */}
            {selectedPatient && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    
                    {/* HIDDEN COMPREHENSIVE EMR LAYOUT (A4 Size scaled) */}
                    <div className="print-offscreen" ref={historyRef} style={{ width: '800px', padding: '40px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* Header */}
                        <div style={{ textAlign: 'center', borderBottom: '3px solid #000', paddingBottom: '15px', marginBottom: '20px' }}>
                            <img src={logo} alt="ArogyaOne Logo" style={{ width: '60px', height: '60px', marginBottom: '10px' }} />
                            <h1 style={{ margin: '0', color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}>ArogyaOne Hospital</h1>
                            <h4 style={{ margin: '5px 0 0 0', color: '#333' }}>Comprehensive Electronic Medical Record (EMR)</h4>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#777' }}>Generated on {new Date().toLocaleString()}</p>
                        </div>

                        {/* Patient Info Table */}
                        <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}><strong>Patient Name:</strong></td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{selectedPatient.patient_full_name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}><strong>UHID:</strong></td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{selectedPatient.id}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}><strong>Age / Gender:</strong></td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedPatient.age} Y / {selectedPatient.gender}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}><strong>Blood Group:</strong></td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedPatient.blood_group || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}><strong>Contact Number:</strong></td>
                                    <td colSpan="3" style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedPatient.mobile_number}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* PRINT: OPD HISTORY */}
                        <h4 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '5px', color: '#3b82f6', marginTop: '30px' }}>OPD Consultation History</h4>
                        {patientHistory.map((visit, idx) => (
                            <div key={idx} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee', pageBreakInside: 'avoid' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong style={{ fontSize: '16px' }}>{new Date(visit.opd_date).toLocaleDateString('en-GB')} - Dr. {visit.doctor_name}</strong>
                                    <span style={{ color: '#666', fontSize: '12px' }}>{visit.department}</span>
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                    <div><strong>Complaint:</strong> {visit.chief_complaint || 'N/A'}</div>
                                    <div><strong>Diagnosis:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{visit.diagnosis || 'N/A'}</span></div>
                                    <div><strong>Clinical Notes:</strong> {visit.clinical_notes || 'N/A'}</div>
                                    
                                    {visit.medicines && visit.medicines.length > 0 && (
                                        <div style={{ marginTop: '5px' }}>
                                            <strong>Prescription:</strong>
                                            <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px' }}>
                                                {visit.medicines.map((m, i) => (
                                                    <li key={i}>{m.medicine_name} - {m.dosage} ({m.duration_days} days)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {patientHistory.length === 0 && <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#777' }}>No OPD history available.</p>}

                        {/* PRINT: IPD HISTORY */}
                        <h4 style={{ borderBottom: '2px solid #dc3545', paddingBottom: '5px', color: '#dc3545', marginTop: '40px' }}>IPD Admission History</h4>
                        {ipdHistory.map((adm, idx) => (
                            <div key={idx} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee', pageBreakInside: 'avoid' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong style={{ fontSize: '16px' }}>
                                        Admitted: {new Date(adm.admission_date).toLocaleDateString('en-GB')}
                                        {adm.status === 'DISCHARGED' && adm.discharge_details ? ` | Discharged: ${new Date(adm.discharge_details.discharge_date).toLocaleDateString('en-GB')}` : ' | Currently Admitted'}
                                    </strong>
                                    <span style={{ color: '#666', fontSize: '12px' }}>Room: {adm.room_number}</span>
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                    <div><strong>Consultant:</strong> {adm.consultant_doctor_name}</div>
                                    <div><strong>Reason for Admission:</strong> {adm.discharge_details?.reason_for_admission || 'N/A'}</div>
                                    {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                        <>
                                            <div><strong>Clinical Summary / Diagnosis:</strong> {adm.discharge_details.clinical_summary || 'N/A'}</div>
                                            <div><strong>Condition at Discharge:</strong> {adm.discharge_details.discharge_condition || 'N/A'}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {ipdHistory.length === 0 && <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#777' }}>No IPD history available.</p>}

                        <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '15px', borderTop: '1px solid #000', fontSize: '11px', color: '#555' }}>
                            *** End of Electronic Medical Record ***<br/>
                            This is a system generated document and valid for informational purposes.
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DoctorAllPatients;