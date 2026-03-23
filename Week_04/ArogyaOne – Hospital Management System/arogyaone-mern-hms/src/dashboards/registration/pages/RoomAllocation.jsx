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

    // --- FORM STATES (NEW ADMISSION) ---
    const initialAdmState = {
        patient_id: '', patient_name: '', mobile_number: '', blood_group: '',
        consultant_doctor_name: '', room_id: '', document_type: 'Aadhar', document_number: '',
        relative_name: '', relationship: 'Father'
    };
    const [admForm, setAdmForm] = useState(initialAdmState);
    const [searchQuery, setSearchQuery] = useState(''); // Used ONLY for finding new patients to admit
    const [patientFound, setPatientFound] = useState(null);

    // --- TABLE FILTER STATES ---
    const [tableSearch, setTableSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

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
            alert("Patient not found in Master Database!");
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

    const safeDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-GB');
    };

    // --- FILTER ADMISSIONS TABLE ---
    const filteredAdmissions = admissions.filter(adm => {
        const matchesSearch = (adm.patient_name || '').toLowerCase().includes(tableSearch.toLowerCase()) || 
                              (adm.patient_id || '').toLowerCase().includes(tableSearch.toLowerCase()) || 
                              (adm.id || '').toLowerCase().includes(tableSearch.toLowerCase());
        const matchesStatus = filterStatus ? adm.status === filterStatus : true;
        const matchesDate = filterDate ? (adm.admission_date || '').startsWith(filterDate) : true;
        return matchesSearch && matchesStatus && matchesDate;
    });

    if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-primary" style={{width:'3rem', height:'3rem'}}></div></div>;

    return (
        <div className="container-fluid py-4">

            {/* --- HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-bed-pulse text-primary me-2"></i> IPD Admissions & Room Allocation
                    </h2>
                    <p className="text-muted mb-0 mt-1">Manage patient admissions, assign beds, and generate clinical discharges.</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-pill px-4 shadow-sm" onClick={fetchData}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Live Data
                </button>
            </div>

            {/* --- STATS CARDS (NEW UI) --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Currently Admitted</h6>
                                <h2 className="fw-bold mb-0">{stats.admitted} <span className="fs-6 fw-normal opacity-75">Patients</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3"><i className="fa-solid fa-bed"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Available Rooms</h6>
                                <h2 className="fw-bold mb-0">{stats.availableRooms} <span className="fs-6 fw-normal opacity-75">Beds Free</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3"><i className="fa-solid fa-door-open"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #d39e00 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Discharged Today</h6>
                                <h2 className="fw-bold mb-0">{stats.dischargedToday} <span className="fs-6 fw-normal opacity-75">Patients</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3 text-dark"><i className="fa-solid fa-person-walking-arrow-right"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW ADMISSION FORM SECTION --- */}
            <div className="card-common bg-white rounded-4 shadow-sm border-0 mb-5 overflow-hidden">
                <div className="bg-light p-3 border-bottom d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3" style={{width:'35px', height:'35px'}}>
                        <i className="fa-solid fa-plus"></i>
                    </div>
                    <h5 className="fw-bold m-0 text-dark">Register New IPD Admission</h5>
                </div>
                
                <div className="p-4">
                    {/* Search Row for Admission */}
                    <div className="row g-3 mb-4 align-items-end border-bottom pb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold text-muted small">Search Master Patient DB (UHID / Mobile) <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <input type="text" className="form-control rounded-start-3" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter ID or Phone..." />
                                <button className="btn btn-primary fw-bold px-4 rounded-end-3" type="button" onClick={handlePatientSearch}>Verify Patient</button>
                            </div>
                        </div>
                        {patientFound && (
                            <div className="col-md-6">
                                <div className="alert alert-success m-0 py-2 d-flex align-items-center border-0 rounded-3">
                                    <i className="fa-solid fa-check-circle fs-4 me-3"></i>
                                    <div>
                                        <div className="fw-bold text-dark">Patient Verified: {patientFound.patient_full_name}</div>
                                        <div className="small opacity-75">{patientFound.age} Yrs | {patientFound.gender} | UHID: {patientFound.id}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Admission Form */}
                    <form onSubmit={handleAdmSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Consultant Doctor <span className="text-danger">*</span></label>
                                    <select className="form-select rounded-3" value={admForm.consultant_doctor_name} required onChange={(e) => setAdmForm({ ...admForm, consultant_doctor_name: e.target.value })}>
                                        <option value="">-- Select Doctor --</option>
                                        {doctors.map(d => <option key={d.id} value={d.full_name}>{d.full_name} ({d.department})</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Room / Bed Allocation <span className="text-danger">*</span></label>
                                    <select className="form-select rounded-3" value={admForm.room_id} required onChange={(e) => setAdmForm({ ...admForm, room_id: e.target.value })}>
                                        <option value="">-- Select Available Room --</option>
                                        {rooms.filter(r => r.is_available).map(r => (
                                            <option key={r.id} value={r.id}>{r.room_number} ({r.room_category}) - ₹{r.room_rent_per_day}/day</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="row mb-3 g-2">
                                    <div className="col-4">
                                        <label className="form-label fw-bold text-muted small">ID Type <span className="text-danger">*</span></label>
                                        <select className="form-select rounded-3" value={admForm.document_type} onChange={(e) => setAdmForm({ ...admForm, document_type: e.target.value })}>
                                            <option value="Aadhar">Aadhar</option><option value="PAN">PAN</option><option value="PMJAY">PMJAY</option>
                                        </select>
                                    </div>
                                    <div className="col-8">
                                        <label className="form-label fw-bold text-muted small">ID Number <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control rounded-3" value={admForm.document_number} required onChange={(e) => setAdmForm({ ...admForm, document_number: e.target.value })} />
                                    </div>
                                </div>
                                <div className="row mb-3 g-2">
                                    <div className="col-8">
                                        <label className="form-label fw-bold text-muted small">Relative / Guardian Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control rounded-3" value={admForm.relative_name} required onChange={(e) => setAdmForm({ ...admForm, relative_name: e.target.value })} />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label fw-bold text-muted small">Relationship <span className="text-danger">*</span></label>
                                        <select className="form-select rounded-3" value={admForm.relationship} onChange={(e) => setAdmForm({ ...admForm, relationship: e.target.value })}>
                                            <option value="Father">Father</option><option value="Mother">Mother</option>
                                            <option value="Spouse">Spouse</option><option value="Child">Child</option><option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 border-top pt-3 text-end">
                                <button type="submit" className="btn btn-primary fw-bold px-5 rounded-pill shadow-sm" disabled={!patientFound}>
                                    <i className="fa-solid fa-bed-pulse me-2"></i> Confirm Admission & Print Docs
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MASTER IPD TABLE WITH FILTERS --- */}
            <h5 className="fw-bold text-dark mb-3"><i className="fa-solid fa-list-check text-primary me-2"></i> Master IPD Admissions List</h5>
            
            {/* Table Filter Bar */}
            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-3 mb-4">
                <div className="row g-3">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light rounded-end-pill" placeholder="Filter List by Name, UHID, or IPD ID..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control rounded-pill bg-light text-muted fw-bold" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-md-2">
                        <select className="form-select rounded-pill bg-light fw-bold text-muted" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="ADMITTED">Admitted</option>
                            <option value="DISCHARGED">Discharged</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <button className="btn btn-outline-secondary rounded-pill w-100 fw-bold" onClick={() => { setTableSearch(''); setFilterDate(''); setFilterStatus(''); }}>Clear Filters</button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="card-common bg-white p-0 overflow-hidden rounded-4 shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">IPD ID / UHID</th>
                                <th>Patient Details</th>
                                <th>Room / Consultant</th>
                                <th>Status</th>
                                <th>Dates</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdmissions.map(adm => (
                                <tr key={adm.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-primary">{adm.id}</div>
                                        <div className="small text-muted">{adm.patient_id}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{adm.patient_name}</div>
                                        <div className="small text-muted"><i className="fa-solid fa-phone me-1"></i>{adm.mobile_number}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark"><i className="fa-solid fa-bed me-1 text-muted"></i>{adm.room_number}</div>
                                        <div className="small text-muted">{adm.consultant_doctor_name}</div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill ${adm.status === 'ADMITTED' ? 'bg-primary' : 'bg-secondary'}`}>{adm.status}</span>
                                        {adm.billing_status === 'PENDING_FINAL_BILL' && <div className="small text-warning fw-bold mt-1"><i className="fa-solid fa-clock me-1"></i> Pending Bill</div>}
                                        {adm.billing_status === 'CLOSED' && <div className="small text-success fw-bold mt-1"><i className="fa-solid fa-check-double me-1"></i> Bill Cleared</div>}
                                    </td>
                                    <td>
                                        <div className="small text-muted fw-bold">Adm: {safeDate(adm.admission_date)}</div>
                                        {adm.status === 'DISCHARGED' && (
                                            <div className="small text-danger fw-bold">Dis: {adm.discharge_details?.discharge_date ? safeDate(adm.discharge_details.discharge_date) : safeDate(adm.discharge_date)}</div>
                                        )}
                                    </td>
                                    <td className="text-center pe-4">
                                        <div className="d-flex justify-content-center gap-2">
                                            {/* Print Admission Docs (Always visible) */}
                                            <button className="btn btn-sm btn-outline-primary rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => { setSelectedAdmission(adm); setPrintType('ADMISSION'); setShowPrintModal(true); }} title="Print Admission Docs">
                                                <i className="fa-solid fa-print"></i>
                                            </button>

                                            {adm.status === 'ADMITTED' && (
                                                <>
                                                    <button className="btn btn-sm btn-outline-success rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => { setSelectedAdmission(adm); setShowDischargeModal(true); }} title="Clinical Discharge">
                                                        <i className="fa-solid fa-person-walking-arrow-right"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-info rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => { setSelectedAdmission(adm); setEditForm(adm); setShowEditModal(true); }} title="Edit Record">
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => handleDelete(adm)} title="Delete Record">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </>
                                            )}

                                            {adm.status === 'DISCHARGED' && adm.discharge_details && (
                                                <button className="btn btn-sm btn-outline-dark rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => { setSelectedAdmission(adm); setPrintType('DISCHARGE'); setShowPrintModal(true); }} title="Reprint Discharge Summary">
                                                    <i className="fa-solid fa-file-medical"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAdmissions.length === 0 && <tr><td colSpan="6" className="text-center p-5 text-muted fst-italic">No admissions match the current filters.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: NABH DISCHARGE FORM
            ========================================= */}
            {showDischargeModal && selectedAdmission && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header bg-success text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-file-medical me-2"></i>Clinical Discharge Summary (Sent to Billing)</h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowDischargeModal(false)}></button>
                            </div>
                            <form onSubmit={handleDischargeSubmit}>
                                <div className="modal-body p-4 bg-light overflow-auto" style={{ maxHeight: '70vh' }}>
                                    
                                    {/* Patient Context Banner */}
                                    <div className="bg-white p-3 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="fw-bold text-primary mb-1">{selectedAdmission.patient_name}</h5>
                                            <small className="text-muted">UHID: {selectedAdmission.patient_id} | Room: {selectedAdmission.room_number}</small>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-secondary mb-1">Adm: {safeDate(selectedAdmission.admission_date)}</span>
                                            <br />
                                            <small className="text-dark fw-bold">Dr. {selectedAdmission.consultant_doctor_name}</small>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4 bg-white p-3 rounded-4 shadow-sm border mx-0">
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-muted">Discharge Date</label>
                                            <input type="date" className="form-control rounded-3" value={dischargeForm.discharge_date} required onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_date: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-muted">Discharge Time</label>
                                            <input type="time" className="form-control rounded-3" value={dischargeForm.discharge_time} required onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_time: e.target.value })} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-muted">Mode of Admission</label>
                                            <select className="form-select rounded-3" value={dischargeForm.mode_of_admission} onChange={(e) => setDischargeForm({ ...dischargeForm, mode_of_admission: e.target.value })}>
                                                <option>Planned</option><option>Emergency</option><option>Transfer</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small text-muted">Discharge Condition</label>
                                            <select className="form-select rounded-3 border-danger fw-bold" value={dischargeForm.discharge_condition} onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_condition: e.target.value })}>
                                                <option>Stable</option>
                                                <option>Referred</option>
                                                <option>LAMA</option>
                                                {/* FIX: ADDED DEATH OPTION HERE */}
                                                <option value="Death" className="text-danger fw-bold">Death</option> 
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold text-dark">Reason for Admission / Chief Complaint</label>
                                            <input type="text" className="form-control rounded-3" value={dischargeForm.reason_for_admission} required onChange={(e) => setDischargeForm({ ...dischargeForm, reason_for_admission: e.target.value })} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold text-dark">Clinical Summary & Final Diagnosis</label>
                                            <textarea className="form-control rounded-3" rows="3" value={dischargeForm.clinical_summary} required onChange={(e) => setDischargeForm({ ...dischargeForm, clinical_summary: e.target.value })} placeholder="Include diagnosis and major events..."></textarea>
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label fw-bold text-dark">Treatment Provided</label>
                                            <textarea className="form-control rounded-3" rows="2" value={dischargeForm.treatment_provided} required onChange={(e) => setDischargeForm({ ...dischargeForm, treatment_provided: e.target.value })} placeholder="Surgeries, major procedures, diet..."></textarea>
                                        </div>
                                    </div>

                                    {/* Prescriptions Section */}
                                    <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                            <label className="form-label fw-bold text-dark m-0"><i className="fa-solid fa-pills text-primary me-2"></i> Discharge Medications</label>
                                            <button type="button" className="btn btn-sm btn-outline-primary rounded-pill fw-bold" onClick={handleAddPrescriptionRow}>+ Add Med</button>
                                        </div>
                                        {dischargeForm.prescriptions.map((med, idx) => (
                                            <div className="row g-2 mb-2" key={idx}>
                                                <div className="col-5"><input type="text" className="form-control form-control-sm rounded-3" placeholder="Medicine Name" value={med.medicine_name} onChange={(e) => handlePrescriptionChange(idx, 'medicine_name', e.target.value)} required /></div>
                                                <div className="col-4"><input type="text" className="form-control form-control-sm rounded-3" placeholder="Dosage (e.g., 1-0-1)" value={med.dosage} onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)} required /></div>
                                                <div className="col-3"><input type="text" className="form-control form-control-sm rounded-3" placeholder="Days" value={med.duration_days} onChange={(e) => handlePrescriptionChange(idx, 'duration_days', e.target.value)} required /></div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                                        <label className="form-label fw-bold text-dark">Follow-Up Instructions</label>
                                        <input type="text" className="form-control rounded-3" value={dischargeForm.follow_up_instructions} required onChange={(e) => setDischargeForm({ ...dischargeForm, follow_up_instructions: e.target.value })} placeholder="e.g., Visit OPD after 5 days" />
                                    </div>

                                </div>
                                <div className="modal-footer bg-white border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary fw-bold rounded-pill px-4" onClick={() => setShowDischargeModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-success fw-bold rounded-pill px-4 shadow-sm"><i className="fa-solid fa-check me-2"></i> Confirm Clinical Discharge & Send to Billing</button>
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow overflow-hidden">
                            <div className="modal-header bg-light border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-pen text-primary me-2"></i> Edit Admission Details</h5>
                                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-4 bg-white">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">ID Type</label>
                                        <input type="text" className="form-control rounded-3" value={editForm.document_type || ''} onChange={(e) => setEditForm({ ...editForm, document_type: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">ID Number</label>
                                        <input type="text" className="form-control rounded-3" value={editForm.document_number || ''} onChange={(e) => setEditForm({ ...editForm, document_number: e.target.value })} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted">Relative Name</label>
                                        <input type="text" className="form-control rounded-3" value={editForm.relative_name || ''} onChange={(e) => setEditForm({ ...editForm, relative_name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3">
                                    <button type="button" className="btn btn-secondary fw-bold rounded-pill px-4" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm">Save Updates</button>
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
                        <div className="modal-content text-center p-5 rounded-4 shadow-lg border-0">
                            <i className="fa-solid fa-print fs-1 text-primary mb-3"></i>
                            <h4 className="fw-bold mb-4 text-dark">Print Documents Ready</h4>
                            {printType === 'ADMISSION' ? (
                                <div className="d-grid gap-3">
                                    <button className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm" disabled={isPrinting} onClick={() => generatePDF(stickerRef, `Stickers_${selectedAdmission.id}`)}>
                                        <i className="fa-solid fa-tags me-2"></i> Print Sticker Sheet (x20)
                                    </button>
                                    <button className="btn btn-info btn-lg text-white rounded-pill fw-bold shadow-sm" disabled={isPrinting} onClick={() => generatePDF(consentRef, `Consent_${selectedAdmission.id}`)}>
                                        <i className="fa-solid fa-file-contract me-2"></i> Print Consent Form
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-dark btn-lg w-100 rounded-pill fw-bold shadow-sm" disabled={isPrinting} onClick={() => generatePDF(dischargeSummaryRef, `Discharge_${selectedAdmission.id}`)}>
                                    <i className="fa-solid fa-file-medical me-2"></i> Print NABH Discharge Summary
                                </button>
                            )}
                            <button className="btn btn-outline-secondary mt-4 rounded-pill fw-bold" onClick={() => setShowPrintModal(false)}>Close Window</button>
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
                        <p><strong>Admission Date:</strong> {new Date(selectedAdmission.admission_date).toLocaleString('en-GB')}</p>
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
                            <p className={selectedAdmission.discharge_details.discharge_condition === 'Death' ? 'text-danger fw-bold' : ''}>
                                {selectedAdmission.discharge_details.discharge_condition} 
                            </p>

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