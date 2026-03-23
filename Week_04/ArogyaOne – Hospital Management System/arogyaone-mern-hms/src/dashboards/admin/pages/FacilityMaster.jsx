import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const ROOM_CATEGORIES = ["GENERAL", "ICU", "SEMI_GENERAL", "SEMI_DELUXE", "DELUXE"];
const OT_TYPES = ["Major Surgery", "Minor / Day Care", "Cardiac Cath Lab", "Labor & Delivery"];

const FacilityMaster = () => {
    // --- STATE ---
    const [rooms, setRooms] = useState([]);
    const [ots, setOts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'ots'
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showOTModal, setShowOTModal] = useState(false);
    const [viewData, setViewData] = useState({ show: false, type: null, data: null });

    // Forms
    const [editingId, setEditingId] = useState(null);
    const [roomForm, setRoomForm] = useState({ room_number: '', room_category: '', room_rent_per_day: '', facilitiesStr: '', is_available: true, allocated_patient_id: null });
    const [otForm, setOtForm] = useState({ name: '', type: '', base_price: '', status: 'Active', equipmentStr: '' });

    // --- FETCH DATA ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, otsRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/operation_theaters').catch(() => ({ data: [] })) // Catch if OT table doesn't exist yet
            ]);
            setRooms(roomsRes.data || []);
            setOts(otsRes.data || []);
        } catch (error) {
            console.error("Error fetching facility data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTERS & STATS ---
    const filteredRooms = rooms.filter(r => r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || r.room_category?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredOTs = ots.filter(o => o.name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.type?.toLowerCase().includes(searchTerm.toLowerCase()));

    const stats = {
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.is_available).length,
        totalOTs: ots.length,
        activeOTs: ots.filter(o => o.status === 'Active').length
    };

    // --- CSV EXPORT ---
    const exportToCSV = () => {
        let headers = [];
        let csvRows = [];
        let filename = "";

        if (activeTab === 'rooms') {
            headers = ["Room ID", "Room Number", "Category", "Rent Per Day", "Facilities", "Status", "Allocated Patient"];
            csvRows = filteredRooms.map(r => {
                const fac = r.facilities ? r.facilities.join('; ') : 'N/A';
                const status = r.is_available ? 'Available' : 'Occupied';
                return `"${r.id}","${r.room_number}","${r.room_category}","${r.room_rent_per_day}","${fac}","${status}","${r.allocated_patient_id || 'None'}"`;
            });
            filename = `ArogyaOne_Rooms_Master_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            headers = ["OT ID", "Name", "Type", "Base Price", "Equipment", "Status"];
            csvRows = filteredOTs.map(o => {
                const eq = o.equipment ? o.equipment.join('; ') : 'N/A';
                return `"${o.id}","${o.name}","${o.type}","${o.base_price}","${eq}","${o.status}"`;
            });
            filename = `ArogyaOne_OT_Master_${new Date().toISOString().split('T')[0]}.csv`;
        }

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // --- ROOM LOGIC ---
    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const facilitiesArray = roomForm.facilitiesStr.split(',').map(f => f.trim()).filter(f => f !== "");
            const payload = {
                room_number: roomForm.room_number,
                room_category: roomForm.room_category,
                room_rent_per_day: Number(roomForm.room_rent_per_day),
                facilities: facilitiesArray,
                is_available: roomForm.is_available,
                allocated_patient_id: roomForm.allocated_patient_id
            };

            if (editingId) {
                await api.put(`/rooms/${editingId}`, { id: editingId, ...payload });
                alert("Room updated successfully!");
            } else {
                const newId = `R-${roomForm.room_category}-${Date.now()}`;
                await api.post("/rooms", { id: newId, ...payload });
                alert("New Room added successfully!");
            }
            setShowRoomModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving room:", error);
            alert("Failed to save room.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditRoom = (room) => {
        setEditingId(room.id);
        setRoomForm({
            room_number: room.room_number,
            room_category: room.room_category,
            room_rent_per_day: room.room_rent_per_day,
            facilitiesStr: room.facilities?.join(', ') || '',
            is_available: room.is_available,
            allocated_patient_id: room.allocated_patient_id
        });
        setShowRoomModal(true);
    };

    const handleDeleteRoom = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this room?")) {
            try {
                await api.delete(`/rooms/${id}`);
                fetchData();
            } catch (err) {
                alert("Failed to delete room.");
            }
        }
    };

    // --- OT LOGIC ---
    const handleOTSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const eqArray = otForm.equipmentStr.split(',').map(e => e.trim()).filter(e => e !== "");
            const payload = {
                name: otForm.name,
                type: otForm.type,
                base_price: Number(otForm.base_price),
                status: otForm.status,
                equipment: eqArray
            };

            if (editingId) {
                await api.put(`/operation_theaters/${editingId}`, { id: editingId, ...payload });
                alert("Operation Theater updated successfully!");
            } else {
                const newId = `OT-${Date.now().toString().slice(-6)}`;
                await api.post("/operation_theaters", { id: newId, ...payload });
                alert("New Operation Theater added successfully!");
            }
            setShowOTModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving OT:", error);
            alert("Failed to save Operation Theater.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditOT = (ot) => {
        setEditingId(ot.id);
        setOtForm({
            name: ot.name,
            type: ot.type,
            base_price: ot.base_price,
            status: ot.status,
            equipmentStr: ot.equipment?.join(', ') || ''
        });
        setShowOTModal(true);
    };

    const handleDeleteOT = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this Operation Theater?")) {
            try {
                await api.delete(`/operation_theaters/${id}`);
                fetchData();
            } catch (err) {
                alert("Failed to delete Operation Theater.");
            }
        }
    };

    // --- RENDER ---
    return (
        <div className="container-fluid py-4">
            
            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-building-circle-check text-primary me-2"></i> Facility Master
                    </h2>
                    <p className="text-muted mb-0 mt-1">Manage IPD Rooms, Wards, and Operation Theaters infrastructure.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-dark fw-bold rounded-pill px-4 shadow-sm" onClick={exportToCSV}>
                        <i className="fa-solid fa-file-csv me-2"></i> Export Data
                    </button>
                    <button className="btn btn-outline-primary fw-bold rounded-pill px-4 shadow-sm" onClick={() => { setEditingId(null); setRoomForm({ room_number: '', room_category: '', room_rent_per_day: '', facilitiesStr: '', is_available: true, allocated_patient_id: null }); setShowRoomModal(true); }}>
                        <i className="fa-solid fa-bed me-2"></i> Add IPD Room
                    </button>
                    <button className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm" onClick={() => { setEditingId(null); setOtForm({ name: '', type: '', base_price: '', status: 'Active', equipmentStr: '' }); setShowOTModal(true); }}>
                        <i className="fa-solid fa-scissors me-2"></i> Add OT Room
                    </button>
                </div>
            </div>

            {/* QUICK STATS ROW */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-primary border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Total IPD Rooms</h6>
                        <h3 className="fw-bold mb-0 text-dark">{stats.totalRooms}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-success border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Available Rooms</h6>
                        <h3 className="fw-bold mb-0 text-success">{stats.availableRooms}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-info border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Total OTs</h6>
                        <h3 className="fw-bold mb-0 text-dark">{stats.totalOTs}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-warning border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Active OTs</h6>
                        <h3 className="fw-bold mb-0 text-warning">{stats.activeOTs}</h3>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION & SEARCH */}
            <div className="card-common bg-white shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="row align-items-center g-3">
                    <div className="col-md-6">
                        <ul className="nav nav-pills d-inline-flex bg-light p-1 rounded-4 border">
                            <li className="nav-item">
                                <button className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'rooms' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`} onClick={() => { setActiveTab('rooms'); setSearchTerm(''); }}>
                                    <i className="fa-solid fa-bed-pulse me-2"></i> IPD Rooms & Wards
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'ots' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`} onClick={() => { setActiveTab('ots'); setSearchTerm(''); }}>
                                    <i className="fa-solid fa-heart-pulse me-2"></i> Operation Theaters
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light rounded-end-pill" placeholder={`Search ${activeTab === 'rooms' ? 'Rooms' : 'Operation Theaters'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN TABLES */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : activeTab === 'rooms' ? (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">Room & Category</th>
                                    <th>Rent Per Day</th>
                                    <th>Facilities (Count)</th>
                                    <th>Current Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.map(room => (
                                    <tr key={room.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className={`bg-${room.is_available ? 'success' : 'danger'} bg-opacity-10 text-${room.is_available ? 'success' : 'danger'} rounded-circle d-flex justify-content-center align-items-center fw-bold me-3 border border-${room.is_available ? 'success' : 'danger'} border-opacity-25`} style={{width:'45px', height:'45px'}}>
                                                    <i className="fa-solid fa-bed"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-6">{room.room_number}</div>
                                                    <div className="small text-muted">{room.room_category} | {room.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">₹ {Number(room.room_rent_per_day).toLocaleString('en-IN')}</div>
                                        </td>
                                        <td>
                                            <div className="small fw-bold text-dark">{room.facilities?.length || 0} Facilities Included</div>
                                        </td>
                                        <td>
                                            {room.is_available ? (
                                                <span className="badge rounded-pill bg-success px-3"><i className="fa-solid fa-check me-1"></i> Available</span>
                                            ) : (
                                                <div>
                                                    <span className="badge rounded-pill bg-danger px-3 mb-1"><i className="fa-solid fa-lock me-1"></i> Occupied</span>
                                                    <div className="small text-muted fw-bold">UHID: {room.allocated_patient_id}</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-primary rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => setViewData({ show: true, type: 'room', data: room })} title="View Room"><i className="fa-solid fa-eye"></i></button>
                                            <button className="btn btn-sm btn-outline-info rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => handleEditRoom(room)} title="Edit Room"><i className="fa-solid fa-pen"></i></button>
                                            <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDeleteRoom(room.id)} title="Delete Room" disabled={!room.is_available}><i className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRooms.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No rooms found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">Operation Theater</th>
                                    <th>OT Category</th>
                                    <th>Base Rent (₹)</th>
                                    <th>Status</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOTs.map(ot => (
                                    <tr key={ot.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm border border-primary border-opacity-25" style={{width:'45px', height:'45px'}}>
                                                    <i className="fa-solid fa-scissors"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-6">{ot.name}</div>
                                                    <div className="small text-muted">{ot.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{ot.type}</div>
                                            <div className="small text-muted">{ot.equipment?.length || 0} Equipments</div>
                                        </td>
                                        <td><div className="fw-bold text-success">₹ {Number(ot.base_price).toLocaleString('en-IN')}</div></td>
                                        <td>
                                            <span className={`badge rounded-pill ${ot.status === 'Active' ? 'bg-primary' : 'bg-secondary'}`}>{ot.status}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-primary rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => setViewData({ show: true, type: 'ot', data: ot })} title="View OT"><i className="fa-solid fa-eye"></i></button>
                                            <button className="btn btn-sm btn-outline-info rounded-circle me-2" style={{width: '32px', height: '32px'}} onClick={() => handleEditOT(ot)} title="Edit OT"><i className="fa-solid fa-pen"></i></button>
                                            <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDeleteOT(ot.id)} title="Delete OT"><i className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOTs.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No Operation Theaters found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL: ADD / EDIT ROOM
            ========================================= */}
            {showRoomModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden bg-light">
                            <div className="modal-header bg-primary text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-bed me-2"></i> {editingId ? 'Edit IPD Room' : 'Add New IPD Room'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRoomModal(false)}></button>
                            </div>
                            <form onSubmit={handleRoomSubmit}>
                                <div className="modal-body p-4 bg-white">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Room Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control rounded-3" value={roomForm.room_number} required onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} placeholder="e.g. ICU-101"/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Room Category <span className="text-danger">*</span></label>
                                            <select className="form-select rounded-3" value={roomForm.room_category} required onChange={e => setRoomForm({ ...roomForm, room_category: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {ROOM_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Rent Per Day (₹) <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control rounded-3" value={roomForm.room_rent_per_day} required onChange={e => setRoomForm({ ...roomForm, room_rent_per_day: e.target.value })} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted d-block">Room Status</label>
                                            <div className="form-check form-switch pt-2">
                                                <input className="form-check-input" type="checkbox" role="switch" id="roomAvail" checked={roomForm.is_available} onChange={() => setRoomForm({ ...roomForm, is_available: !roomForm.is_available })} />
                                                <label className="form-check-label fw-bold" htmlFor="roomAvail">{roomForm.is_available ? 'Available' : 'Occupied'}</label>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small fw-bold text-muted">Facilities Included (Comma Separated)</label>
                                            <textarea className="form-control rounded-3" rows="3" value={roomForm.facilitiesStr} onChange={e => setRoomForm({ ...roomForm, facilitiesStr: e.target.value })} placeholder="AC, TV, Attached Bath..."></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowRoomModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" disabled={isSaving}>
                                        <i className="fa-solid fa-check me-2"></i> {isSaving ? "Saving..." : "Save Room"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: ADD / EDIT OPERATION THEATER
            ========================================= */}
            {showOTModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden bg-light">
                            <div className="modal-header bg-dark text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-scissors me-2"></i> {editingId ? 'Edit Operation Theater' : 'Add New Operation Theater'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOTModal(false)}></button>
                            </div>
                            <form onSubmit={handleOTSubmit}>
                                <div className="modal-body p-4 bg-white">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">OT Name / Number <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control rounded-3" value={otForm.name} required onChange={e => setOtForm({ ...otForm, name: e.target.value })} placeholder="e.g. Major OT-1"/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">OT Category <span className="text-danger">*</span></label>
                                            <select className="form-select rounded-3" value={otForm.type} required onChange={e => setOtForm({ ...otForm, type: e.target.value })}>
                                                <option value="">Select Category</option>
                                                {OT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Base Rent (₹) <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control rounded-3" value={otForm.base_price} required onChange={e => setOtForm({ ...otForm, base_price: e.target.value })} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Status <span className="text-danger">*</span></label>
                                            <select className="form-select rounded-3" value={otForm.status} onChange={e => setOtForm({ ...otForm, status: e.target.value })}>
                                                <option value="Active">Active</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small fw-bold text-muted">Equipment List (Comma Separated)</label>
                                            <textarea className="form-control rounded-3" rows="3" value={otForm.equipmentStr} onChange={e => setOtForm({ ...otForm, equipmentStr: e.target.value })} placeholder="C-Arm, Ventilator, Anesthesia Machine..."></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowOTModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-dark fw-bold px-4 rounded-pill shadow-sm" disabled={isSaving}>
                                        <i className="fa-solid fa-check me-2"></i> {isSaving ? "Saving..." : "Save OT"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: VIEW FACILITY (READ ONLY)
            ========================================= */}
            {viewData.show && viewData.data && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className={`modal-header border-bottom-0 p-4 ${viewData.type === 'room' ? 'bg-primary' : 'bg-dark'} text-white`}>
                                <h5 className="modal-title fw-bold">
                                    <i className={`fa-solid ${viewData.type === 'room' ? 'fa-bed' : 'fa-scissors'} me-2`}></i> 
                                    {viewData.type === 'room' ? 'Room Details' : 'OT Details'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setViewData({ show: false, type: null, data: null })}></button>
                            </div>
                            <div className="modal-body p-4 bg-white">
                                <div className="text-center mb-4">
                                    <h3 className="fw-bold text-dark mb-1">{viewData.type === 'room' ? viewData.data.room_number : viewData.data.name}</h3>
                                    <p className="text-muted mb-0">{viewData.data.id}</p>
                                    <span className={`badge rounded-pill mt-2 px-3 ${viewData.type === 'room' ? 'bg-info' : 'bg-secondary'}`}>
                                        {viewData.type === 'room' ? viewData.data.room_category : viewData.data.type}
                                    </span>
                                </div>

                                <div className="bg-light p-3 rounded-4 border">
                                    <div className="row g-3">
                                        <div className="col-6 border-bottom pb-2">
                                            <small className="text-muted fw-bold d-block mb-1">Base Price / Rent</small>
                                            <span className="text-success fw-bold fs-5">₹{viewData.type === 'room' ? viewData.data.room_rent_per_day : viewData.data.base_price}</span>
                                        </div>
                                        <div className="col-6 border-bottom pb-2">
                                            <small className="text-muted fw-bold d-block mb-1">Current Status</small>
                                            {viewData.type === 'room' ? (
                                                <span className={`badge ${viewData.data.is_available ? 'bg-success' : 'bg-danger'}`}>{viewData.data.is_available ? 'Available' : 'Occupied'}</span>
                                            ) : (
                                                <span className={`badge ${viewData.data.status === 'Active' ? 'bg-primary' : 'bg-warning text-dark'}`}>{viewData.data.status}</span>
                                            )}
                                        </div>
                                        
                                        {viewData.type === 'room' && !viewData.data.is_available && (
                                            <div className="col-12 border-bottom pb-2">
                                                <small className="text-muted fw-bold d-block mb-1">Allocated Patient ID</small>
                                                <span className="text-danger fw-bold"><i className="fa-solid fa-user-injured me-2"></i>{viewData.data.allocated_patient_id}</span>
                                            </div>
                                        )}

                                        <div className="col-12 pt-2">
                                            <small className="text-muted fw-bold d-block mb-2">{viewData.type === 'room' ? 'Included Facilities' : 'Available Equipment'}</small>
                                            <div className="d-flex flex-wrap gap-2">
                                                {(viewData.type === 'room' ? viewData.data.facilities : viewData.data.equipment)?.map((item, idx) => (
                                                    <span key={idx} className="badge bg-white text-dark border border-secondary text-wrap" style={{lineHeight: '1.5'}}>{item}</span>
                                                ))}
                                                {!(viewData.type === 'room' ? viewData.data.facilities : viewData.data.equipment)?.length && <span className="text-muted small fst-italic">None listed.</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 bg-white">
                                <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold w-100" onClick={() => setViewData({ show: false, type: null, data: null })}>Close Overview</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FacilityMaster;