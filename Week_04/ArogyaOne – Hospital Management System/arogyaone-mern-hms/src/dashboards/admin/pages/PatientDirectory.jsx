import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/registration.css'; 
import jsPDF from 'jspdf';
import logo from '../../../assets/images/logo.png'; 
import html2canvas from 'html2canvas';

const PatientDirectory = () => {
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
    const [patientHistory, setPatientHistory] = useState([]); // OPD History
    const [ipdHistory, setIpdHistory] = useState([]); // IPD History
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
            // Sort newest first
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setPatients(sorted);
            calculateStats(sorted);
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

    // --- ADMIN SUPERPOWER: EXPORT TO CSV ---
    const exportToCSV = () => {
        const headers = ["UHID", "Full Name", "Age", "Gender", "Blood Group", "Mobile Number", "Registration Type", "Registered Date"];
        const csvRows = filteredPatients.map(p => {
            const date = p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : 'N/A';
            return `"${p.id}","${p.patient_full_name}","${p.age}","${p.gender}","${p.blood_group || 'N/A'}","${p.mobile_number}","${p.registration_type}","${date}"`;
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ArogyaOne_Patient_Directory_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // --- HANDLERS: DELETE (CASCADE) ---
    const handleDelete = async (patient) => {
        if (window.confirm(`⚠️ ADMIN WARNING ⚠️\n\nAre you sure you want to permanently delete ${patient.patient_full_name}?\nThis will purge all their clinical history from the system. This cannot be undone.`)) {
            try {
                // 1. Fetch all consultations linked to this patient
                const consRes = await api.get(`/opd_consultations?patient_id=${patient.id}`);
                const consultations = consRes.data;

                // 2. Delete all their consultations
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
            await api.patch(`/patients/${editingPatientId}`, {
                ...editFormData,
                age: Number(editFormData.age)
            });
            setShowEditModal(false);
            setEditingPatientId(null);
            fetchPatients(); 
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
            const [opdRes, ipdRes] = await Promise.all([
                api.get(`/opd_consultations?patient_id=${patient.id}`),
                api.get(`/ipd_admissions?patient_id=${patient.id}`)
            ]);

            const sortedOpdHistory = opdRes.data.sort((a, b) => new Date(b.opd_date) - new Date(a.opd_date));
            setPatientHistory(sortedOpdHistory);

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

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Patient_Audit_History_${selectedPatient.id}.pdf`);
        } catch (err) {
            console.error("Print History Error", err);
        } finally {
            setIsPrinting(false);
        }
    };

    if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>;

    return (
        <div className="container-fluid py-4">
            
            {/* ADMIN HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-hospital-user text-primary me-2"></i> Master Patient Directory
                    </h2>
                    <p className="text-muted mb-0 mt-1">Admin oversight of all registered patients, historical records, and data export.</p>
                </div>
                <button className="btn btn-dark fw-bold rounded-pill px-4 shadow-sm" onClick={exportToCSV}>
                    <i className="fa-solid fa-file-csv me-2"></i> Export to CSV
                </button>
            </div>

            {/* STATS CARDS */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-primary border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Total Patients in System</h6>
                        <h3 className="fw-bold mb-0 text-dark">{stats.total}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-success border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Registered Today</h6>
                        <h3 className="fw-bold mb-0 text-success">{stats.today}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-secondary border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Walk-in Registrations</h6>
                        <h3 className="fw-bold mb-0 text-dark">{stats.walkin}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-info border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Appt. Registrations</h6>
                        <h3 className="fw-bold mb-0 text-dark">{stats.appt}</h3>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-3 mb-4">
                <div className="row g-3">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light rounded-end-pill" placeholder="Search Master DB by Name, UHID, Phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control rounded-pill bg-light" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <select className="form-select rounded-pill bg-light" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-outline-secondary rounded-pill w-100 fw-bold" onClick={() => { setSearchTerm(''); setFilterDate(''); setFilterGender(''); }}>Clear Filters</button>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">UHID</th>
                                <th>Patient Details</th>
                                <th>Contact Info</th>
                                <th>Reg. Type</th>
                                <th>Registered On</th>
                                <th className="text-center pe-4">Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                <tr key={p.id}>
                                    <td className="ps-4 fw-bold text-primary">{p.id}</td>
                                    <td>
                                        <div className="fw-bold text-dark">{p.patient_full_name}</div>
                                        <small className="text-muted">{p.age} Y | {p.gender} | {p.blood_group || 'N/A'}</small>
                                    </td>
                                    <td>
                                        <div className="text-dark fw-bold"><i className="fa-solid fa-phone me-1 text-muted"></i>{p.mobile_number}</div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill ${p.registration_type === 'WALK-IN' ? 'bg-secondary' : 'bg-primary'}`}>
                                            {p.registration_type || 'WALK-IN'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : 'N/A'}</div>
                                    </td>
                                    <td className="text-center pe-4">
                                        <button className="btn btn-sm btn-outline-primary rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => handleView(p)} title="Audit Patient History">
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-dark rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => handlePrintIDCard(p)} title="Reprint ID Card" disabled={isPrinting}>
                                            <i className="fa-solid fa-print"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-info rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => handleEditClick(p)} title="Edit Master Data">
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDelete(p)} title="Cascade Delete Patient">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">No patients found in the master database.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: EDIT PATIENT DETAILS
            ========================================= */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-user-pen text-primary me-2"></i> Edit Master Data</h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Full Name</label>
                                        <input type="text" className="form-control rounded-3 border-secondary" name="patient_full_name" value={editFormData.patient_full_name} onChange={handleEditInput} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Mobile Number</label>
                                        <input type="tel" className="form-control rounded-3 border-secondary" name="mobile_number" value={editFormData.mobile_number} onChange={handleEditInput} required maxLength="10" />
                                    </div>
                                    <div className="row mb-3 g-3">
                                        <div className="col-6">
                                            <label className="form-label fw-bold small text-muted">Age</label>
                                            <input type="number" className="form-control rounded-3 border-secondary" name="age" value={editFormData.age} onChange={handleEditInput} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label fw-bold small text-muted">Gender</label>
                                            <select className="form-select rounded-3 border-secondary" name="gender" value={editFormData.gender} onChange={handleEditInput} required>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label fw-bold small text-muted">Blood Group</label>
                                        <select className="form-select rounded-3 border-secondary" name="blood_group" value={editFormData.blood_group} onChange={handleEditInput}>
                                            <option value="">Select</option>
                                            <option value="A+">A+</option><option value="A-">A-</option>
                                            <option value="B+">B+</option><option value="B-">B-</option>
                                            <option value="O+">O+</option><option value="O-">O-</option>
                                            <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: VIEW PATIENT & HISTORY (AUDIT VIEW)
            ========================================= */}
            {showModal && selectedPatient && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-dark text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-file-medical me-2"></i> Patient Master Audit Log</h5>
                                <button className="btn-close btn-close-white" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body p-4 bg-light">

                                {/* Basic Info Card */}
                                <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <h4 className="fw-bold text-primary mb-1">{selectedPatient.patient_full_name}</h4>
                                            <p className="mb-0 text-muted fw-bold">UHID: {selectedPatient.id}</p>
                                        </div>
                                        <div className="col-md-6 text-md-end">
                                            <span className="badge bg-secondary mb-2 rounded-pill px-3 py-2">Reg: {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleString() : 'N/A'}</span>
                                            <div className="text-dark small fw-bold">
                                                <span className="me-3"><i className="fa-solid fa-cake-candles text-warning me-1"></i>{selectedPatient.age} Y / {selectedPatient.gender}</span>
                                                <span className="me-3"><i className="fa-solid fa-droplet text-danger me-1"></i>{selectedPatient.blood_group || 'Unknown'}</span>
                                                <span><i className="fa-solid fa-phone text-success me-1"></i>{selectedPatient.mobile_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {/* --- OPD History Timeline --- */}
                                    <div className="col-lg-6">
                                        <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                                            <h6 className="fw-bold mb-4 text-dark border-bottom pb-2"><i className="fa-solid fa-stethoscope text-primary me-2"></i> OPD Consultations ({patientHistory.length})</h6>
                                            {patientHistory.length > 0 ? (
                                                <div className="timeline-container pe-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                    {patientHistory.map((visit, index) => (
                                                        <div className="border-start border-primary border-3 ps-3 mb-4 position-relative" key={index}>
                                                            <div className="position-absolute bg-primary rounded-circle" style={{ width: '10px', height: '10px', left: '-6.5px', top: '5px' }}></div>
                                                            <div className="fw-bold text-dark fs-6">{new Date(visit.opd_date).toLocaleDateString('en-GB')}</div>
                                                            <div className="small text-muted mb-2 fw-bold">{visit.doctor_name} <span className="badge bg-light text-dark border ms-2">{visit.department}</span></div>

                                                            <div className="bg-light p-3 rounded-3 border">
                                                                <p className="mb-1 small"><strong>Complaint:</strong> {visit.chief_complaint || 'N/A'}</p>
                                                                <p className="mb-1 small"><strong>Diagnosis:</strong> <span className="text-danger fw-bold">{visit.diagnosis || 'Pending'}</span></p>

                                                                {visit.medicines && visit.medicines.length > 0 && (
                                                                    <div className="mt-2 pt-2 border-top">
                                                                        <strong className="small text-success">Rx Prescribed:</strong>
                                                                        <ul className="mb-0 small text-muted ps-3 mt-1">
                                                                            {visit.medicines.map((m, i) => (
                                                                                <li key={i}>{m.medicine_name} ({m.dosage})</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted p-5 bg-light rounded-4">No OPD history recorded.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* --- IPD History Timeline --- */}
                                    <div className="col-lg-6">
                                        <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                                            <h6 className="fw-bold mb-4 text-dark border-bottom pb-2"><i className="fa-solid fa-bed text-success me-2"></i> IPD Admissions ({ipdHistory.length})</h6>
                                            {ipdHistory.length > 0 ? (
                                                <div className="timeline-container pe-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                    {ipdHistory.map((adm, index) => (
                                                        <div className="border-start border-success border-3 ps-3 mb-4 position-relative" key={index}>
                                                            <div className="position-absolute bg-success rounded-circle" style={{ width: '10px', height: '10px', left: '-6.5px', top: '5px' }}></div>
                                                            <div className="fw-bold text-dark fs-6">
                                                                Adm: {new Date(adm.admission_date).toLocaleDateString('en-GB')} 
                                                                {adm.status === 'DISCHARGED' && adm.discharge_details ? ` -> Dis: ${new Date(adm.discharge_details.discharge_date).toLocaleDateString('en-GB')}` : ' (Active)'}
                                                            </div>
                                                            <div className="small text-muted mb-2 fw-bold">
                                                                {adm.consultant_doctor_name} 
                                                                <span className={`badge ms-2 ${adm.status === 'ADMITTED' ? 'bg-primary' : 'bg-secondary'}`}>{adm.status}</span>
                                                            </div>

                                                            <div className="bg-light p-3 rounded-3 border">
                                                                <p className="mb-1 small"><strong>Room:</strong> {adm.room_number}</p>
                                                                <p className="mb-1 small"><strong>Reason:</strong> {adm.discharge_details?.reason_for_admission || 'N/A'}</p>
                                                                
                                                                {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                                                    <div className="mt-2 pt-2 border-top">
                                                                        <p className="mb-1 small"><strong>Final Summary:</strong> <span className="text-dark fw-bold">{adm.discharge_details.clinical_summary || 'N/A'}</span></p>
                                                                        <p className="mb-0 small text-success fw-bold">Discharged: {adm.discharge_details.discharge_condition || 'N/A'}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-muted p-5 bg-light rounded-4">No IPD history recorded.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer bg-white border-top p-3 rounded-bottom-4">
                                <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={closeModal}>Close Window</button>
                                <button className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" onClick={handlePrintHistory} disabled={isPrinting || (patientHistory.length === 0 && ipdHistory.length === 0)}>
                                    <i className="fa-solid fa-file-pdf me-2"></i> {isPrinting ? 'Generating Audit PDF...' : 'Print Full Medical Audit'}
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
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>

                    {/* 1. ADMISSION STICKER SHEET */}
                    <div ref={idCardRef} style={{ width: '400px', height: '250px', padding: '20px', border: '2px solid #2C80FF', borderRadius: '10px', background: 'white' }}>
                        <div className="d-flex align-items-center justify-content-center mb-3 border-bottom pb-2">
                            <img src={logo} alt="ArogyaOne Logo" className="logo-image me-2" style={{ width: '40px', height: '40px' }} />
                            <div>
                                <h4 className="fw-bold text-success m-0">ArogyaOne Hospital</h4>
                                <small className="text-muted">Master Patient ID</small>
                            </div>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                            <div style={{
                                width: '60px', height: '60px', background: '#eee', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '24px', fontWeight: 'bold', marginRight: '15px', color: '#aaa'
                            }}>
                                {(selectedPatient.patient_full_name || 'U').charAt(0)}
                            </div>
                            <div>
                                <h5 className="fw-bold m-0 text-dark">{selectedPatient.patient_full_name}</h5>
                                <p className="m-0 text-muted">{selectedPatient.id}</p>
                            </div>
                        </div>

                        <div className="row small mt-3 text-dark">
                            <div className="col-6"><strong>Age/Sex:</strong> {selectedPatient.age} / {selectedPatient.gender}</div>
                            <div className="col-6"><strong>Blood:</strong> <span className="text-danger fw-bold">{selectedPatient.blood_group || 'N/A'}</span></div>
                            <div className="col-12 mt-1"><strong>Phone:</strong> {selectedPatient.mobile_number}</div>
                        </div>
                    </div>

                    {/* 2. COMPREHENSIVE HISTORY LAYOUT (A4 Size scaled) */}
                    <div className="print-offscreen" ref={historyRef} style={{ width: '800px', padding: '40px', background: 'white', color: 'black' }}>
                        <div className="text-center border-bottom pb-3 mb-4">
                            <img src={logo} alt="ArogyaOne Logo" className="logo-image mb-2" style={{ width: '50px', height: '50px' }} />
                            <h2>ArogyaOne Hospital</h2>
                            <h4>Comprehensive Master Medical Audit</h4>
                            <p className="text-muted">Generated by Admin on {new Date().toLocaleString()}</p>
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

                        {/* PRINT: OPD HISTORY */}
                        <h4 className="border-bottom pb-2 mb-3">OPD Consultation History</h4>
                        {patientHistory.map((visit, idx) => (
                            <div key={idx} className="mb-4 pb-3 border-bottom" style={{ pageBreakInside: 'avoid' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <h5 className="fw-bold m-0 text-primary">{new Date(visit.opd_date).toLocaleDateString('en-GB')} - {visit.doctor_name}</h5>
                                    <span className="badge bg-secondary text-dark">{visit.department}</span>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-12 mb-2"><strong>Chief Complaint:</strong> {visit.chief_complaint || 'N/A'}</div>
                                    <div className="col-12 mb-2"><strong>Diagnosis:</strong> {visit.diagnosis || 'N/A'}</div>
                                    <div className="col-12 mb-2"><strong>Clinical Notes:</strong> {visit.clinical_notes || 'N/A'}</div>
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
                        {patientHistory.length === 0 && <p className="text-muted">No OPD history available.</p>}

                        {/* PRINT: IPD HISTORY */}
                        <h4 className="border-bottom pb-2 mb-3 mt-4 text-primary">IPD Admission History</h4>
                        {ipdHistory.map((adm, idx) => (
                            <div key={idx} className="mb-4 pb-3 border-bottom" style={{ pageBreakInside: 'avoid' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <h5 className="fw-bold m-0 text-dark">
                                        Adm: {new Date(adm.admission_date).toLocaleDateString('en-GB')}
                                        {adm.status === 'DISCHARGED' && adm.discharge_details ? ` | Dis: ${new Date(adm.discharge_details.discharge_date).toLocaleDateString('en-GB')}` : ' | Currently Admitted'}
                                    </h5>
                                    <span className="badge bg-secondary text-dark">Room: {adm.room_number}</span>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-12 mb-2"><strong>Consultant Doctor:</strong> {adm.consultant_doctor_name}</div>
                                    <div className="col-12 mb-2"><strong>Reason for Admission:</strong> {adm.discharge_details?.reason_for_admission || 'N/A'}</div>
                                    {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                        <>
                                            <div className="col-12 mb-2"><strong>Clinical Summary / Diagnosis:</strong> {adm.discharge_details.clinical_summary || 'N/A'}</div>
                                            <div className="col-12 mb-2"><strong>Condition at Discharge:</strong> {adm.discharge_details.discharge_condition || 'N/A'}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {ipdHistory.length === 0 && <p className="text-muted">No IPD history available.</p>}

                        <div className="text-center mt-5 pt-3 border-top text-muted small">
                            *** End of Master Medical Audit Report ***
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PatientDirectory;