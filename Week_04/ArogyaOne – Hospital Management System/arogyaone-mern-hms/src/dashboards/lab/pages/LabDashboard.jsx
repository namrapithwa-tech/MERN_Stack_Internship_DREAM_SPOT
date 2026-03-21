import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../../assets/css/doctor.css'; // Reusing your beautiful dashboard styles!

const LabDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Mock Data States (Until we build the other APIs)
    const [stats, setStats] = useState({ pending: 0, completedToday: 0, totalCategories: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [barData, setBarData] = useState([]);

    useEffect(() => {
        // Simulate fetching data for the dashboard layout
        setTimeout(() => {
            setStats({
                pending: 12,           // Mock: 12 tests waiting to be processed
                completedToday: 45,    // Mock: 45 reports generated today
                totalCategories: 24    // Mock: 24 test types in the Master Pricing table
            });

            setBarData([
                { name: 'Mon', tests: 40 },
                { name: 'Tue', tests: 55 },
                { name: 'Wed', tests: 48 },
                { name: 'Thu', tests: 62 },
                { name: 'Fri', tests: 70 },
                { name: 'Sat', tests: 85 },
                { name: 'Sun', tests: 30 },
            ]);

            setRecentRequests([
                { id: 'REQ-001', patient: 'Rahul Sharma', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Ananya Vyas', time: '10:30 AM' },
                { id: 'REQ-002', patient: 'Priya Patel', test: 'Lipid Profile', doctor: 'Dr. Raghav', time: '11:15 AM' },
                { id: 'REQ-003', patient: 'Amit Kumar', test: 'Thyroid Panel (T3, T4, TSH)', doctor: 'Dr. Ananya Vyas', time: '11:45 AM' },
            ]);

            setLoading(false);
        }, 600);
    }, []);

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4 h-100">
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                    <h2 className="fw-bolder text-dark mb-1">Laboratory Command Center</h2>
                    <p className="text-muted m-0 fs-6">Manage incoming test requests and generate reports.</p>
                </div>
                <div className="badge bg-light text-dark border p-2 shadow-sm">
                    <i className="fa-solid fa-microscope text-primary me-2"></i>{user?.name || 'Lab Dept'}
                </div>
            </div>

            {/* TOP STAT CARDS */}
            <div className="row g-4 mb-4">
                <div className="col-xl-4 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/lab/requests')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-warning bg-opacity-10 text-warning me-3">
                                <i className="fa-solid fa-vials"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Pending Requests</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.pending} <span className="fs-6 text-muted fw-normal">Waiting</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/lab/reports')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-success bg-opacity-10 text-success me-3">
                                <i className="fa-solid fa-file-prescription"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Completed Today</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.completedToday} <span className="fs-6 text-muted fw-normal">Reports</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-md-6">
                    <div className="card dashboard-stat-card h-100 p-3" onClick={() => navigate('/lab/master')}>
                        <div className="d-flex align-items-center">
                            <div className="dashboard-icon-wrap bg-primary bg-opacity-10 text-primary me-3">
                                <i className="fa-solid fa-tags"></i>
                            </div>
                            <div>
                                <p className="text-muted small fw-bold mb-1 text-uppercase">Test Master</p>
                                <h2 className="fw-bold m-0 text-dark">{stats.totalCategories} <span className="fs-6 text-muted fw-normal">Categories</span></h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHARTS & ACTIVITY */}
            <div className="row g-4 mb-4">
                
                {/* Left Chart (60%) */}
                <div className="col-lg-7">
                    <div className="chart-container-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark m-0">Weekly Testing Volume</h5>
                            <span className="badge bg-light text-muted border">Last 7 Days</span>
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                    <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="tests" name="Tests Processed" fill="#0d6efd" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Activity List (40%) */}
                <div className="col-lg-5">
                    <div className="chart-container-card h-100 p-0 overflow-hidden d-flex flex-column">
                        <div className="bg-light p-4 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold m-0 text-dark"><i className="fa-solid fa-bell me-2 text-warning"></i> Recent Requests</h5>
                            <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/lab/requests')}>View All &rarr;</button>
                        </div>
                        
                        <div className="p-4 overflow-auto flex-grow-1">
                            <div className="d-flex flex-column gap-3">
                                {recentRequests.map(req => (
                                    <div key={req.id} className="d-flex align-items-center p-3 border rounded-3 bg-white shadow-sm">
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <h6 className="fw-bold m-0 text-primary">{req.patient}</h6>
                                                <span className="small text-muted fw-bold"><i className="fa-regular fa-clock me-1"></i>{req.time}</span>
                                            </div>
                                            <p className="small text-dark fw-bold mb-1">{req.test}</p>
                                            <span className="small text-muted"><i className="fa-solid fa-user-doctor me-1"></i>{req.doctor}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-warning w-100 fw-bold mt-4 shadow-sm" onClick={() => navigate('/lab/requests')}>
                                <i className="fa-solid fa-flask-vial me-2"></i> Start Processing Tests
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LabDashboard;