import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios'; // Adjust path based on your folder structure

const SurgeryDashboard = () => {
    // --- State Management ---
    const [schedules, setSchedules] = useState([]);
    const [otRooms, setOtRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [schedRes, otRes] = await Promise.all([
                api.get('/surgery_schedules').catch(() => ({ data: [] })),
                api.get('/operation_theaters').catch(() => ({ data: [] }))
            ]);

            setSchedules(schedRes.data || []);
            setOtRooms(otRes.data || []);
        } catch (error) {
            console.error("Error fetching Surgery Dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Date Helper Utilities ---
    // Safely get local YYYY-MM-DD string to prevent UTC timezone shift bugs
    const getLocalYYYYMMDD = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const now = new Date();
    const todayStr = getLocalYYYYMMDD(now);

    // --- Live Calculations ---
    const surgeriesToday = schedules.filter(s => 
        s.schedule_date && s.schedule_date.startsWith(todayStr)
    );

    const completedTodayCount = surgeriesToday.filter(s => s.status === 'Completed').length;

    // Pending Logs: Surgeries that are 'Scheduled' but their time has already passed
    const pendingLogsCount = schedules.filter(s => {
        if (s.status !== 'Scheduled') return false;
        const scheduleTime = new Date(s.schedule_date);
        return scheduleTime < now; 
    }).length;

    const availableOTsCount = otRooms.length;

    // --- Upcoming 7-Day Calendar Generation ---
    const upcomingDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const targetDateStr = getLocalYYYYMMDD(d);
        
        const countForDay = schedules.filter(s => s.schedule_date?.startsWith(targetDateStr)).length;
        
        upcomingDays.push({
            dateStr: targetDateStr,
            dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
            displayDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            count: countForDay,
            isToday: i === 0
        });
    }

    // --- Helpers ---
    const getStatusBadge = (status) => {
        switch(status) {
            case 'Scheduled': return <span className="badge bg-primary rounded-pill px-3 py-1"><i className="fa-regular fa-clock me-1"></i>Scheduled</span>;
            case 'Completed': return <span className="badge bg-success rounded-pill px-3 py-1"><i className="fa-solid fa-check-double me-1"></i>Completed</span>;
            case 'Cancelled': return <span className="badge bg-danger rounded-pill px-3 py-1"><i className="fa-solid fa-ban me-1"></i>Cancelled</span>;
            default: return <span className="badge bg-secondary rounded-pill px-3 py-1">{status}</span>;
        }
    };

    if (loading) {
        return <div className="text-center p-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>;
    }

    return (
        <div className="container-fluid py-4">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-heart-pulse text-danger me-2"></i> OT Command Center
                    </h2>
                    <p className="text-muted mb-0 mt-1">Live Operation Theater tracking and upcoming schedules.</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-4 shadow-sm" onClick={fetchDashboardData}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Live Data
                </button>
            </div>

            {/* --- STAT CARDS ROW --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-primary border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-calendar-day text-primary fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Surgeries Today</h6>
                            <h3 className="fw-bold mb-0 text-dark">{surgeriesToday.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-success border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-clipboard-check text-success fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Completed Today</h6>
                            <h3 className="fw-bold mb-0 text-dark">{completedTodayCount}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-danger border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-triangle-exclamation text-danger fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Pending Logs</h6>
                            <h3 className="fw-bold mb-0 text-dark">{pendingLogsCount}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-info border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-bed-pulse text-info fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Available OTs</h6>
                            <h3 className="fw-bold mb-0 text-dark">{availableOTsCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- UPCOMING 7-DAY CALENDAR STRIP --- */}
            <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-calendar-week text-primary me-2"></i> Upcoming 7-Day Overview</h6>
                <div className="d-flex overflow-auto gap-3 pb-2" style={{ scrollbarWidth: 'thin' }}>
                    {upcomingDays.map((day, index) => (
                        <div 
                            key={index} 
                            className={`card-common flex-shrink-0 text-center rounded-4 shadow-sm border-0 p-3 ${day.isToday ? 'bg-primary text-white' : 'bg-white'}`}
                            style={{ width: '140px' }}
                        >
                            <h6 className={`fw-bold mb-1 ${day.isToday ? 'text-white' : 'text-muted'}`}>{day.dayName}</h6>
                            <h5 className="fw-bold mb-2">{day.displayDate}</h5>
                            <span className={`badge rounded-pill ${day.isToday ? 'bg-light text-primary' : 'bg-light text-dark border'}`}>
                                {day.count} {day.count === 1 ? 'Surgery' : 'Surgeries'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MAIN LAYOUT ROW --- */}
            <div className="row g-4">
                
                {/* Left Column: Today's OT Timeline */}
                <div className="col-lg-8">
                    <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-list-check text-danger me-2"></i> Today's OT Room Timeline</h6>
                    
                    {otRooms.length === 0 ? (
                        <div className="card-common bg-white p-5 text-center shadow-sm border-0 rounded-4">
                            <p className="text-muted fst-italic mb-0">No Operation Theaters configured in the database.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {otRooms.map(room => {
                                // Filter and sort today's surgeries for THIS specific room
                                const roomSchedules = surgeriesToday
                                    .filter(s => s.ot_room_id === room.id)
                                    .sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date));

                                return (
                                    <div key={room.id} className="card-common bg-white shadow-sm border-0 rounded-4 overflow-hidden">
                                        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold m-0 text-dark">
                                                <i className="fa-solid fa-door-open text-primary me-2"></i> {room.name} <span className="fw-normal text-muted small ms-1">({room.type})</span>
                                            </h6>
                                            <span className="badge bg-secondary rounded-pill">{roomSchedules.length} Bookings</span>
                                        </div>
                                        <div className="p-0">
                                            {roomSchedules.length === 0 ? (
                                                <div className="p-4 text-center text-muted fst-italic bg-white">
                                                    <i className="fa-regular fa-circle-check fs-4 mb-2 text-success opacity-50"></i>
                                                    <br />
                                                    Room Available / No surgeries booked today.
                                                </div>
                                            ) : (
                                                <ul className="list-group list-group-flush">
                                                    {roomSchedules.map(surgery => (
                                                        <li key={surgery.id} className="list-group-item p-3 d-flex justify-content-between align-items-center border-bottom-0 border-top bg-white">
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-4 text-center" style={{ minWidth: '80px' }}>
                                                                    <span className="fw-bold text-primary fs-5 d-block">
                                                                        {new Date(surgery.schedule_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                    <span className="small text-muted fw-bold d-block mt-1">
                                                                        <i className="fa-solid fa-hourglass-half me-1"></i> {surgery.estimated_duration}
                                                                    </span>
                                                                </div>
                                                                <div style={{ borderLeft: '3px solid #dee2e6', paddingLeft: '20px' }}>
                                                                    <h6 className="fw-bold text-dark mb-1">{surgery.surgery_name}</h6>
                                                                    <div className="text-muted small mb-1">
                                                                        <span className="fw-bold text-secondary">Patient:</span> {surgery.patient_name} (UHID: {surgery.patient_id})
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        <span className="fw-bold text-secondary">Surgeon:</span> <i className="fa-solid fa-user-doctor me-1"></i> {surgery.primary_surgeon}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                {getStatusBadge(surgery.status)}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Quick Links */}
                <div className="col-lg-4">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 sticky-top" style={{ top: '20px' }}>
                        <h6 className="fw-bold text-dark mb-4"><i className="fa-solid fa-bolt text-warning me-2"></i> Quick Actions</h6>
                        
                        <div className="d-flex flex-column gap-3">
                            <Link to="/surgery/schedule" className="btn btn-lg btn-outline-primary rounded-4 d-flex justify-content-between align-items-center p-3 border-2 fw-bold text-start shadow-sm transition-all hover-lift">
                                <div>
                                    <i className="fa-solid fa-calendar-plus fs-4 me-3 align-middle text-primary"></i>
                                    Book New Surgery
                                </div>
                                <i className="fa-solid fa-chevron-right opacity-50"></i>
                            </Link>

                            <Link to="/surgery/logs" className="btn btn-lg btn-outline-danger rounded-4 d-flex justify-content-between align-items-center p-3 border-2 fw-bold text-start shadow-sm transition-all hover-lift">
                                <div>
                                    <i className="fa-solid fa-notes-medical fs-4 me-3 align-middle text-danger"></i>
                                    Pending Post-Op Logs
                                    {pendingLogsCount > 0 && (
                                        <span className="badge bg-danger rounded-pill ms-2">{pendingLogsCount}</span>
                                    )}
                                </div>
                                <i className="fa-solid fa-chevron-right opacity-50"></i>
                            </Link>
                        </div>

                        <div className="mt-4 pt-4 border-top">
                            <h6 className="fw-bold text-muted mb-3 text-uppercase" style={{fontSize: '12px'}}>System Status</h6>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="small text-dark fw-bold">Live Data Sync</span>
                                <span className="badge bg-success bg-opacity-25 text-success rounded-pill"><i className="fa-solid fa-circle-check me-1"></i> Active</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="small text-dark fw-bold">OT Database</span>
                                <span className="badge bg-primary bg-opacity-25 text-primary rounded-pill"><i className="fa-solid fa-database me-1"></i> Connected</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SurgeryDashboard;