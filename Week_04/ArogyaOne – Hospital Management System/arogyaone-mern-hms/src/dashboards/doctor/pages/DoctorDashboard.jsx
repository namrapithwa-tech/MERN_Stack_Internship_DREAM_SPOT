import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { AuthContext } from '../../../context/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
    PieChart, Pie, Cell 
} from 'recharts';
import '../../../assets/css/doctor.css';

const DoctorDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // States
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ opdToday: 0, ipdActive: 0, apptsToday: 0, totalEmr: 0 });
    const [barData, setBarData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [upcomingAgenda, setUpcomingAgenda] = useState([]);
    const [alerts, setAlerts] = useState({ notesToday: 0, pendingAppts: 0 });

    // Time & Greeting Logic
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Bulletproof Date Normalizer
    const normalizeDate = (dateString) => {
        if (!dateString) return "";
        try {
            if (dateString.includes('T')) return dateString.split('T')[0];
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Concurrently fetch all required data
            const [opdRes, ipdRes, apptRes, notesRes] = await Promise.all([
                api.get('/opd_consultations'),
                api.get('/ipd_admissions'),
                api.get('/appointments'),
                api.get('/doctor_notes').catch(() => ({ data: [] })) // Catch in case notes API doesn't exist yet
            ]);

            const doctorId = user?.linked_id;
            const doctorName = user?.name;

            // 1. Filter Data for Logged-In Doctor
            const myOpd = opdRes.data.filter(o => o.doctor_id === doctorId || o.doctor_name === doctorName);
            const myIpd = ipdRes.data.filter(i => i.doctor_id === doctorId || i.consultant_doctor_name === doctorName);
            const myAppts = apptRes.data.filter(a => a.doctor_id === doctorId || a.doctor_name === doctorName || a.consultant_doctor_name === doctorName);
            const myNotes = notesRes.data.filter(n => n.doctor_id === doctorId || n.doctor_name === doctorName);

            // 2. Calculate Top Stats
            const opdToday = myOpd.filter(o => normalizeDate(o.opd_date) === todayStr).length;
            const ipdActive = myIpd.filter(i => i.status === 'ADMITTED').length;
            const apptsTodayList = myAppts.filter(a => normalizeDate(a.appointment_date || a.date) === todayStr);
            
            // Unique EMR count (approximate by combining unique patient IDs from OPD and IPD)
            const uniquePatients = new Set([...myOpd.map(o => o.patient_id), ...myIpd.map(i => i.patient_id)]);

            setStats({
                opdToday,
                ipdActive,
                apptsToday: apptsTodayList.length,
                totalEmr: uniquePatients.size
            });

            // 3. Prepare Bar Chart Data (Last 7 Days Flow)
            const last7Days = Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            });

            const weeklyFlow = last7Days.map(date => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                return {
                    name: dayName,
                    OPD: myOpd.filter(o => normalizeDate(o.opd_date) === date).length,
                    IPD: myIpd.filter(i => normalizeDate(i.admission_date) === date).length
                };
            });
            setBarData(weeklyFlow);

            // 4. Prepare Donut Chart Data (Appointment Success Rate - All Time)
            let completed = 0, pending = 0, cancelled = 0;
            myAppts.forEach(a => {
                const status = a.status?.toUpperCase() || 'PENDING';
                if (status === 'COMPLETED' || status === 'CLOSED' || status === 'ATTENDED') completed++;
                else if (status === 'CANCELLED') cancelled++;
                else pending++;
            });

            setPieData([
                { name: 'Completed', value: completed, color: '#10b981' }, // Success Green
                { name: 'Pending', value: pending, color: '#f59e0b' },     // Warning Yellow
                { name: 'Cancelled', value: cancelled, color: '#ef4444' }  // Danger Red
            ]);

            // 5. Prepare Quick Upcoming Agenda
            const pendingToday = apptsTodayList
                .filter(a => {
                    const s = a.status?.toUpperCase() || 'PENDING';
                    return s === 'PENDING' || s === 'SCHEDULED' || s === 'CONFIRMED';
                })
                .sort((a, b) => new Date(`1970/01/01 ${a.appointment_time || '00:00'}`) - new Date(`1970/01/01 ${b.appointment_time || '00:00'}`));

            setUpcomingAgenda(pendingToday.slice(0, 3)); // Get next 3

            // 6. Set System Alerts
            const notesWrittenToday = myNotes.filter(n => normalizeDate(n.date) === todayStr).length;
            setAlerts({
                notesToday: notesWrittenToday,
                pendingAppts: pendingToday.length
            });

            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="container-fluid py-4 h-100">
            
            {/* WELCOME BANNER */}
            <div className="d-flex justify-content-between align-items-end mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bolder text-dark mb-1">{getGreeting()}, {user?.name}! 👋</h2>
                    <p className="text-muted m-0 fs-6">Here is what's happening at ArogyaOne Hospital today.</p>
                </div>
                <div className="text-end d-none d-md-block">
                    <h5 className="fw-bold text-primary m-0">
                        {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h5>
                    <p className="text-muted small m-0"><i className="fa-regular fa-clock me-1"></i>System Sync: Live</p>
                </div>
            </div>

            {/* TOP CLICKABLE STAT CARDS */}
            <div className="row g-4 mb-4">
                <div className="col-xl-3 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/doctor/opd')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-success bg-opacity-10 text-success me-3">
                                <i className="fa-solid fa-stethoscope"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Today's OPD Queue</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.opdToday} <span className="fs-6 text-muted fw-normal">Patients</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/doctor/ipd')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-danger bg-opacity-10 text-danger me-3">
                                <i className="fa-solid fa-bed-pulse"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Active IPD Rounds</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.ipdActive} <span className="fs-6 text-muted fw-normal">Admitted</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/doctor/appointments')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-info bg-opacity-10 text-info me-3">
                                <i className="fa-solid fa-calendar-check"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Today's Appointments</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.apptsToday} <span className="fs-6 text-muted fw-normal">Scheduled</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/doctor/patients')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-primary bg-opacity-10 text-primary me-3">
                                <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Total EMR Records</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.totalEmr} <span className="fs-6 text-muted fw-normal">Patients</span></h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="row g-4 mb-4">
                {/* Bar Chart (70%) */}
                <div className="col-lg-8">
                    <div className="chart-container-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark m-0">Weekly Patient Flow</h5>
                            <span className="badge bg-light text-muted border">Last 7 Days</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Bar dataKey="OPD" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="IPD" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Donut Chart (30%) */}
                <div className="col-lg-4">
                    <div className="chart-container-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="fw-bold text-dark m-0">Appointment Status</h5>
                        </div>
                        <p className="text-muted small mb-0">Overview of all tracked appointments.</p>
                        
                        <div style={{ width: '100%', height: 260 }} className="mt-2">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Custom Legend */}
                        <div className="d-flex justify-content-center gap-3">
                            {pieData.map(entry => (
                                <div key={entry.name} className="d-flex align-items-center small text-muted">
                                    <div style={{width: '10px', height: '10px', backgroundColor: entry.color, borderRadius: '50%', marginRight: '5px'}}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK AGENDA & ALERTS */}
            <div className="row g-4 mb-4">
                {/* Quick Agenda */}
                <div className="col-lg-8">
                    <div className="chart-container-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <h5 className="fw-bold text-dark m-0"><i className="fa-regular fa-clock me-2 text-info"></i>Upcoming Agenda</h5>
                            <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/doctor/appointments')}>View Full Calendar &rarr;</button>
                        </div>
                        
                        {upcomingAgenda.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                                {upcomingAgenda.map(appt => (
                                    <div key={appt.id} className="d-flex align-items-center p-3 border rounded-3 bg-light action-card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/doctor/appointments')}>
                                        <div className="bg-white text-info fw-bold rounded-3 border p-2 text-center me-3" style={{ minWidth: '80px' }}>
                                            {appt.appointment_time || '--:--'}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="fw-bold m-0 text-dark">{appt.patient_name || appt.patientName}</h6>
                                            <span className="small text-muted">{appt.visit_type || 'Consultation'}</span>
                                        </div>
                                        <div>
                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2 rounded-pill">Pending</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-light rounded-3 border">
                                <i className="fa-solid fa-mug-hot text-success fs-1 mb-2 opacity-50"></i>
                                <h6 className="fw-bold text-muted">All Caught Up!</h6>
                                <p className="small text-muted m-0">You have no pending appointments for the rest of today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="col-lg-4">
                    <div className="chart-container-card h-100 bg-light border-0">
                        <h5 className="fw-bold text-dark mb-4"><i className="fa-solid fa-bell me-2 text-warning"></i>System Alerts</h5>
                        
                        <div className="d-flex flex-column gap-3">
                            {/* Alert 1: Pending Appointments */}
                            <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center m-0">
                                <i className="fa-solid fa-triangle-exclamation fs-4 me-3"></i>
                                <div>
                                    <strong className="d-block">Pending Consultations</strong>
                                    <span className="small">You have {alerts.pendingAppts} patients waiting to be seen today.</span>
                                </div>
                            </div>

                            {/* Alert 2: Daily Notes */}
                            <div className="alert alert-info border-0 shadow-sm d-flex align-items-center m-0">
                                <i className="fa-solid fa-note-sticky fs-4 me-3"></i>
                                <div>
                                    <strong className="d-block">Daily Planner</strong>
                                    <span className="small">You have {alerts.notesToday} personal note(s) logged for today.</span>
                                </div>
                            </div>
                            
                            {/* Alert 3: Static System Message */}
                            <div className="alert alert-success border-0 shadow-sm d-flex align-items-center m-0">
                                <i className="fa-solid fa-shield-halved fs-4 me-3"></i>
                                <div>
                                    <strong className="d-block">EMR System Status</strong>
                                    <span className="small">All patient data is synced and securely backed up.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DoctorDashboard;