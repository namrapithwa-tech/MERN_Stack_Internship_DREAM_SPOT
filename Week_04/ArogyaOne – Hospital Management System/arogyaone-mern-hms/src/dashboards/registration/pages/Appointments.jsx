import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { Modal } from 'bootstrap';

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

    if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid">
            {/* STATS CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-calendar-day text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Today's Appointments</h6><h3 className="fw-bold mb-0">{stats.today}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-clock text-warning fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Pending Requests</h6><h3 className="fw-bold mb-0">{stats.pending}</h3></div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common d-flex align-items-center bg-white p-3">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-check-double text-success fs-4"></i></div>
                        <div><h6 className="text-muted mb-0">Confirmed Patients</h6><h3 className="fw-bold mb-0">{stats.completed}</h3></div>
                    </div>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="card-common bg-white p-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text bg-transparent border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0" placeholder="Search Name, Phone, ID..." onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <input type="date" className="form-control" onChange={(e) => setFilterDate(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                        <select className="form-select" onChange={(e) => setFilterDoctor(e.target.value)}>
                            <option value="">Filter By Doctor</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden">
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Appt ID</th>
                            <th>Patient Detail</th>
                            <th>Consultant</th>
                            <th>Schedule</th>
                            <th>Status</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                            <tr key={app.id}>
                                <td className="ps-4 fw-bold text-primary">{app.id}</td>
                                <td>
                                    <div className="fw-bold">{app.name}</div>
                                    <small className="text-muted">{app.phone} | {app.age} Y, {app.gender}</small>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">{app.doctorName}</div>
                                    <small className="badge bg-info bg-opacity-10 text-info">{app.department}</small>
                                </td>
                                <td>
                                    <div className="small fw-bold text-muted"><i className="fa-regular fa-calendar me-1"></i> {app.date}</div>
                                    <div className="small text-uppercase"><i className="fa-regular fa-clock me-1"></i> {app.time}</div>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill ${app.status === 'PENDING' ? 'bg-warning text-dark' : app.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="text-center">
                                    {app.status === 'PENDING' && (
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn btn-sm btn-success px-3" onClick={() => handleConfirm(app)}>Confirm</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(app.id)}><i className="fa-solid fa-xmark"></i></button>
                                        </div>
                                    )}
                                    {app.status === 'CONFIRMED' && <button className="btn btn-sm btn-light" disabled>Verified</button>}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-5 text-muted">No appointments found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments;