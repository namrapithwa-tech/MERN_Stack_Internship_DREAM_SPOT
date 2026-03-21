import React, { useState, useEffect } from 'react';
import api from '../../../api/axios'; // Adjust path based on your folder structure

const OTSchedule = () => {
    // --- State Management ---
    const [schedules, setSchedules] = useState([]);
    const [ipdPatients, setIpdPatients] = useState([]);
    const [otRooms, setOtRooms] = useState([]);
    const [doctors, setDoctors] = useState([]); // NEW: State for doctors
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const initialFormState = {
        ipd_admission_id: '',
        patient_id: '', // UHID
        patient_name: '',
        surgery_name: '',
        primary_surgeon: '', // This will now hold the doctor's full_name
        ot_room_id: '',
        ot_room_name: '',
        schedule_date: '', // datetime-local format
        estimated_duration: '1 Hour'
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- Data Fetching ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Added api.get('/doctors') to the Promise.all array
            const [schedRes, ipdRes, otRes, docRes] = await Promise.all([
                api.get('/surgery_schedules').catch(() => ({ data: [] })), 
                api.get('/ipd_admissions').catch(() => ({ data: [] })),
                api.get('/operation_theaters').catch(() => ({ data: [] })),
                api.get('/doctors').catch(() => ({ data: [] }))
            ]);

            // 1. Set Schedules (Sort newest/upcoming first)
            const sortedSchedules = (schedRes.data || []).sort((a, b) => new Date(b.schedule_date) - new Date(a.schedule_date));
            setSchedules(sortedSchedules);

            // 2. Set Active IPD Patients
            const activeAdmissions = (ipdRes.data || []).filter(adm => adm.status === 'ADMITTED');
            setIpdPatients(activeAdmissions);

            // 3. Set Operation Theaters
            setOtRooms(otRes.data || []);

            // 4. Set Doctors (Optional: filter only active ones if needed)
            const activeDoctors = (docRes.data || []).filter(doc => doc.is_available !== false);
            setDoctors(activeDoctors);

        } catch (error) {
            console.error("Error fetching OT Schedule data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Form Handlers ---
    const handlePatientChange = (e) => {
        const selectedAdmId = e.target.value;
        const patient = ipdPatients.find(p => p.id === selectedAdmId);
        
        if (patient) {
            setFormData({
                ...formData,
                ipd_admission_id: patient.id,
                patient_id: patient.patient_id,
                patient_name: patient.patient_name
            });
        } else {
            setFormData({ ...formData, ipd_admission_id: '', patient_id: '', patient_name: '' });
        }
    };

    const handleRoomChange = (e) => {
        const selectedRoomId = e.target.value;
        const room = otRooms.find(r => r.id === selectedRoomId);
        
        if (room) {
            setFormData({
                ...formData,
                ot_room_id: room.id,
                ot_room_name: room.name
            });
        } else {
            setFormData({ ...formData, ot_room_id: '', ot_room_name: '' });
        }
    };

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Actions ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                id: `SURG-${Date.now()}`,
                ...formData,
                status: 'Scheduled',
                created_at: new Date().toISOString()
            };

            await api.post('/surgery_schedules', payload);
            
            // Update local state instantly (add to top of list)
            setSchedules([payload, ...schedules].sort((a, b) => new Date(b.schedule_date) - new Date(a.schedule_date)));
            
            setShowModal(false);
            setFormData(initialFormState);
        } catch (error) {
            console.error("Error booking surgery:", error);
            alert("Failed to book surgery. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelSchedule = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this surgery schedule?")) return;
        
        try {
            await api.patch(`/surgery_schedules/${id}`, { status: 'Cancelled' });
            
            // Update local state
            setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Cancelled' } : s));
        } catch (error) {
            console.error("Error cancelling surgery:", error);
            alert("Failed to cancel schedule.");
        }
    };

    // --- Derived State ---
    const filteredSchedules = schedules.filter(s => 
        s.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primary_surgeon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Helpers ---
    const getStatusBadge = (status) => {
        switch(status) {
            case 'Scheduled': return <span className="badge bg-primary rounded-pill px-3 py-2"><i className="fa-regular fa-calendar-check me-1"></i>Scheduled</span>;
            case 'Completed': return <span className="badge bg-success rounded-pill px-3 py-2"><i className="fa-solid fa-check-double me-1"></i>Completed</span>;
            case 'Cancelled': return <span className="badge bg-danger rounded-pill px-3 py-2"><i className="fa-solid fa-ban me-1"></i>Cancelled</span>;
            default: return <span className="badge bg-secondary rounded-pill px-3 py-2">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-calendar-plus text-primary me-2"></i> OT Scheduling
                    </h2>
                    <p className="text-muted mb-0 mt-1">Book and manage Operation Theater schedules.</p>
                </div>
                <button 
                    className="btn btn-primary fw-bold px-4 py-2 rounded-4 shadow-sm" 
                    onClick={() => setShowModal(true)}
                >
                    <i className="fa-solid fa-plus me-2"></i> Book Surgery
                </button>
            </div>

            {/* --- Search Bar --- */}
            <div className="card-common bg-white shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 rounded-start-4"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                    <input 
                        type="text" 
                        className="form-control border-start-0 ps-0 rounded-end-4" 
                        placeholder="Search by Patient Name, Surgeon, or Schedule ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* --- Master Schedule Table --- */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Date & Time</th>
                                <th>Patient Details</th>
                                <th>Surgery Name</th>
                                <th>Surgeon & Room</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredSchedules.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="fa-regular fa-calendar-xmark fs-1 mb-3 text-secondary opacity-50"></i>
                                        <h5>No schedules found</h5>
                                        <p className="mb-0">There are no upcoming surgeries matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSchedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">
                                                {new Date(schedule.schedule_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="small fw-bold text-primary mt-1">
                                                <i className="fa-regular fa-clock me-1"></i>
                                                {new Date(schedule.schedule_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{schedule.patient_name}</div>
                                            <div className="small text-muted">UHID: {schedule.patient_id}</div>
                                            <div className="small text-muted mt-1">ID: {schedule.id}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{schedule.surgery_name}</div>
                                            <div className="small text-muted"><i className="fa-solid fa-hourglass-half me-1"></i>Est: {schedule.estimated_duration}</div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-primary"><i className="fa-solid fa-user-doctor me-1"></i>{schedule.primary_surgeon}</div>
                                            <div className="badge bg-light text-dark border mt-1"><i className="fa-solid fa-bed-pulse text-danger me-1"></i>{schedule.ot_room_name}</div>
                                        </td>
                                        <td>
                                            {getStatusBadge(schedule.status)}
                                        </td>
                                        <td className="text-end pe-4">
                                            {schedule.status === 'Scheduled' && (
                                                <button 
                                                    className="btn btn-sm btn-outline-danger fw-bold px-3 rounded-pill"
                                                    onClick={() => handleCancelSchedule(schedule.id)}
                                                    title="Cancel Booking"
                                                >
                                                    <i className="fa-solid fa-xmark me-1"></i> Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: BOOK SURGERY
            ========================================= */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-primary text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-calendar-plus me-2"></i> Book Operation Theater
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    
                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Patient Details</h6>
                                    <div className="mb-4">
                                        <label className="fw-bold text-muted small mb-2">Select Admitted Patient <span className="text-danger">*</span></label>
                                        <select 
                                            className="form-select border-secondary" 
                                            value={formData.ipd_admission_id}
                                            onChange={handlePatientChange}
                                            required
                                        >
                                            <option value="">-- Search & Select Patient --</option>
                                            {ipdPatients.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.patient_name} (UHID: {p.patient_id}) - Room {p.room_number}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Surgery Information</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Surgery Name/Type <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control border-secondary" 
                                                name="surgery_name"
                                                placeholder="e.g., Laparoscopic Appendectomy" 
                                                value={formData.surgery_name}
                                                onChange={handleInput}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            {/* UPDATED: Primary Surgeon Dropdown */}
                                            <label className="fw-bold text-muted small mb-2">Primary Surgeon <span className="text-danger">*</span></label>
                                            <select 
                                                className="form-select border-secondary" 
                                                name="primary_surgeon"
                                                value={formData.primary_surgeon}
                                                onChange={handleInput}
                                                required
                                            >
                                                <option value="">-- Select Surgeon --</option>
                                                {doctors.map(doc => (
                                                    <option key={doc.id} value={doc.full_name}>
                                                        {doc.full_name} ({doc.department || 'Surgeon'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Scheduling Details</h6>
                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="fw-bold text-muted small mb-2">Operation Theater Room <span className="text-danger">*</span></label>
                                            <select 
                                                className="form-select border-secondary" 
                                                value={formData.ot_room_id}
                                                onChange={handleRoomChange}
                                                required
                                            >
                                                <option value="">-- Select OT Room --</option>
                                                {otRooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.name} ({room.type}) - Base Charge: ₹{room.base_price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Date & Time <span className="text-danger">*</span></label>
                                            <input 
                                                type="datetime-local" 
                                                className="form-control border-secondary" 
                                                name="schedule_date"
                                                value={formData.schedule_date}
                                                onChange={handleInput}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="fw-bold text-muted small mb-2">Estimated Duration</label>
                                            <select 
                                                className="form-select border-secondary" 
                                                name="estimated_duration"
                                                value={formData.estimated_duration}
                                                onChange={handleInput}
                                            >
                                                <option value="30 Mins">30 Minutes</option>
                                                <option value="1 Hour">1 Hour</option>
                                                <option value="2 Hours">2 Hours</option>
                                                <option value="3 Hours">3 Hours</option>
                                                <option value="4+ Hours">4+ Hours</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" disabled={isSaving}>
                                        {isSaving ? (
                                            <><i className="fa-solid fa-spinner fa-spin me-2"></i> Booking...</>
                                        ) : (
                                            <><i className="fa-solid fa-check-double me-2"></i> Confirm Booking</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OTSchedule;