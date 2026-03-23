import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../../assets/images/logo.png';

const DEPARTMENTS = ["Physician", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "ENT", "General Surgery", "Urology", "Radiology", "Anesthesiology", "Pathology", "Emergency Medicine"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const LANGUAGES = ["Gujarati", "Hindi", "English"];
const ROLES = ["ADMIN", "REGISTRATION", "BILLING", "LAB", "SURGERY"];

const StaffManagement = () => {
    // --- STATE ---
    const [doctors, setDoctors] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'staff'
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterRole, setFilterRole] = useState('');

    // Doctor Modal State
    const [showDocModal, setShowDocModal] = useState(false);
    const [editingDocId, setEditingDocId] = useState(null);
    const initialDocState = {
        full_name: "", email: "", department: "", qualification: "", experience_years: "",
        languages_spoken: [], available_days: [], opd_timings: { morning: "", evening: "" },
        consultation_fee: "", salary: "", introduction: "", doctor_image: "", is_available: true
    };
    const [docForm, setDocForm] = useState(initialDocState);
    const [docPassword, setDocPassword] = useState("doctor123");

    // Staff Modal State
    const [showStaffModal, setShowStaffModal] = useState(false);
    const initialStaffState = { name: "", email: "", password: "", role: "REGISTRATION" };
    const [staffForm, setStaffForm] = useState(initialStaffState);

    // View Modal State
    const [viewData, setViewData] = useState({ show: false, type: null, data: null });
    
    // Print State
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();

    // --- FETCH DATA ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docRes, userRes] = await Promise.all([
                api.get('/doctors'),
                api.get('/users')
            ]);
            setDoctors(docRes.data || []);
            setUsers(userRes.data || []);
        } catch (error) {
            console.error("Error fetching staff data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC ---
    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDept ? doc.department === filterDept : true;
        return matchesSearch && matchesDept;
    });

    const filteredStaff = users.filter(u => u.role !== 'DOCTOR').filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole ? user.role === filterRole : true;
        return matchesSearch && matchesRole;
    });

    // --- CSV EXPORT LOGIC ---
    const exportToCSV = () => {
        let headers = [];
        let csvRows = [];
        let filename = "";

        if (activeTab === 'doctors') {
            headers = ["Doctor ID", "Full Name", "Email", "Department", "Qualifications", "Experience (Years)", "Available Days", "Consultation Fee", "Status"];
            csvRows = filteredDoctors.map(doc => {
                const days = doc.available_days ? doc.available_days.join(' | ') : 'N/A';
                const status = doc.is_available ? 'Available' : 'Unavailable';
                return `"${doc.id}","${doc.full_name}","${doc.email}","${doc.department}","${doc.qualification}","${doc.experience_years}","${days}","${doc.consultation_fee}","${status}"`;
            });
            filename = `ArogyaOne_Doctors_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            headers = ["User ID", "Full Name", "Role", "Email", "Linked ID"];
            csvRows = filteredStaff.map(user => {
                return `"${user.id}","${user.name}","${user.role}","${user.email}","${user.linked_id || 'N/A'}"`;
            });
            filename = `ArogyaOne_Staff_${new Date().toISOString().split('T')[0]}.csv`;
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

    // --- DOCTOR LOGIC ---
    const handleAddDocClick = () => {
        setEditingDocId(null);
        setDocForm(initialDocState);
        setDocPassword("doctor123");
        setShowDocModal(true);
    };

    const handleEditDocClick = (doc) => {
        setEditingDocId(doc.id);
        setDocForm({
            ...doc,
            opd_timings: doc.opd_timings || { morning: "", evening: "" },
            languages_spoken: doc.languages_spoken || [],
            available_days: doc.available_days || []
        });
        setShowDocModal(true);
    };

    const toggleArrayValue = (field, value) => {
        setDocForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleDocSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingDocId) {
                await api.put(`/doctors/${editingDocId}`, docForm);
                const userMatch = users.find(u => u.linked_id === editingDocId);
                if (userMatch) {
                    await api.patch(`/users/${userMatch.id}`, { name: docForm.full_name, email: docForm.email });
                }
                alert("Doctor updated successfully!");
            } else {
                const doctorId = `D-${new Date().getFullYear()}-${Date.now()}`;
                const newDocData = {
                    id: doctorId,
                    ...docForm,
                    doctor_image: docForm.doctor_image || `media/doctors/${doctorId}.jpg`
                };
                
                await api.post("/doctors", newDocData);
                await api.post("/users", {
                    id: `U-${Date.now()}`,
                    email: docForm.email,
                    password: docPassword,
                    role: "DOCTOR",
                    name: docForm.full_name,
                    linked_id: doctorId
                });
                alert("Doctor created and login access granted!");
            }
            setShowDocModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving doctor:", error);
            alert("Failed to save doctor details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDoctor = async (doc) => {
        if(window.confirm(`Are you sure you want to remove ${doc.full_name}? This will also revoke their login access.`)) {
            try {
                await api.delete(`/doctors/${doc.id}`);
                const userMatch = users.find(u => u.linked_id === doc.id);
                if(userMatch) await api.delete(`/users/${userMatch.id}`);
                fetchData();
            } catch (err) {
                alert("Failed to delete doctor.");
            }
        }
    };

    // --- STAFF LOGIC ---
    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                id: `U-${Date.now()}`,
                email: staffForm.email,
                password: staffForm.password,
                role: staffForm.role,
                name: staffForm.name,
                linked_id: `STAFF-${Date.now()}`
            };
            await api.post('/users', payload);
            alert(`${staffForm.role} User created successfully!`);
            setShowStaffModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Failed to create user.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if(user.role === 'ADMIN') {
            alert("Cannot delete an ADMIN from this panel.");
            return;
        }
        if(window.confirm(`Are you sure you want to revoke system access for ${user.name}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                fetchData();
            } catch (err) {
                alert("Failed to delete user.");
            }
        }
    };

    // --- PRINT ID LOGIC ---
    const handlePrintID = (data, type) => {
        setPrintData({ data, type });
        setIsPrinting(true);
        
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current, { scale: 3, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('l', 'mm', [85.6, 53.98]); // Standard CR80 ID Card
                pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
                pdf.save(`ID_Card_${data.id}.pdf`);
            } catch (err) {
                console.error("Print Error", err);
                alert("Failed to generate ID Card.");
            } finally {
                setIsPrinting(false);
                setPrintData(null);
            }
        }, 500); // Give DOM time to render the hidden card
    };


    // --- RENDER ---
    return (
        <div className="container-fluid py-4">
            
            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-users-gear text-primary me-2"></i> HR & Staff Management
                    </h2>
                    <p className="text-muted mb-0 mt-1">Manage clinical doctors, administrative staff, and system access.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-dark fw-bold rounded-pill px-3 shadow-sm" onClick={exportToCSV}>
                        <i className="fa-solid fa-file-csv me-2"></i> Export Data
                    </button>
                    <button className="btn btn-outline-primary fw-bold rounded-pill px-3 shadow-sm" onClick={handleAddDocClick}>
                        <i className="fa-solid fa-user-doctor me-2"></i> Add Doctor
                    </button>
                    <button className="btn btn-primary fw-bold rounded-pill px-3 shadow-sm" onClick={() => { setStaffForm(initialStaffState); setShowStaffModal(true); }}>
                        <i className="fa-solid fa-user-plus me-2"></i> Add Staff
                    </button>
                </div>
            </div>

            {/* QUICK STATS ROW */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-primary border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Total Doctors</h6>
                        <h3 className="fw-bold mb-0 text-dark">{doctors.length}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-success border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Available Doctors Now</h6>
                        <h3 className="fw-bold mb-0 text-success">{doctors.filter(d => d.is_available).length}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 border-start border-info border-5 h-100">
                        <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Total Support Staff</h6>
                        <h3 className="fw-bold mb-0 text-dark">{users.filter(u => u.role !== 'DOCTOR').length}</h3>
                    </div>
                </div>
            </div>

            {/* TAB NAVIGATION & FILTERS */}
            <div className="card-common bg-white shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="row align-items-center g-3">
                    <div className="col-lg-5 col-md-12">
                        <ul className="nav nav-pills d-inline-flex bg-light p-1 rounded-4 border w-100">
                            <li className="nav-item flex-fill text-center">
                                <button className={`nav-link w-100 rounded-4 fw-bold px-3 ${activeTab === 'doctors' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`} onClick={() => { setActiveTab('doctors'); setSearchTerm(''); }}>
                                    <i className="fa-solid fa-user-md me-2"></i> Doctors Database
                                </button>
                            </li>
                            <li className="nav-item flex-fill text-center">
                                <button className={`nav-link w-100 rounded-4 fw-bold px-3 ${activeTab === 'staff' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`} onClick={() => { setActiveTab('staff'); setSearchTerm(''); }}>
                                    <i className="fa-solid fa-desktop me-2"></i> System Users
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light rounded-end-pill" placeholder={`Search ${activeTab === 'doctors' ? 'Doctors' : 'Staff'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        {activeTab === 'doctors' ? (
                            <select className="form-select rounded-pill bg-light" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        ) : (
                            <select className="form-select rounded-pill bg-light" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="">All Roles</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN TABLES */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                {loading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                ) : activeTab === 'doctors' ? (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">Doctor Profile</th>
                                    <th>Department & Qual.</th>
                                    <th>OPD Schedule</th>
                                    <th>Fee & Status</th>
                                    <th className="text-center pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDoctors.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm border border-primary border-opacity-25" style={{width:'45px', height:'45px', fontSize: '18px'}}>
                                                    {doc.full_name.charAt(4) || 'D'}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark fs-6">{doc.full_name}</div>
                                                    <div className="small text-muted">{doc.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{doc.department}</div>
                                            <div className="small text-muted">{doc.qualification} • {doc.experience_years} Yrs Exp</div>
                                        </td>
                                        <td>
                                            <div className="small fw-bold text-dark">{doc.available_days?.join(', ') || 'N/A'}</div>
                                            <div className="small text-muted">{doc.opd_timings?.morning} | {doc.opd_timings?.evening}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">₹{doc.consultation_fee}</div>
                                            <span className={`badge rounded-pill ${doc.is_available ? 'bg-success' : 'bg-danger'}`}>{doc.is_available ? 'Available' : 'Unavailable'}</span>
                                        </td>
                                        <td className="pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-outline-primary rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => setViewData({ show: true, type: 'doctor', data: doc })} title="View Profile"><i className="fa-solid fa-eye"></i></button>
                                                <button className="btn btn-sm btn-outline-dark rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handlePrintID(doc, 'doctor')} disabled={isPrinting} title="Print ID Card"><i className="fa-solid fa-id-badge"></i></button>
                                                <button className="btn btn-sm btn-outline-info rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleEditDocClick(doc)} title="Edit Doctor"><i className="fa-solid fa-pen"></i></button>
                                                <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDeleteDoctor(doc)} title="Revoke & Delete"><i className="fa-solid fa-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredDoctors.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No doctors found matching filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">User Profile</th>
                                    <th>System Role</th>
                                    <th>Login Email</th>
                                    <th>Linked ID</th>
                                    <th className="text-center pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map(user => (
                                    <tr key={user.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm border border-secondary border-opacity-25" style={{width:'45px', height:'45px', fontSize: '18px'}}>
                                                    {user.name.charAt(0) || 'U'}
                                                </div>
                                                <div className="fw-bold text-dark fs-6">{user.name}</div>
                                            </div>
                                        </td>
                                        <td><span className={`badge rounded-pill ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>{user.role}</span></td>
                                        <td className="text-muted fw-bold"><i className="fa-solid fa-envelope text-secondary me-2"></i>{user.email}</td>
                                        <td className="text-muted small">{user.linked_id || 'N/A'}</td>
                                        <td className="pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-sm btn-outline-primary rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => setViewData({ show: true, type: 'staff', data: user })} title="View Profile"><i className="fa-solid fa-eye"></i></button>
                                                <button className="btn btn-sm btn-outline-dark rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handlePrintID(user, 'staff')} disabled={isPrinting} title="Print ID Card"><i className="fa-solid fa-id-badge"></i></button>
                                                <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width: '32px', height: '32px'}} onClick={() => handleDeleteUser(user)} disabled={user.role === 'ADMIN'} title="Revoke Access"><i className="fa-solid fa-ban"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStaff.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">No staff found matching filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL: ADD / EDIT DOCTOR
            ========================================= */}
            {showDocModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden bg-light">
                            <div className="modal-header bg-primary text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-user-doctor me-2"></i> {editingDocId ? 'Edit Doctor Profile' : 'Register New Doctor'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDocModal(false)}></button>
                            </div>
                            <form onSubmit={handleDocSubmit}>
                                <div className="modal-body p-4 bg-white overflow-auto" style={{ maxHeight: '70vh' }}>
                                    
                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="fa-solid fa-address-card text-primary me-2"></i>Basic Information</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Full Name <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control rounded-3" value={docForm.full_name} required onChange={e => setDocForm({ ...docForm, full_name: e.target.value })} placeholder="Dr. John Doe"/>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Email (Login ID) <span className="text-danger">*</span></label>
                                            <input type="email" className="form-control rounded-3" value={docForm.email} required onChange={e => setDocForm({ ...docForm, email: e.target.value })} placeholder="doctor@arogyaone.com"/>
                                        </div>
                                        {!editingDocId && (
                                            <div className="col-md-4">
                                                <label className="form-label small fw-bold text-muted">System Password <span className="text-danger">*</span></label>
                                                <input type="text" className="form-control rounded-3 border-primary" value={docPassword} required onChange={e => setDocPassword(e.target.value)} />
                                            </div>
                                        )}
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Department <span className="text-danger">*</span></label>
                                            <select className="form-select rounded-3" value={docForm.department} required onChange={e => setDocForm({ ...docForm, department: e.target.value })}>
                                                <option value="">Select Department</option>
                                                {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Qualifications <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control rounded-3" value={docForm.qualification} required onChange={e => setDocForm({ ...docForm, qualification: e.target.value })} placeholder="MBBS, MD..."/>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Experience (Years) <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control rounded-3" value={docForm.experience_years} required onChange={e => setDocForm({ ...docForm, experience_years: e.target.value })} />
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="fa-solid fa-clock text-info me-2"></i>Schedule & Availability</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-12 mb-2">
                                            <label className="form-label small fw-bold text-muted d-block">Available Days</label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {DAYS.map(day => (
                                                    <div className="form-check" key={day}>
                                                        <input type="checkbox" className="form-check-input" id={`day-${day}`} checked={docForm.available_days?.includes(day)} onChange={() => toggleArrayValue("available_days", day)} />
                                                        <label className="form-check-label fw-bold" htmlFor={`day-${day}`}>{day}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Morning OPD Timings</label>
                                            <input type="text" className="form-control rounded-3" placeholder="e.g. 09:00 AM - 12:30 PM" value={docForm.opd_timings?.morning} onChange={e => setDocForm({ ...docForm, opd_timings: { ...docForm.opd_timings, morning: e.target.value } })} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Evening OPD Timings</label>
                                            <input type="text" className="form-control rounded-3" placeholder="e.g. 05:00 PM - 07:00 PM" value={docForm.opd_timings?.evening} onChange={e => setDocForm({ ...docForm, opd_timings: { ...docForm.opd_timings, evening: e.target.value } })} />
                                        </div>
                                        <div className="col-md-12 mt-3">
                                            <div className="form-check form-switch border p-3 rounded-3 bg-light d-inline-block">
                                                <input className="form-check-input ms-0 me-2" type="checkbox" role="switch" id="availSwitch" checked={docForm.is_available} onChange={() => setDocForm({ ...docForm, is_available: !docForm.is_available })} />
                                                <label className="form-check-label fw-bold text-dark" htmlFor="availSwitch">Doctor is currently accepting patients (Active Status)</label>
                                            </div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3"><i className="fa-solid fa-money-check-dollar text-success me-2"></i>Financials & Profile</h6>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Consultation Fee (₹) <span className="text-danger">*</span></label>
                                            <input type="number" className="form-control rounded-3" value={docForm.consultation_fee} required onChange={e => setDocForm({ ...docForm, consultation_fee: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Monthly Salary (₹)</label>
                                            <input type="number" className="form-control rounded-3" value={docForm.salary} onChange={e => setDocForm({ ...docForm, salary: e.target.value })} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted d-block">Languages Spoken</label>
                                            <div className="d-flex flex-wrap gap-3">
                                                {LANGUAGES.map(lang => (
                                                    <div className="form-check" key={lang}>
                                                        <input type="checkbox" className="form-check-input" id={`lang-${lang}`} checked={docForm.languages_spoken?.includes(lang)} onChange={() => toggleArrayValue("languages_spoken", lang)} />
                                                        <label className="form-check-label fw-bold small" htmlFor={`lang-${lang}`}>{lang}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small fw-bold text-muted">Profile Introduction / Bio</label>
                                            <textarea className="form-control rounded-3" rows="2" value={docForm.introduction} onChange={e => setDocForm({ ...docForm, introduction: e.target.value })} placeholder="Specialist in..."></textarea>
                                        </div>
                                    </div>

                                </div>
                                <div className="modal-footer bg-light border-top-0 p-3 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowDocModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" disabled={isSaving}>
                                        <i className="fa-solid fa-check me-2"></i> {isSaving ? "Saving..." : "Save Doctor Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: ADD SYSTEM USER (STAFF)
            ========================================= */}
            {showStaffModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-dark text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-user-plus me-2"></i> Add System User</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowStaffModal(false)}></button>
                            </div>
                            <form onSubmit={handleStaffSubmit}>
                                <div className="modal-body p-4 bg-white">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Full Name</label>
                                        <input type="text" className="form-control rounded-3" value={staffForm.name} required onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Login Email</label>
                                        <input type="email" className="form-control rounded-3" value={staffForm.email} required onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-muted">Login Password</label>
                                        <input type="text" className="form-control rounded-3" value={staffForm.password} required onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label fw-bold small text-muted">System Role <span className="text-danger">*</span></label>
                                        <select className="form-select rounded-3 border-primary fw-bold bg-light" value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}>
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3 border-top-0 rounded-bottom-4">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setShowStaffModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-dark fw-bold rounded-pill px-4 text-white shadow-sm" disabled={isSaving}>Create User Access</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: VIEW PROFILE (READ ONLY)
            ========================================= */}
            {viewData.show && viewData.data && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className={`modal-header border-bottom-0 p-4 ${viewData.type === 'doctor' ? 'bg-primary' : 'bg-dark'} text-white`}>
                                <h5 className="modal-title fw-bold">
                                    <i className={`fa-solid ${viewData.type === 'doctor' ? 'fa-user-doctor' : 'fa-user'} me-2`}></i> 
                                    {viewData.type === 'doctor' ? 'Doctor Profile' : 'Staff Profile'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setViewData({ show: false, type: null, data: null })}></button>
                            </div>
                            <div className="modal-body p-4 bg-white">
                                <div className="text-center mb-4">
                                    <div className={`d-inline-flex justify-content-center align-items-center rounded-circle mb-3 ${viewData.type === 'doctor' ? 'bg-primary text-primary' : 'bg-secondary text-secondary'} bg-opacity-10 fw-bold`} style={{width: '80px', height: '80px', fontSize: '32px'}}>
                                        {(viewData.data.full_name || viewData.data.name)?.charAt(viewData.type === 'doctor' ? 4 : 0) || 'U'}
                                    </div>
                                    <h4 className="fw-bold text-dark mb-1">{viewData.data.full_name || viewData.data.name}</h4>
                                    <p className="text-muted mb-0">{viewData.data.id}</p>
                                    <span className={`badge rounded-pill mt-2 px-3 ${viewData.type === 'doctor' ? 'bg-info' : 'bg-primary'}`}>
                                        {viewData.type === 'doctor' ? viewData.data.department : viewData.data.role}
                                    </span>
                                </div>

                                <div className="bg-light p-3 rounded-4 border">
                                    <div className="row g-3">
                                        <div className="col-12 border-bottom pb-2">
                                            <small className="text-muted fw-bold d-block mb-1">Email / Login ID</small>
                                            <span className="text-dark fw-bold"><i className="fa-solid fa-envelope me-2 text-secondary"></i>{viewData.data.email}</span>
                                        </div>
                                        
                                        {viewData.type === 'doctor' && (
                                            <>
                                                <div className="col-6 border-bottom pb-2">
                                                    <small className="text-muted fw-bold d-block mb-1">Qualifications</small>
                                                    <span className="text-dark fw-bold">{viewData.data.qualification}</span>
                                                </div>
                                                <div className="col-6 border-bottom pb-2">
                                                    <small className="text-muted fw-bold d-block mb-1">Experience</small>
                                                    <span className="text-dark fw-bold">{viewData.data.experience_years} Years</span>
                                                </div>
                                                <div className="col-12 border-bottom pb-2">
                                                    <small className="text-muted fw-bold d-block mb-1">OPD Schedule</small>
                                                    <span className="text-dark fw-bold">{viewData.data.available_days?.join(', ')}</span><br/>
                                                    <small className="text-muted">{viewData.data.opd_timings?.morning} | {viewData.data.opd_timings?.evening}</small>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted fw-bold d-block mb-1">Consultation Fee</small>
                                                    <span className="text-success fw-bold fs-5">₹{viewData.data.consultation_fee}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted fw-bold d-block mb-1">Status</small>
                                                    <span className={`badge ${viewData.data.is_available ? 'bg-success' : 'bg-danger'}`}>{viewData.data.is_available ? 'Available' : 'Unavailable'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN LAYOUT FOR PDF ID CARD GENERATION
            ========================================= */}
            {printData && printData.data && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <div ref={printRef} style={{ 
                        width: '323px', // ~85.6mm at 96dpi
                        height: '204px', // ~53.98mm at 96dpi
                        background: 'white',
                        border: `4px solid ${printData.type === 'doctor' ? '#0d6efd' : '#212529'}`,
                        borderRadius: '12px',
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        fontFamily: 'sans-serif'
                    }}>
                        {/* Left Side: Photo/Initials */}
                        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '2px dashed #ccc', paddingRight: '15px' }}>
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '50%', background: '#eee',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '28px', fontWeight: 'bold', color: '#888', marginBottom: '10px',
                                border: '2px solid #ccc'
                            }}>
                                {(printData.data.full_name || printData.data.name)?.charAt(printData.type === 'doctor' ? 4 : 0) || 'U'}
                            </div>
                            <img src={logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
                        </div>

                        {/* Right Side: Details */}
                        <div style={{ width: '70%', paddingLeft: '15px' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: printData.type === 'doctor' ? '#0d6efd' : '#212529' }}>
                                {printData.data.full_name || printData.data.name}
                            </h4>
                            
                            <div style={{ background: printData.type === 'doctor' ? '#0d6efd' : '#212529', color: 'white', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>
                                {printData.type === 'doctor' ? `DOCTOR - ${printData.data.department}` : `STAFF - ${printData.data.role}`}
                            </div>
                            
                            <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#555' }}><strong>EMP ID:</strong> {printData.data.id}</p>
                            {printData.type === 'doctor' && (
                                <p style={{ margin: '0', fontSize: '10px', color: '#777' }}>{printData.data.qualification}</p>
                            )}
                            <p style={{ margin: '10px 0 0 0', fontSize: '9px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '5px' }}>ArogyaOne Hospital Authorized Personnel</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StaffManagement;