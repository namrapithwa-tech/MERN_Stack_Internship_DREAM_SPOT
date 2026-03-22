import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const BillingDashboard = () => {
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

    // Current Day Stats
    const [dailyStats, setDailyStats] = useState(null);
    
    // Chart Data States
    const [trendData, setTrendData] = useState([]);
    const [pieData, setPieData] = useState([]);

    // --- Data Fetching & Aggregation ---
    useEffect(() => {
        fetchAndCalculateData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate]);

    const fetchAndCalculateData = async () => {
        setLoading(true);
        try {
            const [opdRes, advancesRes, billsRes, labRes, labMasterRes] = await Promise.all([
                api.get('/opd_consultations').catch(() => ({ data: [] })),
                api.get('/ipd_advances').catch(() => ({ data: [] })),
                api.get('/ipd_bills').catch(() => ({ data: [] })),
                api.get('/lab_active_orders').catch(() => ({ data: [] })),
                api.get('/lab_test_master').catch(() => ({ data: [] }))
            ]);

            const opdData = opdRes.data || [];
            const advData = advancesRes.data || [];
            const billsData = billsRes.data || [];
            const labData = labRes.data || [];
            const labMaster = labMasterRes.data || [];

            // --- Master Calculation Engine ---
            // This function calculates revenue for ANY given date string
            const calculateRevenueForDate = (targetDateStr) => {
                let opdTotal = 0, advTotal = 0, billsTotal = 0, labTotal = 0;
                let cash = 0, upi = 0;
                let countOPD = 0, countAdv = 0, countBills = 0, countLab = 0;

                // 1. OPD Consultations
                opdData.forEach(opd => {
                    const matchDate = opd.payment?.payment_date || opd.opd_date;
                    if (matchDate === targetDateStr && opd.payment?.status === 'PAID') {
                        const amt = Number(opd.payment.amount_paid || 0);
                        opdTotal += amt; countOPD++;
                        if (opd.payment.mode === 'UPI') upi += amt; else cash += amt;
                    }
                });

                // 2. IPD Advances
                advData.forEach(adv => {
                    if (adv.date && adv.date.startsWith(targetDateStr)) {
                        const amt = Number(adv.amount || 0);
                        advTotal += amt; countAdv++;
                        if (adv.payment_mode === 'UPI') upi += amt; else cash += amt;
                    }
                });

                // 3. IPD Final Bills
                billsData.forEach(bill => {
                    if (bill.bill_date && bill.bill_date.startsWith(targetDateStr)) {
                        const amt = Number(bill.net_payable || 0);
                        billsTotal += amt; countBills++;
                        if (bill.payment_mode === 'UPI') upi += amt; else cash += amt;
                    }
                });

                // 4. Lab Orders (Walk-in/OPD only)
                labData.forEach(order => {
                    if (order.source !== 'IPD' && order.status === 'completed' && order.completed_at?.startsWith(targetDateStr)) {
                        let amt = 0;
                        order.tests.forEach(testName => {
                            const testDef = labMaster.find(m => m.test_name === testName);
                            if (testDef && testDef.price) amt += Number(testDef.price);
                        });
                        labTotal += amt; countLab++;
                        cash += amt; // Default Walk-in Lab to Cash
                    }
                });

                const total = opdTotal + advTotal + billsTotal + labTotal;
                return { total, opdTotal, advTotal, billsTotal, labTotal, cash, upi, countOPD, countAdv, countBills, countLab };
            };

            // --- Set Selected Day Stats ---
            const currentStats = calculateRevenueForDate(selectedDate);
            setDailyStats(currentStats);

            // --- Generate Donut Chart Data ---
            const newPieData = [
                { name: 'OPD Consultations', value: currentStats.opdTotal, color: '#0d6efd' }, // Primary
                { name: 'IPD Advances', value: currentStats.advTotal, color: '#ffc107' }, // Warning
                { name: 'IPD Final Bills', value: currentStats.billsTotal, color: '#198754' }, // Success
                { name: 'Lab Diagnostics', value: currentStats.labTotal, color: '#0dcaf0' } // Info
            ].filter(item => item.value > 0); // Only show segments that have revenue
            
            setPieData(newPieData);

            // --- Generate 7-Day Trend Chart Data ---
            const newTrendData = [];
            // Loop backwards from 6 days ago up to selected date
            for (let i = 6; i >= 0; i--) {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - i);
                const dStr = getLocalYYYYMMDD(d);
                const dayRev = calculateRevenueForDate(dStr);
                
                newTrendData.push({
                    name: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                    Revenue: dayRev.total
                });
            }
            setTrendData(newTrendData);

        } catch (error) {
            console.error("Error aggregating revenue data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Functions ---
    const formatCurrency = (amount) => `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const getPercentage = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-3 shadow-sm">
                    <p className="fw-bold mb-1">{label}</p>
                    <p className="text-primary fw-bold mb-0">Revenue: {formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid py-4">
            
            {/* HEADER ROW & DATE FILTER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                <div className="mb-3 mb-md-0">
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-chart-line text-primary me-2"></i> Financial Dashboard
                    </h2>
                    <p className="text-muted mb-0 mt-1">Live revenue tracking, department breakdown, and historical trends.</p>
                </div>
                <div className="d-flex align-items-center bg-white p-2 rounded-pill shadow-sm border">
                    <span className="fw-bold text-muted ms-3 me-2">Filter Date:</span>
                    <input 
                        type="date" 
                        className="form-control border-0 bg-light rounded-pill px-3 fw-bold text-primary" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '170px', cursor: 'pointer' }}
                    />
                </div>
            </div>

            {loading || !dailyStats ? (
                <div className="text-center p-5 mt-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <h5 className="mt-3 text-muted fw-bold">Calculating Financial Analytics...</h5>
                </div>
            ) : (
                <>
                    {/* MASTER TOTALS ROW (NEW ELEGANT DESIGN) */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="card-common rounded-4 shadow-sm border-0 p-4 h-100 text-white" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-white-50 mb-2 letter-spacing-1" style={{ fontSize: '13px' }}>Total Daily Revenue</h6>
                                        <h2 className="fw-bold mb-0" style={{ fontSize: '2.5rem' }}>{formatCurrency(dailyStats.total)}</h2>
                                    </div>
                                    <div className="bg-white bg-opacity-25 p-3 rounded-circle fs-3">
                                        <i className="fa-solid fa-wallet"></i>
                                    </div>
                                </div>
                                <div className="mt-auto pt-3 border-top border-light border-opacity-25 small fw-bold">
                                    <i className="fa-regular fa-calendar-check me-2"></i> 
                                    Transactions for {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 h-100 p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-muted mb-2 letter-spacing-1" style={{ fontSize: '13px' }}>Total Cash Collection</h6>
                                        <h3 className="fw-bold text-success mb-0">{formatCurrency(dailyStats.cash)}</h3>
                                    </div>
                                    <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success fs-3">
                                        <i className="fa-solid fa-money-bill-wave"></i>
                                    </div>
                                </div>
                                <div className="mt-auto pt-2">
                                    <div className="d-flex justify-content-between small fw-bold mb-1">
                                        <span className="text-muted">Share of Total</span>
                                        <span className="text-success">{getPercentage(dailyStats.cash, dailyStats.total)}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-success rounded-pill" role="progressbar" style={{ width: `${getPercentage(dailyStats.cash, dailyStats.total)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 h-100 p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h6 className="text-uppercase fw-bold text-muted mb-2 letter-spacing-1" style={{ fontSize: '13px' }}>UPI / Online Collection</h6>
                                        <h3 className="fw-bold text-info mb-0">{formatCurrency(dailyStats.upi)}</h3>
                                    </div>
                                    <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info fs-3">
                                        <i className="fa-solid fa-mobile-screen"></i>
                                    </div>
                                </div>
                                <div className="mt-auto pt-2">
                                    <div className="d-flex justify-content-between small fw-bold mb-1">
                                        <span className="text-muted">Share of Total</span>
                                        <span className="text-info">{getPercentage(dailyStats.upi, dailyStats.total)}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div className="progress-bar bg-info rounded-pill" role="progressbar" style={{ width: `${getPercentage(dailyStats.upi, dailyStats.total)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DEPARTMENT BREAKDOWN CARDS */}
                    <div className="row g-4 mb-4">
                        <div className="col-lg-3 col-md-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-start border-primary border-4 p-4 h-100 transition-all hover-lift">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-light p-2 rounded-circle me-3"><i className="fa-solid fa-stethoscope text-primary fs-5"></i></div>
                                    <h6 className="fw-bold text-dark mb-0 m-0">OPD Consultations</h6>
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{formatCurrency(dailyStats.opdTotal)}</h4>
                                <p className="text-muted small fw-bold mb-0"><i className="fa-solid fa-users me-1 opacity-75"></i> {dailyStats.countOPD} Patients Billed</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-start border-warning border-4 p-4 h-100 transition-all hover-lift">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-light p-2 rounded-circle me-3"><i className="fa-solid fa-hand-holding-dollar text-warning fs-5"></i></div>
                                    <h6 className="fw-bold text-dark mb-0 m-0">IPD Ward Advances</h6>
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{formatCurrency(dailyStats.advTotal)}</h4>
                                <p className="text-muted small fw-bold mb-0"><i className="fa-solid fa-money-check me-1 opacity-75"></i> {dailyStats.countAdv} Deposits Taken</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-start border-success border-4 p-4 h-100 transition-all hover-lift">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-light p-2 rounded-circle me-3"><i className="fa-solid fa-file-invoice-dollar text-success fs-5"></i></div>
                                    <h6 className="fw-bold text-dark mb-0 m-0">IPD Final Settlements</h6>
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{formatCurrency(dailyStats.billsTotal)}</h4>
                                <p className="text-muted small fw-bold mb-0"><i className="fa-solid fa-bed-pulse me-1 opacity-75"></i> {dailyStats.countBills} Net Payables Cleared</p>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="card-common bg-white rounded-4 shadow-sm border-start border-info border-4 p-4 h-100 transition-all hover-lift">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-light p-2 rounded-circle me-3"><i className="fa-solid fa-flask text-info fs-5"></i></div>
                                    <h6 className="fw-bold text-dark mb-0 m-0">OPD Lab Diagnostics</h6>
                                </div>
                                <h4 className="fw-bold text-dark mb-1">{formatCurrency(dailyStats.labTotal)}</h4>
                                <p className="text-muted small fw-bold mb-0"><i className="fa-solid fa-vial-circle-check me-1 opacity-75"></i> {dailyStats.countLab} Orders Paid</p>
                            </div>
                        </div>
                    </div>

                    {/* INTERACTIVE CHARTS ROW */}
                    <div className="row g-4 mb-4">
                        
                        {/* 7-Day Trend Chart */}
                        <div className="col-lg-8">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                <h6 className="fw-bold text-dark mb-4">
                                    <i className="fa-solid fa-chart-area text-primary me-2"></i> 7-Day Revenue Trend (Ending {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})
                                </h6>
                                <div style={{ width: '100%', height: '300px' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6c757d' }} tickFormatter={(val) => `₹${val/1000}k`} />
                                            <RechartsTooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="Revenue" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Department Donut Chart */}
                        <div className="col-lg-4">
                            <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100 d-flex flex-column">
                                <h6 className="fw-bold text-dark mb-4">
                                    <i className="fa-solid fa-chart-pie text-success me-2"></i> Daily Revenue Breakdown
                                </h6>
                                
                                {dailyStats.total === 0 ? (
                                    <div className="text-center text-muted my-auto py-5">
                                        <i className="fa-solid fa-chart-pie fs-1 opacity-25 mb-3"></i>
                                        <p className="mb-0">No revenue data available<br/>for the selected date.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ width: '100%', height: '220px' }}>
                                            <ResponsiveContainer>
                                                <PieChart>
                                                    <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-auto">
                                            {pieData.map((item, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center mb-2 small fw-bold">
                                                    <span className="text-dark"><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '3px', marginRight: '8px' }}></span>{item.name}</span>
                                                    <span className="text-muted">{getPercentage(item.value, dailyStats.total)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default BillingDashboard;