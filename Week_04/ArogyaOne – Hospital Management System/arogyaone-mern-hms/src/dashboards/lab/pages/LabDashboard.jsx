import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';

const LabDashboard = () => {
    // --- State Management ---
    const [stats, setStats] = useState({ pending: 0, active: 0, completedToday: 0, revenue: 0 });
    const [recentReports, setRecentReports] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [sourceData, setSourceData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Chart Colors
    const PIE_COLORS = ['#0d6efd', '#6f42c1']; // Primary (Blue) for OPD, Purple for IPD

    // --- Data Fetching ---
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // 1. Fetch Active Orders (Main Source for Dashboard)
            const ordersRes = await api.get('/lab_active_orders');
            const orders = ordersRes.data;

            // 2. Fetch REAL Pending Counts
            let pendingCount = 0;
            try {
                const [opdRes, ipdRes] = await Promise.all([
                    api.get('/opd_consultations'),
                    api.get('/ipd_rounds')
                ]);
                pendingCount += opdRes.data.filter(o => o.lab_status === 'pending').length;
                pendingCount += ipdRes.data.filter(i => i.lab_status === 'pending').length;
            } catch (err) {
                console.error("Failed to fetch pending queue for dashboard", err);
                pendingCount = 0; // Strictly 0 if API fails, no fake data
            }

            // 3. Calculate REAL Stats
            const todayStr = new Date().toISOString().split('T')[0];
            
            const activeCount = orders.filter(o => o.status === 'active').length;
            
            const completedOrders = orders.filter(o => o.status === 'completed');
            const completedToday = completedOrders.filter(o => o.completed_at?.startsWith(todayStr));
            
            // Revenue: Sum of 'amount' for orders billed today
            const revenueToday = completedOrders
                .filter(o => o.is_billed && o.completed_at?.startsWith(todayStr))
                .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

            setStats({
                pending: pendingCount,
                active: activeCount,
                completedToday: completedToday.length,
                revenue: revenueToday
            });

            // 4. Recent 5 Reports (REAL)
            const recent = [...completedOrders]
                .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                .slice(0, 5);
            setRecentReports(recent);

            // 5. Source Distribution for Pie Chart (REAL)
            const opdTotal = orders.filter(o => o.source === 'OPD').length;
            const ipdTotal = orders.filter(o => o.source === 'IPD').length;
            
            setSourceData([
                { name: 'OPD', value: opdTotal },
                { name: 'IPD', value: ipdTotal }
            ]);

            // 6. Workload Trend for Bar Chart (REAL LAST 7 DAYS)
            const last7DaysData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
                
                // Count how many reports were completed on this specific day
                const testsOnDay = completedOrders.filter(o => o.completed_at?.startsWith(dateStr)).length;
                
                last7DaysData.push({
                    day: dayName,
                    tests: testsOnDay
                });
            }
            setChartData(last7DaysData);

        } catch (error) {
            console.error("Error fetching Lab Dashboard data:", error);
        } finally {
            setLoading(false);
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
                        <i className="fa-solid fa-network-wired text-primary me-2"></i> Laboratory Command Center
                    </h2>
                    <p className="text-muted mb-0 mt-1">Overview of your department's daily performance and queue.</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-4" onClick={fetchDashboardData}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Data
                </button>
            </div>

            {/* --- STAT CARDS ROW --- */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-warning border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-vials text-warning fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Pending Queue</h6>
                            <h3 className="fw-bold mb-0 text-dark">{stats.pending}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-primary border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-microscope text-primary fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Active Orders</h6>
                            <h3 className="fw-bold mb-0 text-dark">{stats.active}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-success border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-check-double text-success fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>Completed Today</h6>
                            <h3 className="fw-bold mb-0 text-dark">{stats.completedToday}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 border-start border-dark border-5 h-100 d-flex flex-row align-items-center">
                        <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
                            <i className="fa-solid fa-indian-rupee-sign text-dark fs-3"></i>
                        </div>
                        <div>
                            <h6 className="text-muted fw-bold mb-1 text-uppercase" style={{fontSize: '12px'}}>OPD Revenue Today</h6>
                            <h3 className="fw-bold mb-0 text-dark">₹{stats.revenue.toLocaleString('en-IN')}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CHARTS ROW --- */}
            <div className="row g-4 mb-4">
                {/* Bar Chart: Workload Trend */}
                <div className="col-lg-8">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 h-100">
                        <h6 className="fw-bold text-dark mb-4"><i className="fa-solid fa-chart-column text-primary me-2"></i> Workload Trend (Last 7 Days)</h6>
                        <div style={{ width: '100%', height: '300px' }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6c757d', fontSize: 12}} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="tests" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart: Source Distribution */}
                <div className="col-lg-4">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 h-100 d-flex flex-column">
                        <h6 className="fw-bold text-dark mb-4"><i className="fa-solid fa-chart-pie text-purple me-2" style={{color: '#6f42c1'}}></i> Order Source Distribution</h6>
                        <div style={{ width: '100%', height: '240px' }} className="flex-grow-1">
                            <ResponsiveContainer>
                                {sourceData[0].value === 0 && sourceData[1].value === 0 ? (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted fst-italic">No data yet</div>
                                ) : (
                                    <PieChart>
                                        <Pie
                                            data={sourceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {sourceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                                    </PieChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                        {/* Custom Legend */}
                        <div className="d-flex justify-content-center gap-4 mt-3 pt-3 border-top">
                            <div className="d-flex align-items-center">
                                <div style={{width: '12px', height: '12px', backgroundColor: '#0d6efd', borderRadius: '50%', marginRight: '8px'}}></div>
                                <span className="fw-bold text-dark small">OPD ({sourceData[0]?.value})</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div style={{width: '12px', height: '12px', backgroundColor: '#6f42c1', borderRadius: '50%', marginRight: '8px'}}></div>
                                <span className="fw-bold text-dark small">IPD ({sourceData[1]?.value})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM ROW: RECENT ACTIVITY & QUICK LINKS --- */}
            <div className="row g-4">
                {/* Recent Completed Reports Table */}
                <div className="col-lg-8">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-0 overflow-hidden h-100">
                        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0 text-dark"><i className="fa-solid fa-clock-rotate-left text-success me-2"></i> Recently Completed Reports</h6>
                            <Link to="/lab/reports" className="btn btn-sm btn-link text-decoration-none fw-bold">View All Archive <i className="fa-solid fa-arrow-right ms-1"></i></Link>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-white text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">Time</th>
                                        <th>Patient Name</th>
                                        <th>Order ID</th>
                                        <th>Tests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReports.length > 0 ? recentReports.map((report) => (
                                        <tr key={report.id}>
                                            <td className="ps-4 text-muted small">
                                                {new Date(report.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="fw-bold text-primary">{report.patient_name}</td>
                                            <td className="text-secondary small fw-bold">{report.id}</td>
                                            <td>
                                                <div className="text-truncate small text-dark" style={{ maxWidth: '200px' }}>
                                                    {report.tests?.join(', ')}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="text-center p-4 text-muted fst-italic">No reports completed today yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="col-lg-4">
                    <div className="card-common bg-white shadow-sm border-0 rounded-4 p-4 h-100">
                        <h6 className="fw-bold text-dark mb-4"><i className="fa-solid fa-bolt text-warning me-2"></i> Quick Actions</h6>
                        
                        <div className="d-flex flex-column gap-3">
                            <Link to="/lab/requests" className="btn btn-lg btn-outline-primary rounded-4 d-flex justify-content-between align-items-center p-3 border-2 fw-bold text-start shadow-sm">
                                <div>
                                    <i className="fa-solid fa-vials fs-4 me-3 align-middle"></i>
                                    Process Pending Requests
                                </div>
                                <i className="fa-solid fa-chevron-right opacity-50"></i>
                            </Link>

                            <Link to="/lab/active" className="btn btn-lg btn-outline-danger rounded-4 d-flex justify-content-between align-items-center p-3 border-2 fw-bold text-start shadow-sm">
                                <div>
                                    <i className="fa-solid fa-microscope fs-4 me-3 align-middle"></i>
                                    Enter Active Results
                                </div>
                                <i className="fa-solid fa-chevron-right opacity-50"></i>
                            </Link>

                            <Link to="/lab/reports" className="btn btn-lg btn-outline-success rounded-4 d-flex justify-content-between align-items-center p-3 border-2 fw-bold text-start shadow-sm">
                                <div>
                                    <i className="fa-solid fa-print fs-4 me-3 align-middle"></i>
                                    Print Completed Reports
                                </div>
                                <i className="fa-solid fa-chevron-right opacity-50"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LabDashboard;