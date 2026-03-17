import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Adjust path if needed
import '../../assets/css/registration.css'; // Adjust path if needed
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const RegistrationDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // --- DATE STATE ---
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // --- METRICS STATE ---
    const [stats, setStats] = useState({
        totalRevenue: 0,
        cashRevenue: 0,
        upiRevenue: 0,
        opdVisitsToday: 0,
        newPatientsToday: 0,
        activeIpdAdmissions: 0
    });

    // --- CHART DATA STATE ---
    const [revenueData, setRevenueData] = useState([]);
    const [deptTrafficData, setDeptTrafficData] = useState([]);

    // Chart Colors
    const COLORS = ['#28a745', '#007bff']; // Green for Cash, Blue for UPI
    const BAR_COLOR = '#6366f1';

    // Re-fetch or re-calculate data whenever the selected date changes
    useEffect(() => {
        fetchDashboardData();
    }, [selectedDate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [patientsRes, opdRes, ipdRes] = await Promise.all([
                api.get('/patients'),
                api.get('/opd_consultations'),
                api.get('/ipd_admissions')
                // Appointments fetched if needed for future metrics
            ]);

            const targetDateStr = selectedDate; // Use the selected date instead of hardcoded today

            // 1. Process OPD Revenue & Visits (FOR SELECTED DATE)
            let totalRev = 0;
            let cashRev = 0;
            let upiRev = 0;
            let opdCount = 0;
            
            // For Department Chart
            const deptCounts = {};

            opdRes.data.forEach(opd => {
                if (opd.opd_date === targetDateStr) {
                    opdCount++;
                    const fee = Number(opd.consultation_fee) || 0;
                    totalRev += fee;

                    // Safely check payment mode
                    const mode = opd.payment?.mode?.toUpperCase() || 'CASH';
                    if (mode === 'CASH') cashRev += fee;
                    if (mode === 'UPI') upiRev += fee;

                    // Department Aggregation
                    const dept = opd.department || 'General';
                    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                }
            });

            // 2. Process New Patients (FOR SELECTED DATE)
            const newPatientsCount = patientsRes.data.filter(p => 
                p.created_at && p.created_at.startsWith(targetDateStr)
            ).length;

            // 3. Process Active IPD Admissions (Currently admitted overall)
            // Note: Active admissions usually reflect the *current live state* of the hospital, 
            // but if you want it to reflect admissions made ON the selected date, you can change the logic below.
            // Leaving it as overall "Active" is standard for dashboards.
            const activeIpdCount = ipdRes.data.filter(ipd => 
                ipd.status === 'ADMITTED'
            ).length;

            // --- SET STATES ---
            setStats({
                totalRevenue: totalRev,
                cashRevenue: cashRev,
                upiRevenue: upiRev,
                opdVisitsToday: opdCount,
                newPatientsToday: newPatientsCount,
                activeIpdAdmissions: activeIpdCount
            });

            setRevenueData([
                { name: 'Cash', value: cashRev },
                { name: 'UPI', value: upiRev }
            ]);

            // Convert Dept object to array for Recharts
            const deptArray = Object.keys(deptCounts).map(key => ({
                name: key,
                visits: deptCounts[key]
            }));
            setDeptTrafficData(deptArray);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    // --- QUICK ACTION NAVIGATION ---
    const quickActions = [
        { title: 'New Walk-In', icon: 'fa-person-walking', color: 'text-primary', bg: 'bg-primary', link: '/registration/walkin' },
        { title: 'Re-Visit (Old)', icon: 'fa-rotate-right', color: 'text-success', bg: 'bg-success', link: '/registration/revisit' },
        { title: 'Appointments', icon: 'fa-calendar-check', color: 'text-info', bg: 'bg-info', link: '/registration/appointments' },
        { title: 'IPD Admission', icon: 'fa-bed-pulse', color: 'text-danger', bg: 'bg-danger', link: '/registration/room-allocation' },
        { title: 'All Patients', icon: 'fa-users', color: 'text-dark', bg: 'bg-dark', link: '/registration/patients' }
    ];

    // Dynamic Labels based on selected date
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const dateLabel = isToday ? "Today's" : "Selected Date's";
    const dateLabelShort = isToday ? "Today" : "Selected Date";

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-3">
            
            {/* --- HEADER --- */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0"><i className="fa-solid fa-chart-pie me-2 text-primary"></i> Registration Command Center</h4>
                <div className="d-flex align-items-center">
                    <label className="text-muted fw-bold me-2 mb-0">Date:</label>
                    <input 
                        type="date" 
                        className="form-control form-control-sm border-primary shadow-sm fw-bold" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </div>

            {/* --- TOP METRIC CARDS --- */}
            <div className="row g-4 mb-4">
                {/* Total Revenue Card */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-primary h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="fa-solid fa-indian-rupee-sign text-primary fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold mb-1">{dateLabel} Revenue</h6>
                                <h3 className="fw-bold m-0 text-dark">₹{stats.totalRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cash Revenue Card */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-success h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="fa-solid fa-money-bill-wave text-success fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold mb-1">Cash Collection</h6>
                                <h3 className="fw-bold m-0 text-dark">₹{stats.cashRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UPI Revenue Card */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-info h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="fa-solid fa-mobile-screen-button text-info fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold mb-1">UPI Collection</h6>
                                <h3 className="fw-bold m-0 text-dark">₹{stats.upiRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IPD Admissions Card */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 border-start border-4 border-danger h-100">
                        <div className="card-body d-flex align-items-center">
                            <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                                <i className="fa-solid fa-bed text-danger fs-4"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold mb-1">Active IPD Patients</h6>
                                <h3 className="fw-bold m-0 text-dark">{stats.activeIpdAdmissions}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- QUICK ACTIONS PANEL --- */}
            <h5 className="fw-bold mb-3"><i className="fa-solid fa-bolt text-warning me-2"></i>Quick Actions</h5>
            <div className="row g-3 mb-5">
                {quickActions.map((action, index) => (
                    <div className="col" key={index}>
                        <div 
                            className="card border-0 shadow-sm rounded-3 text-center p-3 h-100 cursor-pointer action-card-hover"
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onClick={() => navigate(action.link)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className={`${action.bg} bg-opacity-10 mx-auto rounded-circle d-flex align-items-center justify-content-center mb-2`} style={{ width: '50px', height: '50px' }}>
                                <i className={`fa-solid ${action.icon} ${action.color} fs-4`}></i>
                            </div>
                            <span className="fw-bold text-dark small">{action.title}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="row g-4 mb-4">
                
                {/* Revenue Split Chart */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                        <h6 className="fw-bold text-dark mb-3">{dateLabel} Revenue Split (Cash vs UPI)</h6>
                        {stats.totalRevenue > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => `₹${value}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted fst-italic">
                                No revenue recorded for this date.
                            </div>
                        )}
                    </div>
                </div>

                {/* Department Traffic Chart */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold text-dark m-0">{dateLabel} OPD Traffic by Department</h6>
                            <span className="badge bg-light text-dark border">Total Visits: {stats.opdVisitsToday}</span>
                        </div>
                        {deptTrafficData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={deptTrafficData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="visits" fill={BAR_COLOR} radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="d-flex align-items-center justify-content-center h-100 text-muted fst-italic">
                                No OPD visits recorded for this date.
                            </div>
                        )}
                    </div>
                </div>
                
            </div>

            {/* --- BOTTOM STATS (Extra Details) --- */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold text-muted mb-1">New Registrations ({dateLabelShort})</h6>
                                <h4 className="fw-bold m-0">{stats.newPatientsToday}</h4>
                            </div>
                            <i className="fa-solid fa-address-card text-muted opacity-50 fs-1"></i>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold text-muted mb-1">Total OPD Consultations ({dateLabelShort})</h6>
                                <h4 className="fw-bold m-0">{stats.opdVisitsToday}</h4>
                            </div>
                            <i className="fa-solid fa-stethoscope text-muted opacity-50 fs-1"></i>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RegistrationDashboard;