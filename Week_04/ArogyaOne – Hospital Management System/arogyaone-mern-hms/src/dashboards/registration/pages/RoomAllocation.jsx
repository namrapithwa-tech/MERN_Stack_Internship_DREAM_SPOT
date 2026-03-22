// src/dashboards/registration/pages/RoomAllocation.jsx

import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/registration.css';
import logo from '../../../assets/images/logo.png';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const RoomAllocation = () => {
    // --- DATA STATE ---
    const [admissions, setAdmissions] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ admitted: 0, dischargedToday: 0, availableRooms: 0 });

    // --- FORM STATES ---
    const initialAdmState = {
        patient_id: '', patient_name: '', mobile_number: '', blood_group: '',
        consultant_doctor_name: '', room_id: '', document_type: 'Aadhar', document_number: '',
        relative_name: '', relationship: 'Father'
    };
    const [admForm, setAdmForm] = useState(initialAdmState);
    const [searchQuery, setSearchQuery] = useState('');
    const [patientFound, setPatientFound] = useState(null);

    // --- MODAL & ACTION STATES ---
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    
    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Discharge Modal
    const [showDischargeModal, setShowDischargeModal] = useState(false);
    const [dischargeForm, setDischargeForm] = useState({
        discharge_date: new Date().toISOString().split('T')[0],
        discharge_time: new Date().toTimeString().slice(0, 5),
        reason_for_admission: '', mode_of_admission: 'Planned',
        clinical_summary: '', treatment_provided: '', discharge_condition: 'Stable',
        prescriptions: [{ medicine_name: '', dosage: '', duration_days: '' }],
        follow_up_instructions: ''
    });

    // Print Preview State
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printType, setPrintType] = useState(null); 
    const [isPrinting, setIsPrinting] = useState(false);

    // --- REFS FOR PRINTING ---
    const stickerRef = useRef();
    const consentRef = useRef();
    const dischargeSummaryRef = useRef();

    // --- FETCH INITIAL DATA ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [admRes, roomsRes, docRes, patRes] = await Promise.all([
                api.get('/ipd_admissions'),
                api.get('/rooms'),
                api.get('/doctors'),
                api.get('/patients')
            ]);

            const sortedAdmissions = admRes.data.sort((a, b) => new Date(b.admission_date) - new Date(a.admission_date));
            setAdmissions(sortedAdmissions);
            setRooms(roomsRes.data);
            setDoctors(docRes.data);
            setPatients(patRes.data);
            calculateStats(sortedAdmissions, roomsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data", error);
            setLoading(false);
        }
    };

    const calculateStats = (admData, roomData) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setStats({
            admitted: admData.filter(a => a.status === 'ADMITTED').length,
            dischargedToday: admData.filter(a => a.status === 'DISCHARGED' && a.discharge_details?.discharge_date === todayStr).length,
            availableRooms: roomData.filter(r => r.is_available).length
        });
    };

    // --- NEW ADMISSION LOGIC ---
    const handlePatientSearch = () => {
        const p = patients.find(pat => pat.id === searchQuery || pat.mobile_number === searchQuery);
        if (p) {
            setPatientFound(p);
            setAdmForm({ ...admForm, patient_id: p.id, patient_name: p.patient_full_name, mobile_number: p.mobile_number, blood_group: p.blood_group || 'Unknown' });
        } else {
            alert("Patient not found!");
            setPatientFound(null);
        }
    };

    const handleAdmSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedRoom = rooms.find(r => r.id === admForm.room_id);
            const payload = {
                id: `IPD-${new Date().getFullYear()}-${Date.now()}`,
                ...admForm,
                room_number: selectedRoom?.room_number,
                admission_date: new Date().toISOString(),
                status: 'ADMITTED',
                billing_status: 'OPEN',
                discharge_details: null
            };

            await api.post('/ipd_admissions', payload);
            await api.patch(`/rooms/${admForm.room_id}`, { is_available: false, allocated_patient_id: payload.patient_id });

            alert("Admission Successful!");
            setSelectedAdmission(payload);
            setPrintType('ADMISSION');
            setShowPrintModal(true);

            setAdmForm(initialAdmState);
            setSearchQuery('');
            setPatientFound(null);
            fetchData();

        } catch (error) {
            console.error("Admission failed", error);
            alert("Failed to admit patient.");
        }
    };

    // --- DISCHARGE LOGIC ---
    const handleAddPrescriptionRow = () => {
        setDischargeForm({ ...dischargeForm, prescriptions: [...dischargeForm.prescriptions, { medicine_name: '', dosage: '', duration_days: '' }] });
    };

    const handlePrescriptionChange = (index, field, value) => {
        const updatedMeds = [...dischargeForm.prescriptions];
        updatedMeds[index][field] = value;
        setDischargeForm({ ...dischargeForm, prescriptions: updatedMeds });
    };

    const handleDischargeSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedAdm = {
                status: 'DISCHARGED',
                billing_status: 'PENDING_FINAL_BILL',
                discharge_details: { ...dischargeForm }
            };
            await api.patch(`/ipd_admissions/${selectedAdmission.id}`, updatedAdm);
            await api.patch(`/rooms/${selectedAdmission.room_id}`, { is_available: true, allocated_patient_id: null });

            alert("Patient Discharged Successfully! Sent to Billing.");
            const finalRecord = { ...selectedAdmission, ...updatedAdm };
            setSelectedAdmission(finalRecord);
            setShowDischargeModal(false);
            setPrintType('DISCHARGE');
            setShowPrintModal(true);
            fetchData();
        } catch (error) {
            console.error("Discharge failed", error);
            alert("Failed to discharge patient.");
        }
    };

    // --- EDIT & DELETE LOGIC ---
    const handleDelete = async (adm) => {
        if (window.confirm("Are you sure you want to delete this admission? This will free the room.")) {
            try {
                await api.delete(`/ipd_admissions/${adm.id}`);
                if (adm.status === 'ADMITTED') {
                    await api.patch(`/rooms/${adm.room_id}`, { is_available: true, allocated_patient_id: null });
                }
                fetchData();
            } catch (error) {
                alert("Failed to delete admission.");
            }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/ipd_admissions/${selectedAdmission.id}`, editForm);
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            alert("Failed to update details.");
        }
    };

    // --- PRINTING UTILITIES ---
    const generatePDF = async (ref, title, format = 'a4', orientation = 'p') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(ref.current, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF(orientation, 'mm', format);
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
                pdf.save(`${title}.pdf`);
            } catch (error) {
                console.error("Print Error", error);
            } finally {
                setIsPrinting(false);
            }
        }, 500);
    };

    // Helper for safe dates
    const safeDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid">

            {/* --- STATS --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-primary border-4">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-bed text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Admitted Patients</h6><h3 className="fw-bold mb-0">{stats.admitted}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-success border-4">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-door-open text-success fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Available Rooms</h6><h3 className="fw-bold mb-0">{stats.availableRooms}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-warning border-4">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-person-walking-arrow-right text-warning fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Discharged Today</h6><h3 className="fw-bold mb-0">{stats.dischargedToday}</h3></div>
                    </div>
                </div>
            </div>

            {/* --- NEW ADMISSION FORM (TWO COLUMN) --- */}
            <div className="reg-container mb-4">
                <div className="section-title"><i className="fa-solid fa-hospital-user me-2"></i>New IPD Admission</div>

                {/* Search Row */}
                <div className="row g-3 mb-4 align-items-end border-bottom pb-4">
                    <div className="col-md-6">
                        <label className="reg-label">Search Patient (UHID / Mobile)</label>
                        <div className="input-group">
                            <input type="text" className="form-control" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter ID or Phone..." />
                            <button className="btn btn-primary" type="button" onClick={handlePatientSearch}>Search</button>
                        </div>
                    </div>
                    {patientFound && (
                        <div className="col-md-6">
                            <div className="alert alert-success m-0 py-2">
                                <i className="fa-solid fa-check-circle me-2"></i>
                                Patient Found: <strong>{patientFound.patient_full_name}</strong> ({patientFound.age}Y / {patientFound.gender})
                            </div>
                        </div>
                    )}
                </div>

                {/* Admission Form */}
                <form onSubmit={handleAdmSubmit}>
                    <div className="row g-4">
                        {/* Column 1 */}
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="reg-label">Consultant Doctor <span className="text-danger">*</span></label>
                                <select className="reg-select" value={admForm.consultant_doctor_name} required onChange={(e) => setAdmForm({ ...admForm, consultant_doctor_name: e.target.value })}>
                                    <option value="">-- Select --</option>
                                    {doctors.map(d => <option key={d.id} value={d.full_name}>{d.full_name} ({d.department})</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="reg-label">Room / Bed Allocation <span className="text-danger">*</span></label>
                                <select className="reg-select" value={admForm.room_id} required onChange={(e) => setAdmForm({ ...admForm, room_id: e.target.value })}>
                                    <option value="">-- Select Available Room --</option>
                                    {rooms.filter(r => r.is_available).map(r => (
                                        <option key={r.id} value={r.id}>{r.room_number} ({r.room_category}) - ₹{r.room_rent_per_day}/day</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Column 2 */}
                        <div className="col-md-6">
                            <div className="row mb-3">
                                <div className="col-4">
                                    <label className="reg-label">ID Type <span className="text-danger">*</span></label>
                                    <select className="reg-select" value={admForm.document_type} onChange={(e) => setAdmForm({ ...admForm, document_type: e.target.value })}>
                                        <option value="Aadhar">Aadhar</option><option value="PAN">PAN</option><option value="PMJAY">PMJAY</option>
                                    </select>
                                </div>
                                <div className="col-8">
                                    <label className="reg-label">ID Number <span className="text-danger">*</span></label>
                                    <input type="text" className="reg-input" value={admForm.document_number} required onChange={(e) => setAdmForm({ ...admForm, document_number: e.target.value })} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-8">
                                    <label className="reg-label">Relative / Guardian Name <span className="text-danger">*</span></label>
                                    <input type="text" className="reg-input" value={admForm.relative_name} required onChange={(e) => setAdmForm({ ...admForm, relative_name: e.target.value })} />
                                </div>
                                <div className="col-4">
                                    <label className="reg-label">Relationship <span className="text-danger">*</span></label>
                                    <select className="reg-select" value={admForm.relationship} onChange={(e) => setAdmForm({ ...admForm, relationship: e.target.value })}>
                                        <option value="Father">Father</option><option value="Mother">Mother</option>
                                        <option value="Spouse">Spouse</option><option value="Child">Child</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 text-end mt-3">
                            <button type="submit" className="btn btn-primary fw-bold px-4" disabled={!patientFound}>
                                <i className="fa-solid fa-bed-pulse me-2"></i> Admit Patient
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* --- IPD MASTER TABLE --- */}
            <div className="card-common bg-white p-0 overflow-hidden">
                <div className="bg-light p-3 border-bottom fw-bold"><i className="fa-solid fa-list me-2"></i>Master IPD Admissions List</div>
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">IPD ID / UHID</th>
                            <th>Patient Details</th>
                            <th>Room / Consultant</th>
                            <th>Status</th>
                            <th>Dates</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admissions.map(adm => (
                            <tr key={adm.id}>
                                <td className="ps-4">
                                    <div className="fw-bold text-primary">{adm.id}</div>
                                    <div className="small text-muted">{adm.patient_id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold">{adm.patient_name}</div>
                                    <div className="small text-muted"><i className="fa-solid fa-phone me-1"></i>{adm.mobile_number}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark"><i className="fa-solid fa-bed me-1 text-muted"></i>{adm.room_number}</div>
                                    <div className="small text-muted">{adm.consultant_doctor_name}</div>
                                </td>
                                <td>
                                    <span className={`badge ${adm.status === 'ADMITTED' ? 'bg-success' : 'bg-secondary'}`}>{adm.status}</span>
                                    {adm.billing_status === 'PENDING_FINAL_BILL' && <div className="small text-warning fw-bold mt-1">Pending Bill</div>}
                                    {adm.billing_status === 'CLOSED' && <div className="small text-success fw-bold mt-1">Bill Cleared</div>}
                                </td>
                                <td>
                                    <div className="small"><strong>Adm:</strong> {safeDate(adm.admission_date)}</div>
                                    {/* FIX: Check discharge_details safely */}
                                    {adm.status === 'DISCHARGED' && (
                                        <div className="small text-danger">
                                            <strong>Dis:</strong> {adm.discharge_details?.discharge_date ? safeDate(adm.discharge_details.discharge_date) : safeDate(adm.discharge_date)}
                                        </div>
                                    )}
                                </td>
                                <td className="text-center">
                                    {/* Print Admission Docs (Always visible) */}
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2 mb-1"
                                        onClick={() => { setSelectedAdmission(adm); setPrintType('ADMISSION'); setShowPrintModal(true); }}
                                        title="Print Admission Docs"
                                    >
                                        <i className="fa-solid fa-print"></i>
                                    </button>

                                    {adm.status === 'ADMITTED' && (
                                        <>
                                            {/* Discharge Button */}
                                            <button
                                                className="btn btn-sm btn-outline-success me-2 mb-1"
                                                onClick={() => { setSelectedAdmission(adm); setShowDischargeModal(true); }}
                                                title="Discharge Patient"
                                            >
                                                <i className="fa-solid fa-person-walking-arrow-right"></i>
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                                className="btn btn-sm btn-outline-info me-2 mb-1"
                                                onClick={() => { setSelectedAdmission(adm); setEditForm(adm); setShowEditModal(true); }}
                                                title="Edit Details"
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                className="btn btn-sm btn-outline-danger mb-1"
                                                onClick={() => handleDelete(adm)}
                                                title="Delete Record"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </>
                                    )}

                                    {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                        /* Print Discharge Summary */
                                        <button
                                            className="btn btn-sm btn-outline-dark me-2 mb-1"
                                            onClick={() => { setSelectedAdmission(adm); setPrintType('DISCHARGE'); setShowPrintModal(true); }}
                                            title="Print Discharge Summary"
                                        >
                                            <i className="fa-solid fa-file-medical"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {admissions.length === 0 && <tr><td colSpan="6" className="text-center p-5 text-muted">No records found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* =========================================
                MODAL: NABH DISCHARGE FORM
            ========================================= */}
            {showDischargeModal && selectedAdmission && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold text-success"><i className="fa-solid fa-file-medical me-2"></i>Clinical Discharge Summary (Sent to Billing)</h5>
                                <button className="btn-close" onClick={() => setShowDischargeModal(false)}></button>
                            </div>
                            <form onSubmit={handleDischargeSubmit}>
                                <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                                    <div className="row g-3 border-bottom pb-3 mb-3 bg-light rounded p-2">
                                        <div className="col-md-4"><strong>Patient:</strong> {selectedAdmission.patient_name} ({selectedAdmission.patient_id})</div>
                                        <div className="col-md-4"><strong>Room:</strong> {selectedAdmission.room_number}</div>
                                        <div className="col-md-4"><strong>Admitted:</strong> {new Date(selectedAdmission.admission_date).toLocaleString()}</div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Discharge Date</label>
                                            <input type="date" className="form-control" value={dischargeForm.discharge_date} required onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_date: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Discharge Time</label>
                                            <input type="time" className="form-control" value={dischargeForm.discharge_time} required onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_time: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Mode of Admission</label>
                                            <select className="form-select" value={dischargeForm.mode_of_admission} onChange={(e) => setDischargeForm({ ...dischargeForm, mode_of_admission: e.target.value })}>
                                                <option>Planned</option><option>Emergency</option><option>Transfer</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Discharge Condition</label>
                                            <select className="form-select" value={dischargeForm.discharge_condition} onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_condition: e.target.value })}>
                                                <option>Stable</option><option>Referred</option><option>LAMA</option><option>Deceased</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Reason for Admission / Chief Complaint</label>
                                        <input type="text" className="form-control" value={dischargeForm.reason_for_admission} required onChange={(e) => setDischargeForm({ ...dischargeForm, reason_for_admission: e.target.value })} />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Clinical Summary & Final Diagnosis</label>
                                        <textarea className="form-control" rows="3" value={dischargeForm.clinical_summary} required onChange={(e) => setDischargeForm({ ...dischargeForm, clinical_summary: e.target.value })} placeholder="Include diagnosis and major events..."></textarea>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Treatment Provided</label>
                                        <textarea className="form-control" rows="3" value={dischargeForm.treatment_provided} required onChange={(e) => setDischargeForm({ ...dischargeForm, treatment_provided: e.target.value })} placeholder="Surgeries, major procedures, diet..."></textarea>
                                    </div>

                                    {/* Prescriptions Section */}
                                    <div className="mb-3 border p-3 rounded">
                                        <div className="d-flex justify-content-between mb-2">
                                            <label className="form-label fw-bold mb-0">Discharge Medications</label>
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddPrescriptionRow}>+ Add Med</button>
                                        </div>
                                        {dischargeForm.prescriptions.map((med, idx) => (
                                            <div className="row g-2 mb-2" key={idx}>
                                                <div className="col-5"><input type="text" className="form-control form-control-sm" placeholder="Medicine Name" value={med.medicine_name} onChange={(e) => handlePrescriptionChange(idx, 'medicine_name', e.target.value)} required /></div>
                                                <div className="col-4"><input type="text" className="form-control form-control-sm" placeholder="Dosage (e.g., 1-0-1)" value={med.dosage} onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)} required /></div>
                                                <div className="col-3"><input type="text" className="form-control form-control-sm" placeholder="Days" value={med.duration_days} onChange={(e) => handlePrescriptionChange(idx, 'duration_days', e.target.value)} required /></div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Follow-Up Instructions</label>
                                        <input type="text" className="form-control" value={dischargeForm.follow_up_instructions} required onChange={(e) => setDischargeForm({ ...dischargeForm, follow_up_instructions: e.target.value })} placeholder="e.g., Visit OPD after 5 days" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDischargeModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success fw-bold"><i className="fa-solid fa-check me-2"></i> Clinical Discharge & Send to Billing</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: EDIT ADMISSION
            ========================================= */}
            {showEditModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Edit Details</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-3 overflow-auto" style={{ maxHeight: '70vh' }}>
                                    <div className="mb-2"><label className="form-label">ID Type</label><input type="text" className="form-control" value={editForm.document_type} onChange={(e) => setEditForm({ ...editForm, document_type: e.target.value })} /></div>
                                    <div className="mb-2"><label className="form-label">ID Number</label><input type="text" className="form-control" value={editForm.document_number} onChange={(e) => setEditForm({ ...editForm, document_number: e.target.value })} /></div>
                                    <div className="mb-2"><label className="form-label">Relative Name</label><input type="text" className="form-control" value={editForm.relative_name} onChange={(e) => setEditForm({ ...editForm, relative_name: e.target.value })} /></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">Save Updates</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: PRINT PREVIEW
            ========================================= */}
            {showPrintModal && selectedAdmission && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-center p-4">
                            <h4 className="fw-bold mb-4">Print Documents Ready</h4>
                            {printType === 'ADMISSION' ? (
                                <div className="d-grid gap-3">
                                    <button className="btn btn-primary btn-lg" disabled={isPrinting} onClick={() => generatePDF(stickerRef, `Stickers_${selectedAdmission.id}`)}>
                                        <i className="fa-solid fa-tags me-2"></i> Print Sticker Sheet (x20)
                                    </button>
                                    <button className="btn btn-info btn-lg text-white" disabled={isPrinting} onClick={() => generatePDF(consentRef, `Consent_${selectedAdmission.id}`)}>
                                        <i className="fa-solid fa-file-contract me-2"></i> Print Consent Form
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-dark btn-lg w-100" disabled={isPrinting} onClick={() => generatePDF(dischargeSummaryRef, `Discharge_${selectedAdmission.id}`)}>
                                    <i className="fa-solid fa-file-medical me-2"></i> Print NABH Discharge Summary
                                </button>
                            )}
                            <button className="btn btn-outline-secondary mt-4" onClick={() => setShowPrintModal(false)}>Close Window</button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN PRINT LAYOUTS (OFFSCREEN)
            ========================================= */}
            {selectedAdmission && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>

                    {/* 1. ADMISSION STICKER SHEET */}
                    <div ref={stickerRef} style={{ width: '210mm', height: '297mm', padding: '10mm', background: 'white' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: '5mm', height: '100%' }}>
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} style={{ border: '1px solid #000', padding: '5px', fontSize: '10px', borderRadius: '4px', background: '#fff' }}>
                                    <div style={{ borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '3px', display: 'flex', alignItems: 'center' }}>
                                        <img src={logo} alt="Logo" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
                                        <strong style={{ fontSize: '11px' }}>ArogyaOne</strong>
                                    </div>
                                    <div style={{ lineHeight: '1.2' }}>
                                        <strong>Name:</strong> {selectedAdmission.patient_name}<br />
                                        <strong>UHID:</strong> {selectedAdmission.patient_id}<br />
                                        <strong>IPD No:</strong> {selectedAdmission.id}<br />
                                        <strong>Room:</strong> {selectedAdmission.room_number}<br />
                                        <strong>Dr:</strong> {selectedAdmission.consultant_doctor_name}<br />
                                        <strong>BG/Mob:</strong> {selectedAdmission.blood_group} | {selectedAdmission.mobile_number}<br />
                                        <strong>DOA:</strong> {safeDate(selectedAdmission.admission_date)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. CONSENT FORM */}
                    <div ref={consentRef} style={{ width: '210mm', minHeight: '297mm', padding: '10mm', background: 'white', color: 'black', fontFamily: 'serif' }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                            <img src={logo} alt="Logo" style={{ width: '60px', height: '60px', marginBottom: '8px' }} />
                            <h2>ArogyaOne Hospital</h2>
                            <h4>Patient Admission Consent Form</h4>
                        </div>
                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <strong>Date:</strong> {safeDate(selectedAdmission.admission_date)}
                        </div>

                        <h5 style={{ textDecoration: 'underline', marginBottom: '10px' }}>Patient Information</h5>
                        <p><strong>Patient Name:</strong> {selectedAdmission.patient_name}</p>
                        <p><strong>UHID:</strong> {selectedAdmission.patient_id}</p>
                        <p><strong>Admission Date:</strong> {safeDate(selectedAdmission.admission_date)}</p>
                        <p><strong>Patient ID Type:</strong> {selectedAdmission.document_type} <strong>No:</strong> {selectedAdmission.document_number}</p>

                        <h5 style={{ textDecoration: 'underline', marginTop: '20px', marginBottom: '10px' }}>Relative / Guardian Information</h5>
                        <p><strong>Relative Name:</strong> {selectedAdmission.relative_name}</p>
                        <p><strong>Relationship to Patient:</strong> {selectedAdmission.relationship}</p>

                        <h5 style={{ textDecoration: 'underline', marginTop: '30px', marginBottom: '10px' }}>Terms of Consent</h5>
                        <p style={{ textAlign: 'justify', lineHeight: '1.6' }}>
                            <strong>Authorization for Treatment:</strong> I hereby authorize the medical staff...<br /><br />
                            <strong>Financial Responsibility:</strong> I agree to be responsible for all charges...<br /><br />
                            <strong>Emergency Procedures:</strong> In case of an emergency, the hospital authority...<br /><br />
                            <strong>Privacy & Records:</strong> I consent to the hospital maintaining medical records...
                        </p>

                        <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                                Authorized Signatory<br />(ArogyaOne Authority)
                            </div>
                            <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                                Patient / Relative Guardian<br />({selectedAdmission.relative_name})
                            </div>
                        </div>
                    </div>

                    {/* 3. NABH DISCHARGE SUMMARY */}
                    {selectedAdmission.discharge_details && (
                        <div ref={dischargeSummaryRef} style={{ width: '210mm', padding: '15mm', background: 'white', color: 'black', fontFamily: 'serif', fontSize: '14px', lineHeight: '1.5' }}>
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                                <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginBottom: '10px' }} />
                                <h2 style={{ margin: '0' }}>ArogyaOne Hospital</h2>
                                <h4>Clinical Discharge Summary</h4>
                            </div>

                            <table style={{ width: '100%', marginBottom: '20px', border: '1px solid #ccc', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>Patient Name:</strong> {selectedAdmission.patient_name}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>UHID:</strong> {selectedAdmission.patient_id}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>Consultant:</strong> {selectedAdmission.consultant_doctor_name}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>IPD No:</strong> {selectedAdmission.id}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>Date of Admission:</strong> {safeDate(selectedAdmission.admission_date)}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}><strong>Date of Discharge:</strong> {safeDate(selectedAdmission.discharge_details.discharge_date)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6' }}>Admission Details</h5>
                            <p><strong>Mode of Admission:</strong> {selectedAdmission.discharge_details.mode_of_admission} </p>
                            <p><strong>Reason for Admission:</strong> {selectedAdmission.discharge_details.reason_for_admission} </p>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6', marginTop: '15px' }}>Clinical Summary & Final Diagnosis</h5>
                            <p style={{ textAlign: 'justify' }}>{selectedAdmission.discharge_details.clinical_summary}</p>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6', marginTop: '15px' }}>Treatment Provided</h5>
                            <p style={{ textAlign: 'justify' }}>{selectedAdmission.discharge_details.treatment_provided} </p>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6', marginTop: '15px' }}>Discharge Condition</h5>
                            <p>{selectedAdmission.discharge_details.discharge_condition} </p>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6', marginTop: '15px' }}>Prescribed Medications at Discharge </h5>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                                <thead style={{ background: '#eee' }}>
                                    <tr>
                                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>Medicine Name</th>
                                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>Dosage</th>
                                        <th style={{ border: '1px solid #ccc', padding: '5px' }}>Duration (Days)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAdmission.discharge_details.prescriptions.map((med, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{med.medicine_name}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{med.dosage}</td>
                                            <td style={{ border: '1px solid #ccc', padding: '5px' }}>{med.duration_days}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <h5 style={{ background: '#f0f0f0', padding: '5px', borderLeft: '3px solid #3b82f6', marginTop: '15px' }}>Follow-Up Instructions</h5>
                            <p>{selectedAdmission.discharge_details.follow_up_instructions} </p>

                            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ borderTop: '1px solid #000', width: '250px', textAlign: 'center', paddingTop: '5px' }}>
                                    <strong>{selectedAdmission.consultant_doctor_name}</strong><br />Consultant Signature
                                </div>
                                <div style={{ borderTop: '1px solid #000', width: '250px', textAlign: 'center', paddingTop: '5px' }}>
                                    Patient / Relative Signature<br />I acknowledge receipt of this summary.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomAllocation;