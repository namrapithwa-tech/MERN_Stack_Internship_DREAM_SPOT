import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios'; // Adjust path based on your structure
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PendingRequests = () => {
    // --- State Management ---
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('All');
    
    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- NEW: Barcode Print State ---
    const labelRef = useRef();
    const [labelData, setLabelData] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        fetchPendingQueue();
        
        // Optional: Live polling every 15 seconds to catch new doctor prescriptions automatically
        const interval = setInterval(() => fetchPendingQueue(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchPendingQueue = async (isBackground = false) => {
        if (!isBackground) setIsRefreshing(true);
        try {
            // Fetch concurrently from both sources
            const [opdRes, ipdRes] = await Promise.all([
                api.get('/opd_consultations'),
                api.get('/ipd_rounds')
            ]);

            // Filter & Normalize OPD Data
            const pendingOPD = opdRes.data
                .filter(item => item.lab_status === 'pending')
                .map(item => ({
                    original_id: item.id,
                    patient_name: item.patient_name,
                    patient_id: item.patient_id,
                    source: 'OPD',
                    doctor_name: item.doctor_name,
                    LabTest_advised: item.LabTest_advised || [],
                    date: item.opd_date || item.created_at || new Date().toISOString()
                }));

            // Filter & Normalize IPD Data
            const pendingIPD = ipdRes.data
                .filter(item => item.lab_status === 'pending')
                .map(item => ({
                    original_id: item.id,
                    patient_name: item.patient_name,
                    patient_id: item.patient_id,
                    source: 'IPD',
                    doctor_name: item.doctor_name,
                    LabTest_advised: item.LabTest_advised || [],
                    date: item.round_date || item.created_at || new Date().toISOString()
                }));

            // Combine and Sort FIFO (Oldest first to clear the oldest queue items)
            const combinedQueue = [...pendingOPD, ...pendingIPD].sort(
                (a, b) => new Date(a.date) - new Date(b.date)
            );

            setPendingRequests(combinedQueue);
        } catch (error) {
            console.error("Error fetching pending lab queue:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // --- Derived State (Stats & Filtering) ---
    const totalPending = pendingRequests.length;
    const pendingOPD = pendingRequests.filter(req => req.source === 'OPD').length;
    const pendingIPD = pendingRequests.filter(req => req.source === 'IPD').length;

    const filteredRequests = pendingRequests.filter(req => {
        const matchesSearch = req.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              req.original_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = sourceFilter === 'All' || req.source === sourceFilter;
        return matchesSearch && matchesSource;
    });

    // --- Handlers ---
    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setShowConfirmModal(true);
    };

    const handleAcceptRequest = async () => {
        setIsProcessing(true);
        try {
            const newOrderId = `ORD-LAB-${Date.now()}`;
            
            // 1. Push data to Lab Active Orders
            const activeOrderPayload = {
                id: newOrderId,
                original_request_id: selectedRequest.original_id,
                patient_name: selectedRequest.patient_name,
                patient_id: selectedRequest.patient_id,
                source: selectedRequest.source,
                doctor_name: selectedRequest.doctor_name,
                tests: selectedRequest.LabTest_advised,
                status: 'active',
                accepted_at: new Date().toISOString()
            };
            await api.post('/lab_active_orders', activeOrderPayload);

            // 2. Update original record's lab_status so it leaves the pending queue
            const endpoint = selectedRequest.source === 'OPD' ? '/opd_consultations' : '/ipd_rounds';
            await api.patch(`${endpoint}/${selectedRequest.original_id}`, { lab_status: 'active' });

            // 3. Setup data for the barcode label
            setLabelData({ ...selectedRequest, newOrderId });

            // 4. Generate PDF Barcode Label (Wait briefly for DOM to render hidden div)
            setTimeout(async () => {
                try {
                    const canvas = await html2canvas(labelRef.current, { scale: 3 });
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Create a small 50mm x 30mm label PDF
                    const pdf = new jsPDF('l', 'mm', [50, 30]);
                    pdf.addImage(imgData, 'PNG', 0, 0, 50, 30);
                    pdf.save(`Barcode_${selectedRequest.patient_name}_${newOrderId}.pdf`);
                } catch (pdfErr) {
                    console.error("Barcode PDF failed to generate:", pdfErr);
                } finally {
                    // 5. Update local state to reflect change instantly and close modal
                    setPendingRequests(prev => prev.filter(req => req.original_id !== selectedRequest.original_id));
                    setShowConfirmModal(false);
                    setSelectedRequest(null);
                    setLabelData(null);
                    setIsProcessing(false);
                }
            }, 500);
            
        } catch (error) {
            console.error("Failed to process lab request:", error);
            alert("Failed to process request. Check server connection.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 fw-bold text-dark"><i className="fa-solid fa-flask text-primary me-2"></i> Pending Lab Requests</h3>
                <button 
                    className="btn btn-outline-success fw-bold px-3" 
                    onClick={() => fetchPendingQueue(false)} 
                    disabled={isRefreshing}
                >
                    <i className={`fa-solid fa-arrows-rotate me-2 ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    {isRefreshing ? 'Refreshing...' : 'Refresh Queue'}
                </button>
            </div>

            {/* --- Stats Row --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-secondary border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Total Pending</h6>
                        <h2 className="mb-0 fw-bold">{loading ? '-' : totalPending}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-primary border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">OPD Requests</h6>
                        <h2 className="mb-0 fw-bold text-primary">{loading ? '-' : pendingOPD}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-4" style={{ borderBottomColor: '#6f42c1'}}>
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">IPD Requests</h6>
                        <h2 className="mb-0 fw-bold" style={{ color: '#6f42c1' }}>{loading ? '-' : pendingIPD}</h2>
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
                                placeholder="Search by Patient Name or Request ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select border-secondary text-dark fw-bold" 
                            value={sourceFilter} 
                            onChange={(e) => setSourceFilter(e.target.value)}
                        >
                            <option value="All">All Sources (OPD & IPD)</option>
                            <option value="OPD">OPD Only</option>
                            <option value="IPD">IPD Only</option>
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
                                <th className="ps-4">Date & Time</th>
                                <th>Request Details</th>
                                <th>Source</th>
                                <th>Doctor</th>
                                <th>Advised Tests</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="fa-solid fa-check-double fs-1 mb-3 text-success opacity-50"></i>
                                        <h5>All caught up!</h5>
                                        <p className="mb-0">There are no pending lab requests at the moment.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.original_id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{new Date(req.date).toLocaleDateString('en-GB')}</div>
                                            <div className="small text-muted">{new Date(req.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{req.patient_name}</div>
                                            <div className="small text-muted">ID: {req.original_id}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${req.source === 'OPD' ? 'bg-primary' : ''}`} style={req.source === 'IPD' ? { backgroundColor: '#6f42c1' } : {}}>
                                                {req.source}
                                            </span>
                                        </td>
                                        <td><span className="fw-semibold text-dark">{req.doctor_name}</span></td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {req.LabTest_advised.map((test, i) => (
                                                    <span key={i} className="badge bg-light text-dark border border-secondary">{test}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn btn-sm btn-success fw-bold px-3 shadow-sm"
                                                onClick={() => handleOpenModal(req)}
                                            >
                                                <i className="fa-solid fa-play me-2"></i> Process
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Accept Request Confirmation Modal --- */}
            {showConfirmModal && selectedRequest && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-success text-white border-bottom-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-clipboard-check me-2"></i> Process Lab Request
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)}></button>
                            </div>
                            
                            <div className="modal-body p-4">
                                <div className="bg-light p-3 rounded border mb-4">
                                    <div className="row">
                                        <div className="col-6">
                                            <small className="text-muted d-block text-uppercase fw-bold">Patient</small>
                                            <h6 className="fw-bold text-primary mb-0">{selectedRequest.patient_name}</h6>
                                        </div>
                                        <div className="col-6 text-end">
                                            <small className="text-muted d-block text-uppercase fw-bold">Source</small>
                                            <h6 className="fw-bold text-dark mb-0">{selectedRequest.source} - {selectedRequest.doctor_name}</h6>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-dark mb-3">Tests to be Processed:</h6>
                                <ul className="list-group mb-4 shadow-sm">
                                    {selectedRequest.LabTest_advised.map((testStr, idx) => (
                                        <li className="list-group-item d-flex justify-content-between align-items-center bg-white" key={idx}>
                                            <span className="fw-semibold text-dark">{testStr}</span>
                                            <i className="fa-solid fa-circle-check text-success"></i>
                                        </li>
                                    ))}
                                </ul>
                                
                                <div className="alert alert-warning py-2 small mb-0">
                                    <i className="fa-solid fa-circle-info me-2"></i> Accepting this request will automatically generate a Specimen Barcode Label and move it to Active Orders.
                                </div>
                            </div>

                            <div className="modal-footer bg-light border-top-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)} disabled={isProcessing}>Cancel</button>
                                <button type="button" className="btn btn-success fw-bold px-4" onClick={handleAcceptRequest} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <><i className="fa-solid fa-circle-notch fa-spin me-2"></i>Printing Label...</>
                                    ) : (
                                        <><i className="fa-solid fa-barcode me-2"></i> Accept & Generate Label</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN PRINT LAYOUT (Specimen Label 50x30mm)
            ========================================= */}
            {labelData && (
                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                    <div 
                        ref={labelRef} 
                        style={{ 
                            width: '50mm', 
                            height: '30mm', 
                            padding: '3mm', 
                            background: 'white', 
                            color: 'black', 
                            fontFamily: 'Arial, sans-serif', 
                            border: '1px solid #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '1mm', marginBottom: '1mm' }}>
                            <strong style={{ fontSize: '8px', letterSpacing: '0.5px' }}>AROGYAONE LAB</strong>
                            <span style={{ fontSize: '6px', paddingTop: '2px' }}>{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                        
                        <div style={{ fontSize: '8px', lineHeight: '1.3' }}>
                            <div className="fw-bold text-truncate">{labelData.patient_name}</div>
                            <div>UHID: <strong>{labelData.patient_id}</strong></div>
                            <div style={{ fontSize: '6px', color: '#444', marginTop: '2px' }}>
                                Tests: {labelData.LabTest_advised.join(', ').substring(0, 30)}{labelData.LabTest_advised.join(', ').length > 30 ? '...' : ''}
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                            {/* Simulated Barcode - Monospace bold font with asterisks */}
                            <div style={{ fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', fontWeight: '900', letterSpacing: '1px' }}>
                                *{labelData.newOrderId.slice(-8)}*
                            </div>
                            <div style={{ fontSize: '5px', marginTop: '1px' }}>{labelData.newOrderId}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingRequests;