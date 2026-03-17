import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/registration.css'; // <-- Added CSS Import
import jsPDF from 'jspdf';
import logo from '../../../assets/images/logo.png'; // <-- Logo Import
import html2canvas from 'html2canvas';

const AllPatients = () => {
    // --- STATE ---
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Stats
    const [stats, setStats] = useState({ total: 0, today: 0, walkin: 0, appt: 0 });

    // View Modal & History State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPatientId, setEditingPatientId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        patient_full_name: '', mobile_number: '', age: '', gender: 'Male', blood_group: ''
    });

    // Refs for Printing
    const idCardRef = useRef();
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

    // --- HANDLERS: DELETE (CASCADE) ---
    const handleDelete = async (patient) => {
        if (window.confirm(`Are you sure you want to delete ${patient.patient_full_name}?\nThis will also permanently delete all their consultation history.`)) {
            try {
                // 1. Fetch all consultations linked to this patient
                const consRes = await api.get(`/opd_consultations?patient_id=${patient.id}`);
                const consultations = consRes.data;

                // 2. Delete all their consultations (Parallel execution for speed)
                const deletePromises = consultations.map(c => api.delete(`/opd_consultations/${c.id}`));
                await Promise.all(deletePromises);

                // 3. Delete the patient record itself
                await api.delete(`/patients/${patient.id}`);

                // 4. Refresh Table
                fetchPatients();
            } catch (err) {
                console.error("Error during cascade delete", err);
                alert("Failed to delete patient and records.");
            }
        }
    };

    // --- HANDLERS: EDIT PATIENT ---
    const handleEditClick = (patient) => {
        setEditingPatientId(patient.id);
        setEditFormData({
            patient_full_name: patient.patient_full_name || '',
            mobile_number: patient.mobile_number || '',
            age: patient.age || '',
            gender: patient.gender || 'Male',
            blood_group: patient.blood_group || ''
        });
        setShowEditModal(true);
    };

    const handleEditInput = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // PATCH request to only update specific fields
            await api.patch(`/patients/${editingPatientId}`, {
                ...editFormData,
                age: Number(editFormData.age) // ensure age is stored as a number
            });
            setShowEditModal(false);
            setEditingPatientId(null);
            fetchPatients(); // Refresh table
        } catch (err) {
            console.error("Error updating patient", err);
            alert("Failed to update patient details.");
        }
    };

    // --- HANDLERS: VIEW & FETCH HISTORY ---
    const handleView = async (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
        try {
            const res = await api.get(`/opd_consultations?patient_id=${patient.id}`);
            const sortedHistory = res.data.sort((a, b) => new Date(b.opd_date) - new Date(a.opd_date));
            setPatientHistory(sortedHistory);
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPatient(null);
        setPatientHistory([]);
    };

    // --- PDF PRINTER: ID CARD ---
    const handlePrintIDCard = async (patient) => {
        setIsPrinting(true);
        setSelectedPatient(patient);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(idCardRef.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', [85.6, 53.98]);
                pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
                pdf.save(`ID_Card_${patient.id}.pdf`);
            } catch (err) {
                console.error("Print error", err);
            } finally {
                setIsPrinting(false);
                if (!showModal) setSelectedPatient(null);
            }
        }, 300);
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

            // Loop for Multi-page
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Patient_History_${selectedPatient.id}.pdf`);
        } catch (err) {
            console.error("Print History Error", err);
        } finally {
            setIsPrinting(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid">

            {/* STATS CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-users text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Total Patients</h6><h3 className="fw-bold mb-0">{stats.total}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-user-plus text-success fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Registered Today</h6><h3 className="fw-bold mb-0">{stats.today}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-hospital-user text-info fs-4"></i></div>
                        <div>
                            <h6 className="text-muted mb-0">Visit Types</h6>
                            <div className="fw-bold fs-5">
                                <span className="text-dark">Walk-in: {stats.walkin}</span> | <span className="text-primary">Appt: {stats.appt}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="card-common bg-white p-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0" placeholder="Search Name, UHID, Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-light w-100" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterGender(''); }}>Clear Filters</button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">UHID</th>
                            <th>Patient Details</th>
                            <th>Contact Info</th>
                            <th>Type</th>
                            <th>Registered On</th>
                            <th className="text-center">Actions</th>
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
                                    <div className="text-dark"><i className="fa-solid fa-phone me-1 text-muted"></i>{p.mobile_number}</div>
                                </td>
                                <td>
                                    <span className={`badge ${p.registration_type === 'WALK-IN' ? 'bg-secondary' : 'bg-primary'}`}>
                                        {p.registration_type || 'WALK-IN'}
                                    </span>
                                </td>
                                <td>
                                    <div className="small text-muted">{p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}</div>
                                </td>
                                <td className="text-center">
                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleView(p)} title="View History">
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-dark me-2" onClick={() => handlePrintIDCard(p)} title="Print ID Card" disabled={isPrinting}>
                                        <i className="fa-solid fa-print"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEditClick(p)} title="Edit Patient">
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)} title="Delete Patient">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-5 text-muted">No patients found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* =========================================
                MODAL: EDIT PATIENT DETAILS
            ========================================= */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Edit Patient Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Full Name</label>
                                        <input type="text" className="form-control" name="patient_full_name" value={editFormData.patient_full_name} onChange={handleEditInput} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Mobile Number</label>
                                        <input type="tel" className="form-control" name="mobile_number" value={editFormData.mobile_number} onChange={handleEditInput} required maxLength="10" />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Age</label>
                                            <input type="number" className="form-control" name="age" value={editFormData.age} onChange={handleEditInput} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-bold">Gender</label>
                                            <select className="form-select" name="gender" value={editFormData.gender} onChange={handleEditInput} required>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Blood Group</label>
                                        <select className="form-select" name="blood_group" value={editFormData.blood_group} onChange={handleEditInput}>
                                            <option value="">Select</option>
                                            <option value="A+">A+</option><option value="A-">A-</option>
                                            <option value="B+">B+</option><option value="B-">B-</option>
                                            <option value="O+">O+</option><option value="O-">O-</option>
                                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: VIEW PATIENT & HISTORY
            ========================================= */}
            {showModal && selectedPatient && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Patient Profile & History</h5>
                                <button className="btn-close" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body p-4">

                                {/* Basic Info Card */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body row">
                                        <div className="col-md-6">
                                            <h5 className="fw-bold text-primary mb-1">{selectedPatient.patient_full_name}</h5>
                                            <p className="mb-0 text-muted">{selectedPatient.id}</p>
                                        </div>
                                        <div className="col-md-6 text-end text-muted small">
                                            <p className="mb-1"><i className="fa-solid fa-cake-candles me-2"></i>{selectedPatient.age} Years, {selectedPatient.gender}</p>
                                            <p className="mb-1"><i className="fa-solid fa-droplet text-danger me-2"></i>{selectedPatient.blood_group || 'Unknown'}</p>
                                            <p className="mb-0"><i className="fa-solid fa-phone me-2"></i>{selectedPatient.mobile_number}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* History Timeline */}
                                <h6 className="fw-bold mb-3 border-bottom pb-2">Consultation History</h6>
                                {patientHistory.length > 0 ? (
                                    <div className="timeline">
                                        {patientHistory.map((visit, index) => (
                                            <div className="timeline-item" key={index}>
                                                <div className="fw-bold text-dark">{new Date(visit.opd_date).toLocaleDateString('en-GB')} - {visit.doctor_name}</div>
                                                <div className="small text-muted mb-2">Dept: {visit.department} | Slot: {visit.opd_time_slot}</div>

                                                <div className="bg-light p-3 rounded">
                                                    <p className="mb-1"><strong>Complaint:</strong> {visit.chief_complaint || 'N/A'}</p>
                                                    <p className="mb-1"><strong>Diagnosis:</strong> <span className="text-danger fw-bold">{visit.diagnosis || 'Pending'}</span></p>

                                                    {visit.medicines && visit.medicines.length > 0 && (
                                                        <div className="mt-2">
                                                            <strong>Rx:</strong>
                                                            <ul className="mb-0 small">
                                                                {visit.medicines.map((m, i) => (
                                                                    <li key={i}>{m.medicine_name} ({m.dosage}) - {m.duration_days} Days</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted fst-italic">No past consultations found.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                                <button className="btn btn-primary" onClick={handlePrintHistory} disabled={isPrinting || patientHistory.length === 0}>
                                    <i className="fa-solid fa-file-pdf me-2"></i> {isPrinting ? 'Generating...' : 'Print Full History'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN LAYOUTS FOR PDF GENERATION
            ========================================= */}
            {selectedPatient && (
                <>
                    {/* HIDDEN ID CARD LAYOUT (Standard ID Size approx) */}
                    <div className="print-offscreen" ref={idCardRef} style={{ width: '400px', height: '250px', padding: '20px', border: '2px solid #2C80FF', borderRadius: '10px' }}>

                        <div className="d-flex align-items-center justify-content-center mb-3 border-bottom pb-2">
                            <img src={logo} alt="ArogyaOne Logo" className="logo-image me-2" style={{ width: '40px', height: '40px' }} />

                            <div>
                                <h4 className="fw-bold text-success m-0">ArogyaOne Hospital</h4>
                                <small className="text-muted">Patient Identification Card</small>
                            </div>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: '#eee',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                marginRight: '15px',
                                color: '#aaa'
                            }}>
                                {(selectedPatient.patient_full_name || 'U').charAt(0)}
                            </div>

                            <div>
                                <h5 className="fw-bold m-0 text-dark">{selectedPatient.patient_full_name}</h5>
                                <p className="m-0 text-muted">{selectedPatient.id}</p>
                            </div>
                        </div>

                        <div className="row small mt-3">
                            <div className="col-6"><strong>Age/Sex:</strong> {selectedPatient.age} / {selectedPatient.gender}</div>
                            <div className="col-6"><strong>Blood:</strong> <span className="text-danger fw-bold">{selectedPatient.blood_group || 'N/A'}</span></div>
                            <div className="col-12 mt-1"><strong>Phone:</strong> {selectedPatient.mobile_number}</div>
                        </div>

                    </div>

                    {/* HIDDEN COMPREHENSIVE HISTORY LAYOUT (A4 Size scaled) */}
                    <div className="print-offscreen" ref={historyRef} style={{ width: '800px', padding: '40px', background: 'white', color: 'black' }}>
                        <div className="text-center border-bottom pb-3 mb-4">
                            {/* logo here */}
                            <img src={logo} alt="ArogyaOne Logo" className="logo-image mb-2" style={{ width: '50px', height: '50px' }} />
                            <h2>ArogyaOne Hospital</h2>
                            <h4>Comprehensive Patient Medical Record</h4>
                            <p className="text-muted">Generated on {new Date().toLocaleString()}</p>
                        </div>

                        <div className="row border p-3 mb-4 rounded bg-light">
                            <div className="col-6">
                                <p className="mb-1"><strong>Name:</strong> {selectedPatient.patient_full_name}</p>
                                <p className="mb-1"><strong>UHID:</strong> {selectedPatient.id}</p>
                                <p className="mb-0"><strong>Contact:</strong> {selectedPatient.mobile_number}</p>
                            </div>
                            <div className="col-6 text-end">
                                <p className="mb-1"><strong>Age / Gender:</strong> {selectedPatient.age} / {selectedPatient.gender}</p>
                                <p className="mb-1"><strong>Blood Group:</strong> {selectedPatient.blood_group}</p>
                                <p className="mb-0"><strong>Registered On:</strong> {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <h4 className="border-bottom pb-2 mb-3">Consultation History</h4>
                        {patientHistory.map((visit, idx) => (
                            <div key={idx} className="mb-4 pb-3 border-bottom" style={{ pageBreakInside: 'avoid' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <h5 className="fw-bold m-0 text-primary">{new Date(visit.opd_date).toLocaleDateString('en-GB')} - {visit.doctor_name}</h5>
                                    <span className="badge bg-secondary text-dark">{visit.department}</span>
                                </div>

                                <div className="row mt-2">
                                    <div className="col-12 mb-2">
                                        <strong>Chief Complaint:</strong> {visit.chief_complaint || 'N/A'}
                                    </div>
                                    <div className="col-12 mb-2">
                                        <strong>Diagnosis:</strong> {visit.diagnosis || 'N/A'}
                                    </div>
                                    <div className="col-12 mb-2">
                                        <strong>Clinical Notes:</strong> {visit.clinical_notes || 'N/A'}
                                    </div>

                                    {visit.medicines && visit.medicines.length > 0 && (
                                        <div className="col-12 mt-2">
                                            <strong>Prescription:</strong>
                                            <ul className="mb-0">
                                                {visit.medicines.map((m, i) => (
                                                    <li key={i}>{m.medicine_name} - {m.dosage} ({m.duration_days} days)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {patientHistory.length === 0 && <p>No history available.</p>}
                        <div className="text-center mt-5 pt-3 border-top text-muted small">
                            *** End of Medical Report ***
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default AllPatients;