import React, { useState, useEffect } from 'react';
import api from '../../../api/axios'; // Adjust path based on your folder structure

const SurgeryLogs = () => {
    // --- State Management ---
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'
    
    // Modal States
    const [showLogModal, setShowLogModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedSurgery, setSelectedSurgery] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form Data for Post-Op Notes & Billing
    const initialFormData = {
        actual_start_time: '',
        actual_end_time: '',
        surgical_notes: '',
        surgeon_fee: '',
        anesthesia_fee: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    // --- Data Fetching ---
    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await api.get('/surgery_schedules');
            setSchedules(response.data || []);
        } catch (error) {
            console.error("Error fetching surgery schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleOpenLogModal = (surgery) => {
        setSelectedSurgery(surgery);
        setFormData(initialFormData);
        setShowLogModal(true);
    };

    const handleOpenViewModal = (surgery) => {
        setSelectedSurgery(surgery);
        setShowViewModal(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitLog = async (e) => {
        e.preventDefault();
        
        // FIX 1: Added confirmation before saving (prevents accidental "Enter" key submits)
        if (!window.confirm("Are you sure you want to finalize this surgery log? This will move the surgery to the completed archive and push fees to billing.")) {
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                status: 'Completed',
                post_op_details: {
                    ...formData,
                    surgeon_fee: Number(formData.surgeon_fee) || 0,
                    anesthesia_fee: Number(formData.anesthesia_fee) || 0,
                    logged_at: new Date().toISOString()
                }
            };

            // Update database (Stores inside "surgery_schedules" in db.json)
            await api.patch(`/surgery_schedules/${selectedSurgery.id}`, payload);

            // Update local state to move it to the 'Completed' tab instantly
            setSchedules(prev => prev.map(s => 
                s.id === selectedSurgery.id ? { ...s, ...payload } : s
            ));

            setShowLogModal(false);
            setSelectedSurgery(null);
            setFormData(initialFormData);
        } catch (error) {
            console.error("Error logging surgery details:", error);
            alert("Failed to save surgery logs. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Data Filtering & Sorting ---
    const filteredSchedules = schedules.filter(s => 
        s.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primary_surgeon?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingLogs = filteredSchedules
        .filter(s => s.status === 'Scheduled')
        .sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date)); // Oldest scheduled first

    const completedLogs = filteredSchedules
        .filter(s => s.status === 'Completed')
        .sort((a, b) => new Date(b.schedule_date) - new Date(a.schedule_date)); // Newest completed first

    return (
        <div className="container-fluid py-4">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-file-medical text-primary me-2"></i> Surgery Logs & Clearances
                    </h2>
                    <p className="text-muted mb-0 mt-1">Record post-op clinical notes and process surgeon fees.</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-4 shadow-sm" onClick={fetchSchedules}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh
                </button>
            </div>

            {/* Workspace Controls (Search & Tabs) */}
            <div className="card-common bg-white shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-4">
                                <i className="fa-solid fa-magnifying-glass text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0 rounded-end-4" 
                                placeholder="Search by Patient, UHID, or Surgeon..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <ul className="nav nav-pills d-inline-flex bg-light p-1 rounded-4 border">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'pending' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    <i className="fa-solid fa-clock me-2"></i> Pending Logs
                                    <span className="badge bg-danger ms-2 rounded-pill">{schedules.filter(s => s.status === 'Scheduled').length}</span>
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'completed' ? 'active bg-white text-success shadow-sm border' : 'text-muted'}`}
                                    onClick={() => setActiveTab('completed')}
                                >
                                    <i className="fa-solid fa-check-double me-2"></i> Completed Archive
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Date & Time</th>
                                <th>Patient Info</th>
                                <th>Surgery & OT</th>
                                <th>Surgeon</th>
                                <th className="text-center pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : (
                                activeTab === 'pending' ? (
                                    pendingLogs.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No pending surgeries require logging.</td></tr>
                                    ) : (
                                        pendingLogs.map(surgery => (
                                            <tr key={surgery.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{new Date(surgery.schedule_date).toLocaleDateString('en-GB')}</div>
                                                    <div className="small text-muted">{new Date(surgery.schedule_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-primary">{surgery.patient_name}</div>
                                                    <div className="small text-muted">UHID: {surgery.patient_id}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-dark">{surgery.surgery_name}</div>
                                                    <div className="badge bg-light text-dark border mt-1">{surgery.ot_room_name}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark"><i className="fa-solid fa-user-doctor text-muted me-1"></i> {surgery.primary_surgeon}</div>
                                                </td>
                                                <td className="text-center pe-4">
                                                    <button 
                                                        className="btn btn-sm btn-warning fw-bold px-3 rounded-pill shadow-sm"
                                                        onClick={() => handleOpenLogModal(surgery)}
                                                    >
                                                        <i className="fa-solid fa-pen-to-square me-1"></i> Log Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                ) : (
                                    completedLogs.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No completed surgery logs found.</td></tr>
                                    ) : (
                                        completedLogs.map(surgery => (
                                            <tr key={surgery.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{new Date(surgery.schedule_date).toLocaleDateString('en-GB')}</div>
                                                    <div className="small text-muted">{new Date(surgery.schedule_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-primary">{surgery.patient_name}</div>
                                                    <div className="small text-muted">UHID: {surgery.patient_id}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-dark">{surgery.surgery_name}</div>
                                                    <div className="badge bg-light text-dark border mt-1">{surgery.ot_room_name}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-dark"><i className="fa-solid fa-user-doctor text-muted me-1"></i> {surgery.primary_surgeon}</div>
                                                </td>
                                                <td className="text-center pe-4">
                                                    <button 
                                                        className="btn btn-sm btn-outline-info fw-bold px-3 rounded-pill"
                                                        onClick={() => handleOpenViewModal(surgery)}
                                                    >
                                                        <i className="fa-solid fa-eye me-1"></i> View Log
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: LOG SURGERY DETAILS (POST-OP)
            ========================================= */}
            {showLogModal && selectedSurgery && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-warning text-dark border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-clipboard-check me-2"></i> Log Surgery Details
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowLogModal(false)}></button>
                            </div>
                            
                            <form onSubmit={handleSubmitLog}>
                                {/* FIX 2: Added overflow-auto and maxHeight to force scrollbar if screen is too small */}
                                <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '65vh' }}>
                                    {/* Context Banner */}
                                    <div className="bg-light p-3 rounded-4 border mb-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="fw-bold text-primary mb-1">{selectedSurgery.patient_name}</h5>
                                            <small className="text-muted">UHID: {selectedSurgery.patient_id} | Surgeon: {selectedSurgery.primary_surgeon}</small>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-secondary mb-1">{selectedSurgery.ot_room_name}</span>
                                            <br />
                                            <small className="text-dark fw-bold">{selectedSurgery.surgery_name}</small>
                                        </div>
                                    </div>

                                    {/* SECTION 1: CLINICAL NOTES */}
                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                                        <i className="fa-solid fa-notes-medical text-primary me-2"></i> Section 1: Clinical Notes
                                    </h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Actual Start Time <span className="text-danger">*</span></label>
                                            <input 
                                                type="time" 
                                                className="form-control border-secondary rounded-3" 
                                                name="actual_start_time"
                                                value={formData.actual_start_time}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Actual End Time <span className="text-danger">*</span></label>
                                            <input 
                                                type="time" 
                                                className="form-control border-secondary rounded-3" 
                                                name="actual_end_time"
                                                value={formData.actual_end_time}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-12 mt-3">
                                            <label className="fw-bold text-muted small mb-2">Surgical Notes / Complications <span className="text-danger">*</span></label>
                                            <textarea 
                                                className="form-control border-secondary rounded-3" 
                                                rows="4" 
                                                name="surgical_notes"
                                                placeholder="Describe procedure, findings, or complications..."
                                                value={formData.surgical_notes}
                                                onChange={handleInputChange}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* SECTION 2: BILLING & FEES */}
                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2 mt-4">
                                        <i className="fa-solid fa-file-invoice-dollar text-success me-2"></i> Section 2: Billing & Fees
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Surgeon Fee <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light text-muted fw-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    className="form-control border-secondary" 
                                                    name="surgeon_fee"
                                                    placeholder="0.00"
                                                    value={formData.surgeon_fee}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Anesthesia Fee <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light text-muted fw-bold">₹</span>
                                                <input 
                                                    type="number" 
                                                    className="form-control border-secondary" 
                                                    name="anesthesia_fee"
                                                    placeholder="0.00"
                                                    value={formData.anesthesia_fee}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="alert alert-info mt-3 small mb-0 rounded-3 border-0">
                                        <i className="fa-solid fa-circle-info me-2"></i> These fees will be automatically added to the patient's final IPD bill.
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowLogModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-success fw-bold px-4 rounded-pill shadow-sm" disabled={isSaving}>
                                        {isSaving ? (
                                            <><i className="fa-solid fa-spinner fa-spin me-2"></i> Saving...</>
                                        ) : (
                                            <><i className="fa-solid fa-check me-2"></i> Finalize & Save Log</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: VIEW SURGERY LOGS (READ-ONLY)
            ========================================= */}
            {showViewModal && selectedSurgery && selectedSurgery.post_op_details && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-info text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-clipboard-list me-2"></i> Post-Op Surgery Log
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
                            </div>
                            
                            {/* FIX 3: Added identical scrolling constraint here just in case */}
                            <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '65vh' }}>
                                {/* Context Banner */}
                                <div className="bg-light p-3 rounded-4 border mb-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">{selectedSurgery.patient_name}</h5>
                                        <small className="text-muted">UHID: {selectedSurgery.patient_id} | Surgeon: {selectedSurgery.primary_surgeon}</small>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-success mb-1"><i className="fa-solid fa-check-double me-1"></i>Completed</span>
                                        <br />
                                        <small className="text-muted fw-bold">ID: {selectedSurgery.id}</small>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    <div className="col-md-12">
                                        <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Clinical Information</h6>
                                        <div className="row mb-3">
                                            <div className="col-6">
                                                <small className="text-muted fw-bold d-block">Actual Start Time</small>
                                                <span className="text-dark">{selectedSurgery.post_op_details.actual_start_time || 'N/A'}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted fw-bold d-block">Actual End Time</small>
                                                <span className="text-dark">{selectedSurgery.post_op_details.actual_end_time || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <small className="text-muted fw-bold d-block mb-1">Surgical Notes</small>
                                            <div className="bg-light p-3 rounded-3 border" style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                                                {selectedSurgery.post_op_details.surgical_notes || 'No notes provided.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <h6 className="fw-bold text-success mb-3 border-bottom pb-2 mt-2">Financial Records</h6>
                                        <div className="row">
                                            <div className="col-6">
                                                <small className="text-muted fw-bold d-block">Surgeon Fee</small>
                                                <span className="fs-5 fw-bold text-dark">₹{selectedSurgery.post_op_details.surgeon_fee?.toLocaleString('en-IN') || '0'}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted fw-bold d-block">Anesthesia Fee</small>
                                                <span className="fs-5 fw-bold text-dark">₹{selectedSurgery.post_op_details.anesthesia_fee?.toLocaleString('en-IN') || '0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowViewModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SurgeryLogs;