import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar // <-- Added BarChart for Department Analysis
} from 'recharts';

const AdminDashboard = () => {
    // --- Safe Local Date Helper ---
    const getLocalYYYYMMDD = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // --- State Management ---
    const [selectedDate, setSelectedDate] = useState(getLocalYYYYMMDD(new Date()));
    const [loading, setLoading] = useState(true);

    // KPI States
    const [stats, setStats] = useState({
        totalRevenue: 0,
        patientFootfall: 0,
        occupancyRate: 0,
        totalRooms: 0,
        occupiedRooms: 0,
        activeDoctors: 0
    });

    // Chart & Feed States
    const [trendData, setTrendData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [deptData, setDeptData] = useState([]); // NEW: For Department Bar Chart
    const [liveFeed, setLiveFeed] = useState([]); // NEW: For Activity Feed

    // --- The God Fetch & Data Engine ---
    useEffect(() => {
        fetchCommandCenterData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const fetchCommandCenterData = async () => {
        setLoading(true);
        try {
            const [
                opdRes, admRes, billsRes, advRes, 
                labRes, labMasterRes, roomsRes, docRes
            ] = await Promise.all([
                api.get('/opd_consultations').catch(() => ({ data: [] })),
                api.get('/ipd_admissions').catch(() => ({ data: [] })),
                api.get('/ipd_bills').catch(() => ({ data: [] })),
                api.get('/ipd_advances').catch(() => ({ data: [] })),
                api.get('/lab_active_orders').catch(() => ({ data: [] })),
                api.get('/lab_test_master').catch(() => ({ data: [] })),
                api.get('/rooms').catch(() => ({ data: [] })),
                api.get('/doctors').catch(() => ({ data: [] }))
            ]);

            const opdData = opdRes.data || [];
            const admData = admRes.data || [];
            const billsData = billsRes.data || [];
            const advData = advRes.data || [];
            const labData = labRes.data || [];
            const labMaster = labMasterRes.data || [];
            const roomsData = roomsRes.data || [];
            const docsData = docRes.data || [];

            // --- Utility: Calculate Metrics for a Specific Date ---
            const calculateMetricsForDate = (targetDateStr) => {
                let dailyRev = 0;
                let footfall = 0;
                let deptCounts = {};
                let dailyEvents = [];

                // 1. OPD Revenue, Footfall & Departments
                opdData.forEach(opd => {
                    const matchDate = opd.payment?.payment_date || opd.opd_date;
                    if (matchDate === targetDateStr) {
                        footfall++; 
                        
                        // Count for Department Chart
                        const dept = opd.department || 'General';
                        deptCounts[dept] = (deptCounts[dept] || 0) + 1;

                        // Add to Live Feed
                        dailyEvents.push({
                            id: opd.id, type: 'OPD', 
                            time: opd.created_at || new Date(targetDateStr).toISOString(), 
                            text: `Consultation: ${opd.patient_name} with ${opd.doctor_name}`,
                            icon: 'fa-stethoscope', color: 'primary'
                        });

                        if (opd.payment?.status === 'PAID') {
                            dailyRev += Number(opd.payment.amount_paid || 0);
                        }
                    }
                });

                // 2. IPD Footfall (New Admissions today)
                admData.forEach(adm => {
                    if (adm.admission_date?.startsWith(targetDateStr)) {
                        footfall++;
                        dailyEvents.push({
                            id: adm.id, type: 'IPD', 
                            time: adm.admission_date, 
                            text: `New Admission: ${adm.patient_name} to Room ${adm.room_number}`,
                            icon: 'fa-bed-pulse', color: 'danger'
                        });
                    }
                });

                // 3. IPD Advances Revenue
                advData.forEach(adv => {
                    if (adv.date?.startsWith(targetDateStr)) dailyRev += Number(adv.amount || 0);
                });

                // 4. IPD Final Bills Revenue (Net Payable)
                billsData.forEach(bill => {
                    if (bill.bill_date?.startsWith(targetDateStr)) {
                        dailyRev += Number(bill.net_payable || 0);
                        dailyEvents.push({
                            id: bill.id, type: 'BILL', 
                            time: bill.bill_date, 
                            text: `Bill Settled: ${bill.patient_name} for ₹${Number(bill.net_payable).toLocaleString()}`,
                            icon: 'fa-file-invoice-dollar', color: 'success'
                        });
                    }
                });

                // 5. Lab Walk-in Revenue
                labData.forEach(order => {
                    if (order.source !== 'IPD' && order.status === 'completed' && order.completed_at?.startsWith(targetDateStr)) {
                        order.tests.forEach(testName => {
                            const testDef = labMaster.find(m => m.test_name === testName);
                            if (testDef && testDef.price) dailyRev += Number(testDef.price);
                        });
                        dailyEvents.push({
                            id: order.id, type: 'LAB', 
                            time: order.completed_at, 
                            text: `Lab Tests completed for ${order.patient_name}`,
                            icon: 'fa-flask', color: 'info'
                        });
                    }
                });

                return { dailyRev, footfall, deptCounts, dailyEvents };
            };

            // --- Live Selected Date Stats ---
            const todayMetrics = calculateMetricsForDate(selectedDate);
            
            const totalRoomsCount = roomsData.length;
            const occupiedCount = roomsData.filter(r => !r.is_available).length;
            const occupancyPct = totalRoomsCount === 0 ? 0 : Math.round((occupiedCount / totalRoomsCount) * 100);

            const activeDocsCount = docsData.filter(d => d.is_available).length;

            setStats({
                totalRevenue: todayMetrics.dailyRev,
                patientFootfall: todayMetrics.footfall,
                occupancyRate: occupancyPct,
                totalRooms: totalRoomsCount,
                occupiedRooms: occupiedCount,
                activeDoctors: activeDocsCount
            });

            // --- Generate Department Bar Chart Data ---
            // Convert object to array, sort by highest footfall, take top 5
            const sortedDepts = Object.keys(todayMetrics.deptCounts)
                .map(key => ({ name: key, Patients: todayMetrics.deptCounts[key] }))
                .sort((a, b) => b.Patients - a.Patients)
                .slice(0, 5);
            setDeptData(sortedDepts);

            // --- Generate Live Feed ---
            // Sort events by time (newest first) and take the latest 6
            const sortedEvents = todayMetrics.dailyEvents
                .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 6);
            setLiveFeed(sortedEvents);

            // --- Bed Occupancy Pie Chart ---
            setPieData([
                { name: 'Occupied', value: occupiedCount, color: '#dc3545' }, 
                { name: 'Available', value: totalRoomsCount - occupiedCount, color: '#198754' } 
            ]);

            // --- 7-Day Trend Chart ---
            const newTrendData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - i);
                const dStr = getLocalYYYYMMDD(d);
                const metrics = calculateMetricsForDate(dStr);
                
                newTrendData.push({
                    name: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    Revenue: metrics.dailyRev,
                    Footfall: metrics.footfall
                });
            }
            setTrendData(newTrendData);

        } catch (error) {
            console.error("Error loading Command Center data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Helpers ---
    const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-3 shadow-lg">
                    <p className="fw-bold mb-2 text-dark border-bottom pb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className={`fw-bold mb-1`} style={{fontSize: '14px', color: entry.color}}>
                            {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid py-4">
            
            {/* HEADER ROW & TIME MACHINE FILTER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-chess-king text-primary me-2"></i> Admin Command Center
                    </h2>
                    <p className="text-muted mb-0 mt-1">Live macro-level analytics and infrastructure monitoring.</p>
                </div>
                <div className="d-flex align-items-center bg-white p-2 rounded-pill shadow-sm border border-secondary border-opacity-25">
                    <span className="fw-bold text-muted ms-3 me-2"><i className="fa-solid fa-clock-rotate-left me-1"></i> Time Machine:</span>
                    <input 
                        type="date" 
                        className="form-control border-0 bg-light rounded-pill px-3 fw-bold text-primary" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '170px', cursor: 'pointer' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center p-5 mt-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <h5 className="mt-3 text-muted fw-bold">Initializing God Mode...</h5>
                </div>
            ) : (
                <>
                    {/* --- ROW 1: VITAL SIGNS KPI CARDS --- */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-3">
                            <div className="card-common rounded-4 shadow-sm border-0 p-4 h-100 text-white" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-white-50 mb-2 letter-spacing-1" style={{ fontSize: '11px' }}>Total Daily Revenue</h6>
                                        <h3 className="fw-bold mb-0">{formatCurrency(stats.totalRevenue)}</h3>
                                    </div>
                                    <div className="bg-white bg-opacity-25 p-2 rounded-circle fs-4">
                                        <i className="fa-solid fa-indian-rupee-sign"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card-common rounded-4 shadow-sm border-0 p-4 h-100 text-white" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #59339d 100%)' }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-white-50 mb-2 letter-spacing-1" style={{ fontSize: '11px' }}>Patient Footfall</h6>
                                        <h3 className="fw-bold mb-0">{stats.patientFootfall} <span className="fs-6 fw-normal opacity-75">Visits</span></h3>
                                    </div>
                                    <div className="bg-white bg-opacity-25 p-2 rounded-circle fs-4">
                                        <i className="fa-solid fa-users"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-muted mb-2 letter-spacing-1" style={{ fontSize: '11px' }}>Live Bed Occupancy</h6>
                                        <h3 className="fw-bold text-dark mb-0">{stats.occupancyRate}%</h3>
                                    </div>
                                    <div className={`bg-${stats.occupancyRate > 80 ? 'danger' : 'warning'} bg-opacity-10 p-2 rounded-circle text-${stats.occupancyRate > 80 ? 'danger' : 'warning'} fs-4`}>
                                        <i className="fa-solid fa-bed-pulse"></i>
                                    </div>
                                </div>
                                <div className="progress mt-auto" style={{ height: '6px' }}>
                                    <div className={`progress-bar bg-${stats.occupancyRate > 80 ? 'danger' : 'warning'} rounded-pill`} role="progressbar" style={{ width: `${stats.occupancyRate}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-muted mb-2 letter-spacing-1" style={{ fontSize: '11px' }}>Active Doctors</h6>
                                        <h3 className="fw-bold text-success mb-0">{stats.activeDoctors} <span className="fs-6 fw-normal text-muted">Available</span></h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-2 rounded-circle text-success fs-4">
                                        <i className="fa-solid fa-user-doctor"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- ROW 2: PRIMARY CHARTS --- */}
                    <div className="row g-4 mb-4">
                        <div className="col-lg-8">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h6 className="fw-bold text-dark mb-0">
                                        <i className="fa-solid fa-chart-area text-primary me-2"></i> 7-Day Hospital Activity
                                    </h6>
                                    <div className="small fw-bold">
                                        <span className="text-primary me-3"><i className="fa-solid fa-circle me-1"></i> Revenue</span>
                                        <span className="text-warning"><i className="fa-solid fa-circle me-1"></i> Footfall</span>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '320px' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                                                </linearGradient>
                                                <linearGradient id="colorFootfall" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ffc107" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#ffc107" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} dy={10} />
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#0d6efd' }} tickFormatter={(val) => `₹${val/1000}k`} />
                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#ffc107' }} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            <Area yAxisId="right" type="monotone" dataKey="Footfall" stroke="#ffc107" strokeWidth={3} fillOpacity={1} fill="url(#colorFootfall)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100 d-flex flex-column">
                                <h6 className="fw-bold text-dark mb-4">
                                    <i className="fa-solid fa-building-circle-check text-success me-2"></i> Live Infrastructure Status
                                </h6>
                                {stats.totalRooms === 0 ? (
                                    <div className="text-center text-muted my-auto py-5">
                                        <i className="fa-solid fa-bed fs-1 opacity-25 mb-3"></i>
                                        <p className="mb-0">No IPD Rooms configured.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="position-absolute top-50 start-50 translate-middle text-center">
                                                <h3 className="fw-bold text-dark mb-0">{stats.totalRooms}</h3>
                                                <small className="text-muted fw-bold">Total Beds</small>
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-3 border-top">
                                            <div className="d-flex justify-content-between align-items-center mb-2 small fw-bold">
                                                <span className="text-dark"><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '3px', marginRight: '8px' }}></span>Occupied</span>
                                                <span className="text-danger">{stats.occupiedRooms} Rooms</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center small fw-bold">
                                                <span className="text-dark"><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#198754', borderRadius: '3px', marginRight: '8px' }}></span>Available</span>
                                                <span className="text-success">{stats.totalRooms - stats.occupiedRooms} Rooms</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- ROW 3: NEW ADVANCED ANALYTICS & LIVE FEED --- */}
                    <div className="row g-4 mb-4">
                        {/* Department Performance Bar Chart */}
                        <div className="col-lg-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                <h6 className="fw-bold text-dark mb-4">
                                    <i className="fa-solid fa-ranking-star text-info me-2"></i> Top Performing Departments (Today)
                                </h6>
                                {deptData.length > 0 ? (
                                    <div style={{ width: '100%', height: '300px' }}>
                                        <ResponsiveContainer>
                                            <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#495057', fontWeight: 'bold' }} width={100} />
                                                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="Patients" fill="#0dcaf0" radius={[0, 10, 10, 0]} barSize={25} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5 mt-4">
                                        <i className="fa-solid fa-chart-column fs-1 opacity-25 mb-3"></i>
                                        <p>No department data for selected date.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Live Hospital Activity Feed */}
                        <div className="col-lg-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100 d-flex flex-column">
                                <h6 className="fw-bold text-dark mb-4">
                                    <i className="fa-solid fa-satellite-dish text-danger me-2"></i> Live Hospital Activity Feed
                                </h6>
                                <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '300px', paddingRight: '10px' }}>
                                    {liveFeed.length > 0 ? (
                                        liveFeed.map((event, idx) => (
                                            <div key={`${event.id}-${idx}`} className={`d-flex align-items-center p-3 mb-3 rounded-4 bg-${event.color} bg-opacity-10 border border-${event.color} border-opacity-25`}>
                                                <div className={`bg-${event.color} text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm flex-shrink-0`} style={{ width: '45px', height: '45px' }}>
                                                    <i className={`fa-solid ${event.icon}`}></i>
                                                </div>
                                                <div className="ms-3 flex-grow-1">
                                                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>{event.text}</h6>
                                                    <small className={`fw-bold text-${event.color} opacity-75`}>
                                                        <i className="fa-regular fa-clock me-1"></i> {new Date(event.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted py-5 mt-4">
                                            <i className="fa-solid fa-list-ul fs-1 opacity-25 mb-3"></i>
                                            <p>No activity logged for selected date.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- BOTTOM ROW: QUICK COMMAND PANEL --- */}
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2 mt-2">
                        <i className="fa-solid fa-bolt text-warning me-2"></i> Quick Navigation
                    </h6>
                    <div className="row g-3">
                        <div className="col-lg-3 col-md-6">
                            <Link to="/admin/patients" className="text-decoration-none">
                                <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 text-center transition-all hover-lift border-bottom border-primary border-4">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle mx-auto d-flex justify-content-center align-items-center mb-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                        <i className="fa-solid fa-hospital-user"></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1">Master Directory</h6>
                                    <p className="small text-muted mb-0">View all patient audits</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <Link to="/admin/staff" className="text-decoration-none">
                                <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 text-center transition-all hover-lift border-bottom border-info border-4">
                                    <div className="bg-info bg-opacity-10 text-info rounded-circle mx-auto d-flex justify-content-center align-items-center mb-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                        <i className="fa-solid fa-users-gear"></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1">Staff Management</h6>
                                    <p className="small text-muted mb-0">Control doctors & access</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <Link to="/admin/facility" className="text-decoration-none">
                                <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 text-center transition-all hover-lift border-bottom border-success border-4">
                                    <div className="bg-success bg-opacity-10 text-success rounded-circle mx-auto d-flex justify-content-center align-items-center mb-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                        <i className="fa-solid fa-building-circle-check"></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1">Facility Master</h6>
                                    <p className="small text-muted mb-0">Manage Rooms & OTs</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <Link to="/billing" className="text-decoration-none">
                                <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 text-center transition-all hover-lift border-bottom border-warning border-4">
                                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle mx-auto d-flex justify-content-center align-items-center mb-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
                                        <i className="fa-solid fa-file-invoice-dollar"></i>
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1">Central Billing</h6>
                                    <p className="small text-muted mb-0">Detailed revenue analysis</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;