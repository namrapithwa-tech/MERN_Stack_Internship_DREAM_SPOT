import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterDoctor, setFilterDoctor] = useState('');
    const [doctors, setDoctors] = useState([]);
    
    // Stats State
    const [stats, setStats] = useState({ today: 0, pending: 0, completed: 0 });

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appRes, docRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/doctors')
            ]);
            
            setAppointments(appRes.data);
            setDoctors(docRes.data);
            calculateStats(appRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error loading data", err);
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const todayStr = new Date().toISOString().split('T')[0];
        setStats({
            today: data.filter(a => a.date === todayStr).length,
            pending: data.filter(a => a.status === 'PENDING').length,
            completed: data.filter(a => a.status === 'CONFIRMED').length
        });
    };

    // --- LOGIC: CONFIRM APPOINTMENT ---
    const handleConfirm = (appointment) => {
        // We pass the appointment data to the Walk-In form via state
        navigate('/registration/walkin', { state: { appointmentData: appointment } });
    };

    const handleCancel = async (id) => {
        if(window.confirm("Are you sure you want to cancel this appointment?")) {
            await api.patch(`/appointments/${id}`, { status: 'CANCELLED' });
            fetchData();
        }
    };

    // Filtering Logic
    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              app.phone.includes(searchTerm) || 
                              app.id.includes(searchTerm);
        const matchesDate = filterDate ? app.date === filterDate : true;
        const matchesDoctor = filterDoctor ? app.doctorId === filterDoctor : true;
        return matchesSearch && matchesDate && matchesDoctor;
    });

    if (loading) return <div className="text-center p-5 mt-5"><div className="spinner-border text-primary" style={{width:'3rem', height:'3rem'}}></div></div>;

    return (
        <div className="container-fluid py-4">
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-calendar-check text-primary me-2"></i> Appointments Manager
                    </h2>
                    <p className="text-muted mb-0 mt-1">Review, confirm, or cancel upcoming patient appointments.</p>
                </div>
            </div>

            {/* STATS CARDS (NEW UI) */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Today's Appointments</h6>
                                <h2 className="fw-bold mb-0">{stats.today} <span className="fs-6 fw-normal opacity-75">Scheduled</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3"><i className="fa-solid fa-calendar-day"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #d39e00 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Pending Requests</h6>
                                <h2 className="fw-bold mb-0 text-dark">{stats.pending} <span className="fs-6 fw-normal text-dark opacity-75">To Verify</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3 text-dark"><i className="fa-solid fa-clock"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common rounded-4 shadow-sm border-0 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #198754 0%, #146c43 100%)' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase fw-bold text-white-50 mb-1" style={{fontSize: '12px'}}>Confirmed Patients</h6>
                                <h2 className="fw-bold mb-0">{stats.completed} <span className="fs-6 fw-normal opacity-75">Ready</span></h2>
                            </div>
                            <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3"><i className="fa-solid fa-check-double"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-3 mb-4">
                <div className="row g-3 align-items-center">
                    <div className="col-lg-5 col-md-12">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-pill"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 bg-light rounded-end-pill" placeholder="Search by Name, Phone, ID..." onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <input type="date" className="form-control rounded-pill bg-light text-muted fw-bold" onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <select className="form-select rounded-pill bg-light text-muted fw-bold" onChange={(e) => setFilterDoctor(e.target.value)}>
                            <option value="">Filter By Doctor</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.full_name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Appt ID</th>
                                <th>Patient Detail</th>
                                <th>Consultant</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                <th className="text-center pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                                <tr key={app.id}>
                                    <td className="ps-4 fw-bold text-primary">{app.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex justify-content-center align-items-center fw-bold me-3" style={{width:'40px', height:'40px', fontSize: '16px'}}>
                                                {(app.name || 'P').charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">{app.name}</div>
                                                <div className="small text-muted">{app.phone} | {app.age} Y, {app.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{app.doctorName}</div>
                                        <small className="badge bg-info bg-opacity-10 text-info rounded-pill">{app.department}</small>
                                    </td>
                                    <td>
                                        <div className="small fw-bold text-dark"><i className="fa-regular fa-calendar me-1 text-primary"></i> {app.date}</div>
                                        <div className="small text-muted"><i className="fa-regular fa-clock me-1"></i> {app.time}</div>
                                    </td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 ${app.status === 'PENDING' ? 'bg-warning text-dark' : app.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="text-center pe-4">
                                        {app.status === 'PENDING' && (
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleConfirm(app)}>Verify</button>
                                                <button className="btn btn-sm btn-outline-danger rounded-circle" style={{width:'32px', height:'32px'}} onClick={() => handleCancel(app.id)} title="Cancel">
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        )}
                                        {app.status === 'CONFIRMED' && <span className="text-success fw-bold small"><i className="fa-solid fa-check-double me-1"></i>Verified</span>}
                                        {app.status === 'CANCELLED' && <span className="text-danger fw-bold small"><i className="fa-solid fa-ban me-1"></i>Cancelled</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">No appointments found matching your filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Appointments;