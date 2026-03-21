import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const ActiveOrders = () => {
    // --- State Management ---
    const [activeOrders, setActiveOrders] = useState([]);
    const [masterLabTests, setMasterLabTests] = useState([]); // NEW: To hold master test parameters
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'completed', 'All'
    
    // Modal & Result Entry State
    const [showResultModal, setShowResultModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [resultData, setResultData] = useState({}); // Will store nested data: { "CBC": { "WBC": "6500" } }
    const [isSaving, setIsSaving] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        fetchActiveOrders();
        fetchMasterLabTests(); // Fetch master data on load
    }, []);

    const fetchMasterLabTests = async () => {
        try {
            const res = await api.get('/lab_test_master');
            setMasterLabTests(res.data);
        } catch (error) {
            console.error("Error fetching lab test master:", error);
        }
    };

    const fetchActiveOrders = async (isBackground = false) => {
        if (!isBackground) setIsRefreshing(true);
        try {
            const res = await api.get('/lab_active_orders');
            // Sort newest first
            const sortedOrders = res.data.sort((a, b) => new Date(b.accepted_at) - new Date(a.accepted_at));
            setActiveOrders(sortedOrders);
        } catch (error) {
            console.error("Error fetching active orders:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // --- Derived State (Stats) ---
    const totalActive = activeOrders.length;
    const pendingResults = activeOrders.filter(order => order.status === 'active').length;
    const completedReports = activeOrders.filter(order => order.status === 'completed').length;

    // --- Filtering Logic ---
    const filteredOrders = activeOrders.filter(order => {
        const matchesSearch = order.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              order.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              order.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- Handlers ---
    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        
        // Initialize the result form dynamically based on Master parameters
        const initialResults = {};
        
        order.tests.forEach(testName => {
            if (order.results && order.results[testName]) {
                // If editing existing results, load them
                initialResults[testName] = order.results[testName];
            } else {
                // Find this test in the master list
                const masterTest = masterLabTests.find(m => m.test_name === testName);
                
                // If it has defined parameters, create an object for them
                if (masterTest && masterTest.parameters && masterTest.parameters.length > 0) {
                    initialResults[testName] = {};
                    masterTest.parameters.forEach(param => {
                        initialResults[testName][param.name] = ''; // Start with empty string
                    });
                } else {
                    // Fallback to empty string for simple text area
                    initialResults[testName] = ''; 
                }
            }
        });
        
        setResultData(initialResults);
        setShowResultModal(true);
    };

    // UPDATED: Handles both nested parameter inputs and flat textarea inputs
    const handleResultChange = (testName, paramName, value) => {
        setResultData(prev => {
            if (paramName) {
                // It's a specific parameter inside a test
                return {
                    ...prev,
                    [testName]: {
                        ...prev[testName],
                        [paramName]: value
                    }
                };
            } else {
                // It's a general textarea fallback
                return {
                    ...prev,
                    [testName]: value
                };
            }
        });
    };

    const handleCompleteOrder = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Update the order to completed and attach the results
            const payload = {
                status: 'completed',
                results: resultData,
                completed_at: new Date().toISOString()
            };

            await api.patch(`/lab_active_orders/${selectedOrder.id}`, payload);
            
            // Update local state instantly
            setActiveOrders(prev => prev.map(order => 
                order.id === selectedOrder.id ? { ...order, ...payload } : order
            ));
            
            setShowResultModal(false);
            setSelectedOrder(null);
        } catch (error) {
            console.error("Error saving lab results:", error);
            alert("Failed to save results. Check server.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 fw-bold text-dark"><i className="fa-solid fa-microscope text-danger me-2"></i> Active Lab Orders</h3>
                <button 
                    className="btn btn-outline-danger fw-bold px-3" 
                    onClick={() => fetchActiveOrders(false)} 
                    disabled={isRefreshing}
                >
                    <i className={`fa-solid fa-arrows-rotate me-2 ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
                </button>
            </div>

            {/* --- Stats Row --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-secondary border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Total Orders</h6>
                        <h2 className="mb-0 fw-bold">{loading ? '-' : totalActive}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-warning border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Pending Results</h6>
                        <h2 className="mb-0 fw-bold text-warning">{loading ? '-' : pendingResults}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-success border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Completed Today</h6>
                        <h2 className="mb-0 fw-bold text-success">{loading ? '-' : completedReports}</h2>
                    </div>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="card-common bg-white shadow-sm border-0 mb-4 p-3">
                <div className="row g-3">
                    <div className="col-md-8">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Search by Patient Name, UHID, or Order ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select border-secondary text-dark fw-bold" 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="active">Awaiting Results (Active)</option>
                            <option value="completed">Completed</option>
                            <option value="All">All Orders</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Master Table --- */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Order Details</th>
                                <th>Patient Info</th>
                                <th>Source / Doctor</th>
                                <th>Tests Ordered</th>
                                <th>Status</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-danger"></div></td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="fa-solid fa-vial-circle-check fs-1 mb-3 text-secondary opacity-50"></i>
                                        <h5>No orders found</h5>
                                        <p className="mb-0">There are no orders matching your current filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{order.id}</div>
                                            <div className="small text-muted">{new Date(order.accepted_at).toLocaleString('en-GB')}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{order.patient_name}</div>
                                            <div className="small text-muted">UHID: {order.patient_id}</div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark">{order.doctor_name}</div>
                                            <div className="small text-muted badge bg-light text-dark border mt-1">{order.source}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                {order.tests.map((test, i) => (
                                                    <span key={i} className="small fw-semibold text-secondary"><i className="fa-solid fa-caret-right me-1"></i>{test}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            {order.status === 'completed' ? (
                                                <span className="badge bg-success rounded-pill px-3 py-2"><i className="fa-solid fa-check-double me-1"></i>Completed</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark rounded-pill px-3 py-2"><i className="fa-solid fa-clock me-1"></i>Awaiting Results</span>
                                            )}
                                        </td>
                                        <td className="text-center pe-4">
                                            {order.status === 'active' ? (
                                                <button className="btn btn-sm btn-danger fw-bold px-3 shadow-sm" onClick={() => handleOpenModal(order)}>
                                                    <i className="fa-solid fa-pen-to-square me-2"></i> Enter Results
                                                </button>
                                            ) : (
                                                <button className="btn btn-sm btn-outline-success fw-bold px-3">
                                                    <i className="fa-solid fa-print me-2"></i> Print Report
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Result Entry Modal --- */}
            {showResultModal && selectedOrder && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-danger text-white border-bottom-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-flask-vial me-2"></i> Enter Lab Results
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResultModal(false)}></button>
                            </div>
                            
                            <form onSubmit={handleCompleteOrder}>
                                <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                                    
                                    {/* Patient Context Banner */}
                                    <div className="bg-light p-3 rounded border mb-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="fw-bold text-primary mb-1">{selectedOrder.patient_name}</h5>
                                            <small className="text-muted">UHID: {selectedOrder.patient_id} | Ref By: {selectedOrder.doctor_name}</small>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-secondary mb-1">Order ID: {selectedOrder.id}</span>
                                            <br />
                                            <small className="text-muted fw-bold">{selectedOrder.source}</small>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Findings & Parameters</h6>
                                    
                                    {/* Dynamic Inputs per Test */}
                                    <div className="d-flex flex-column gap-4">
                                        {selectedOrder.tests.map((testStr, idx) => {
                                            // Find the specific master test definition
                                            const masterTest = masterLabTests.find(m => m.test_name === testStr);
                                            const hasParams = masterTest && masterTest.parameters && masterTest.parameters.length > 0;

                                            return (
                                                <div className="card border-primary shadow-sm" key={idx}>
                                                    <div className="card-header bg-primary bg-opacity-10 border-primary fw-bold text-primary py-2">
                                                        {testStr}
                                                    </div>
                                                    <div className="card-body p-3">
                                                        {hasParams ? (
                                                            // SMART GRID FORM FOR PARAMETERS
                                                            <div className="row g-3">
                                                                {masterTest.parameters.map((param, pIdx) => (
                                                                    <div className="col-md-6" key={pIdx}>
                                                                        <label className="small fw-bold text-dark mb-1">{param.name}</label>
                                                                        <div className="input-group input-group-sm">
                                                                            <input 
                                                                                type="text" 
                                                                                className="form-control"
                                                                                placeholder="Enter value..."
                                                                                value={resultData[testStr]?.[param.name] || ''}
                                                                                onChange={(e) => handleResultChange(testStr, param.name, e.target.value)}
                                                                                required
                                                                            />
                                                                            {param.unit && (
                                                                                <span className="input-group-text bg-light text-muted fw-semibold">{param.unit}</span>
                                                                            )}
                                                                        </div>
                                                                        {param.normal_range && (
                                                                            <div className="small text-muted mt-1" style={{fontSize: '11px'}}>
                                                                                Normal Range: <span className="text-success">{param.normal_range}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            // FALLBACK TEXTAREA FOR SIMPLE TESTS
                                                            <>
                                                                <label className="small fw-bold text-muted mb-2">Test Findings / Parameter Results</label>
                                                                <textarea 
                                                                    className="form-control" 
                                                                    rows="3" 
                                                                    placeholder={`Enter results for ${testStr} (e.g., Normal/Abnormal observations...)`}
                                                                    value={resultData[testStr] || ''}
                                                                    onChange={(e) => handleResultChange(testStr, null, e.target.value)}
                                                                    required
                                                                ></textarea>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="modal-footer bg-light border-top-0">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn btn-success fw-bold px-4" disabled={isSaving}>
                                        {isSaving ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Saving...</>
                                        ) : (
                                            <><i className="fa-solid fa-check-double me-2"></i> Finalize & Complete</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveOrders;