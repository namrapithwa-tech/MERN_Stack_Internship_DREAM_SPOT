import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../../assets/images/logo.png'; // Adjust path if needed

const CompletedReports = () => {
    // --- State Management ---
    const [completedReports, setCompletedReports] = useState([]);
    const [masterLabTests, setMasterLabTests] = useState([]); // For Prices & Ranges
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('All'); // 'All', 'Today', 'Last7Days'
    const [sourceFilter, setSourceFilter] = useState('All'); // 'All', 'OPD', 'IPD'
    
    // Modal & Print State
    const [selectedReport, setSelectedReport] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printedReportIds, setPrintedReportIds] = useState([]); // Temporary session tracker

    // Billing State
    const [showBillModal, setShowBillModal] = useState(false);
    const [billAmount, setBillAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [transactionId, setTransactionId] = useState('');
    const [isGeneratingBill, setIsGeneratingBill] = useState(false); // Track bill PDF status
    const [billDataForPdf, setBillDataForPdf] = useState(null); // Data for hidden bill layout
    
    const printRef = useRef();
    const billPrintRef = useRef(); // Ref for the Bill PDF

    // --- Data Fetching ---
    useEffect(() => {
        fetchCompletedReports();
        fetchMasterLabTests();
    }, []);

    const fetchMasterLabTests = async () => {
        try {
            const res = await api.get('/lab_test_master');
            setMasterLabTests(res.data);
        } catch (error) {
            console.error("Error fetching lab test master:", error);
        }
    };

    const fetchCompletedReports = async () => {
        setLoading(true);
        try {
            const res = await api.get('/lab_active_orders');
            
            // CRITICAL: Keep ONLY completed orders and sort newest first
            const completed = res.data
                .filter(order => order.status === 'completed')
                .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
                
            setCompletedReports(completed);
        } catch (error) {
            console.error("Error fetching completed reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Date Helper Functions ---
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    };

    const isWithin7Days = (dateString) => {
        const date = new Date(dateString);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= sevenDaysAgo;
    };

    // --- Derived State (Stats) ---
    const totalReports = completedReports.length;
    const reportsToday = completedReports.filter(report => isToday(report.completed_at)).length;
    const ipdCount = completedReports.filter(report => report.source === 'IPD').length;
    const opdCount = completedReports.filter(report => report.source === 'OPD').length;

    // --- Filtering Logic ---
    const filteredReports = completedReports.filter(report => {
        // Text Search
        const matchesSearch = report.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              report.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              report.id?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Source Filter
        const matchesSource = sourceFilter === 'All' || report.source === sourceFilter;
        
        // Date Filter
        let matchesDate = true;
        if (dateFilter === 'Today') matchesDate = isToday(report.completed_at);
        if (dateFilter === 'Last7Days') matchesDate = isWithin7Days(report.completed_at);

        return matchesSearch && matchesSource && matchesDate;
    });

    // --- Handlers ---
    const handleView = (report) => {
        setSelectedReport(report);
        setShowViewModal(true);
    };

    const handlePrintRequest = (report) => {
        setSelectedReport(report);
        setIsPrinting(true);
        
        // Allow React a moment to render the hidden print layout with the new selectedReport data
        setTimeout(() => {
            generatePDF(report);
        }, 500);
    };

    // --- MULTI-PAGE PDF GENERATION LOGIC ---
    const generatePDF = async (report) => {
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // A4 width in mm (~210)
            const pageHeight = pdf.internal.pageSize.getHeight(); // A4 height in mm (~297)
            
            // Calculate how tall the captured image is in PDF millimeters
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            // Add the first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            // If the content is longer than one page, loop and add new pages
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight; // Shift the image up to show the next chunk
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`LabReport_${report.patient_name.replace(/\s+/g, '_')}_${report.id}.pdf`);
            
            // Mark as printed locally AND in the database so it survives page refreshes
            if (!report.is_printed) {
                setPrintedReportIds(prev => [...prev, report.id]);
                
                // Update database
                await api.patch(`/lab_active_orders/${report.id}`, { is_printed: true });
                
                // Update local state array
                setCompletedReports(prev => prev.map(r => r.id === report.id ? {...r, is_printed: true} : r));
            }
        } catch (err) {
            console.error("PDF Generation failed:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsPrinting(false);
            if (!showViewModal) setSelectedReport(null); 
        }
    };

    // --- Billing Handlers ---
    const handleOpenBill = (report) => {
        setSelectedReport(report);
        
        // Calculate Total Amount from Master Lab Tests
        let total = 0;
        report.tests.forEach(testName => {
            const masterTest = masterLabTests.find(m => m.test_name === testName);
            if (masterTest && masterTest.price) {
                total += Number(masterTest.price);
            }
        });
        
        setBillAmount(total);
        setPaymentMode('Cash');
        setTransactionId('');
        setShowBillModal(true);
    };

    const handleSaveBill = async (e) => {
        e.preventDefault();
        setIsGeneratingBill(true);
        try {
            const invoiceNo = `INV-${Date.now()}`;
            
            const billPayload = {
                order_id: selectedReport.id,
                invoice_no: invoiceNo,
                patient_name: selectedReport.patient_name,
                patient_id: selectedReport.patient_id,
                amount: billAmount, // This is saved as 'amount'
                payment_mode: paymentMode,
                transaction_id: paymentMode === 'UPI' ? transactionId : null,
                date: new Date().toISOString()
            };
            
            console.log("Bill Saved:", billPayload);

            // Update database so it knows this order is billed
            await api.patch(`/lab_active_orders/${selectedReport.id}`, { is_billed: true });
            
            // Update local state instantly
            setCompletedReports(prev => prev.map(r => r.id === selectedReport.id ? {...r, is_billed: true} : r));
            
            // Prepare data for the hidden invoice layout
            setBillDataForPdf({ ...selectedReport, ...billPayload });

            // Generate the Bill PDF after a brief delay for rendering
            setTimeout(() => {
                generateBillPDF(selectedReport.patient_name, invoiceNo);
            }, 500);

        } catch (error) {
            console.error("Billing failed", error);
            alert("Failed to generate bill.");
            setIsGeneratingBill(false);
        }
    };

    // Function to generate the Invoice PDF
    const generateBillPDF = async (patientName, invoiceNo) => {
        try {
            const canvas = await html2canvas(billPrintRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            // Using A5 size for a standard receipt/invoice look (148mm x 210mm)
            const pdf = new jsPDF('p', 'mm', 'a5');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Lab_Invoice_${patientName.replace(/\s+/g, '_')}_${invoiceNo}.pdf`);
            
            setShowBillModal(false);
            setSelectedReport(null);
            setBillDataForPdf(null);
        } catch (err) {
            console.error("Bill PDF Generation failed:", err);
            alert("Failed to generate Bill PDF.");
        } finally {
            setIsGeneratingBill(false);
        }
    };

    // --- Helper to render results dynamically ---
    const renderResultContent = (testName, resultData, isPDF = false) => {
        if (typeof resultData !== 'object' || resultData === null) {
            return <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', color: '#000', paddingLeft: '5px' }}>{resultData || 'No findings recorded.'}</div>;
        }

        const masterTest = masterLabTests.find(m => m.test_name === testName);
        
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: isPDF ? '12px' : '14px' }} className={!isPDF ? "table table-sm table-bordered mt-3" : ""}>
                <thead style={isPDF ? { backgroundColor: '#f8f9fa' } : {}} className={!isPDF ? "table-light" : ""}>
                    <tr style={isPDF ? { borderBottom: '2px solid #ccc', textAlign: 'left' } : {}}>
                        <th style={isPDF ? { padding: '8px' } : {}}>Parameter</th>
                        <th style={isPDF ? { padding: '8px' } : {}}>Result</th>
                        <th style={isPDF ? { padding: '8px' } : {}}>Unit</th>
                        <th style={isPDF ? { padding: '8px' } : {}}>Reference Range</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(resultData).map(([paramName, val], i) => {
                        const paramDef = masterTest?.parameters?.find(p => p.name === paramName);
                        return (
                            <tr key={i} style={isPDF ? { borderBottom: '1px solid #eee' } : {}}>
                                <td style={isPDF ? { padding: '8px' } : {}}>{paramName}</td>
                                <td style={isPDF ? { padding: '8px', fontWeight: 'bold' } : {}} className="fw-bold">{val}</td>
                                <td style={isPDF ? { padding: '8px' } : {}}>{paramDef?.unit || '-'}</td>
                                <td style={isPDF ? { padding: '8px', color: '#555' } : {}} className="text-muted">{paramDef?.normal_range || '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div className="container-fluid py-4">
            
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 fw-bold text-dark">
                    <i className="fa-solid fa-file-prescription text-success me-2"></i> Completed Lab Reports
                </h3>
                <button className="btn btn-outline-secondary fw-bold px-3" onClick={fetchCompletedReports}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Archive
                </button>
            </div>

            {/* --- Stats Row --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-success border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Total Reports Generated</h6>
                        <h2 className="mb-0 fw-bold text-success">{loading ? '-' : totalReports}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-warning border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">Reports Finalized Today</h6>
                        <h2 className="mb-0 fw-bold text-warning">{loading ? '-' : reportsToday}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card-common bg-white shadow-sm border-0 text-center py-3 border-bottom border-primary border-4">
                        <h6 className="text-muted mb-1 text-uppercase fw-bold">IPD / OPD Split</h6>
                        <h3 className="mb-0 fw-bold text-dark">
                            <span className="text-purple" style={{ color: '#6f42c1' }}>{loading ? '-' : ipdCount} IPD</span> 
                            <span className="text-muted mx-2">|</span> 
                            <span className="text-primary">{loading ? '-' : opdCount} OPD</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="card-common bg-white shadow-sm border-0 mb-4 p-3">
                <div className="row g-3">
                    <div className="col-md-6">
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
                    <div className="col-md-3">
                        <select className="form-select border-secondary" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                            <option value="All">All Time</option>
                            <option value="Today">Today</option>
                            <option value="Last7Days">Last 7 Days</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select border-secondary" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                            <option value="All">All Sources</option>
                            <option value="OPD">OPD</option>
                            <option value="IPD">IPD</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- Master Archive Table --- */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">Completed On</th>
                                <th>Order ID</th>
                                <th>Patient Details</th>
                                <th>Source & Doctor</th>
                                <th>Tests Performed</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-success"></div></td></tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        <i className="fa-solid fa-folder-open fs-1 mb-3 text-secondary opacity-50"></i>
                                        <h5>No reports found</h5>
                                        <p className="mb-0">Try adjusting your search or filter criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{new Date(report.completed_at).toLocaleDateString('en-GB')}</div>
                                            <div className="small text-muted">{new Date(report.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-secondary">{report.id}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{report.patient_name}</div>
                                            <div className="small text-muted">UHID: {report.patient_id}</div>
                                        </td>
                                        <td>
                                            <div className="fw-semibold text-dark">{report.doctor_name}</div>
                                            <div className="small text-muted badge bg-light text-dark border mt-1">{report.source}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{ maxWidth: '250px' }} title={report.tests?.join(', ')}>
                                                {report.tests?.join(', ')}
                                            </div>
                                        </td>
                                        <td className="text-center pe-4">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-outline-info fw-bold px-3" onClick={() => handleView(report)}>
                                                    <i className="fa-solid fa-eye"></i> View
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-dark fw-bold px-3" 
                                                    onClick={() => handlePrintRequest(report)}
                                                    disabled={isPrinting && selectedReport?.id === report.id}
                                                >
                                                    {isPrinting && selectedReport?.id === report.id ? (
                                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <><i className="fa-solid fa-print"></i> {(report.is_printed || printedReportIds.includes(report.id)) ? 'Re-Print' : 'Print'}</>
                                                    )}
                                                </button>

                                                {/* BILLING LOGIC: Check both DB status and local array */}
                                                {report.source === 'OPD' && (report.is_printed || printedReportIds.includes(report.id)) && (
                                                    report.is_billed ? (
                                                        <span className="badge bg-success bg-opacity-25 text-success border border-success ms-2 py-2">
                                                            <i className="fa-solid fa-check-double me-1"></i> Billed
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            className="btn btn-sm btn-success fw-bold px-3 ms-2"
                                                            onClick={() => handleOpenBill(report)}
                                                        >
                                                            <i className="fa-solid fa-file-invoice-dollar"></i> Bill
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: VIEW RESULTS (READ-ONLY)
            ========================================= */}
            {showViewModal && selectedReport && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-info text-white border-bottom-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-file-medical me-2"></i> Lab Report Details
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
                            </div>
                            
                            <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                                {/* Context Banner */}
                                <div className="bg-light p-3 rounded border mb-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">{selectedReport.patient_name}</h5>
                                        <small className="text-muted">UHID: {selectedReport.patient_id} | Ref By: {selectedReport.doctor_name}</small>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-success mb-1"><i className="fa-solid fa-check me-1"></i>Completed</span>
                                        <br />
                                        <small className="text-muted fw-bold">Order ID: {selectedReport.id}</small>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-2 text-uppercase">Test Results & Findings</h6>
                                
                                {selectedReport.results && Object.keys(selectedReport.results).length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {Object.entries(selectedReport.results).map(([testName, resultData], idx) => (
                                            <div className="card shadow-sm border-0 bg-light" key={idx}>
                                                <div className="card-header bg-transparent border-bottom fw-bold text-primary py-2">
                                                    <i className="fa-solid fa-vial text-muted me-2"></i>{testName}
                                                </div>
                                                <div className="card-body p-3">
                                                    {renderResultContent(testName, resultData, false)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="alert alert-warning">No results were saved for this order.</div>
                                )}
                            </div>

                            <div className="modal-footer bg-light border-top-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                                <button type="button" className="btn btn-dark fw-bold px-4" onClick={() => handlePrintRequest(selectedReport)} disabled={isPrinting}>
                                    <i className="fa-solid fa-print me-2"></i> Print Official PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: GENERATE OPD BILL
            ========================================= */}
            {showBillModal && selectedReport && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-success text-white border-bottom-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-file-invoice-dollar me-2"></i> Generate OPD Lab Bill
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillModal(false)}></button>
                            </div>
                            
                            <form onSubmit={handleSaveBill}>
                                <div className="modal-body p-4">
                                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                        <span className="text-muted fw-bold">Patient Name:</span>
                                        <span className="fw-bold text-dark">{selectedReport.patient_name}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                        <span className="text-muted fw-bold">Order ID:</span>
                                        <span className="text-dark">{selectedReport.id}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
                                        <span className="text-muted fw-bold">Total Amount to Collect:</span>
                                        <span className="fw-bold fs-4 text-success">₹{billAmount}</span>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold text-dark small mb-2">Payment Mode</label>
                                        <select className="form-select border-success" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                            <option value="Cash">Cash</option>
                                            <option value="UPI">UPI / Online</option>
                                        </select>
                                    </div>

                                    {paymentMode === 'UPI' && (
                                        <div className="mb-3">
                                            <label className="fw-bold text-dark small mb-2">Transaction ID <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Enter UPI Transaction Reference..." 
                                                value={transactionId} 
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer bg-light border-top-0">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowBillModal(false)} disabled={isGeneratingBill}>Cancel</button>
                                    <button type="submit" className="btn btn-success fw-bold px-4" disabled={isGeneratingBill}>
                                        {isGeneratingBill ? (
                                            <><i className="fa-solid fa-spinner fa-spin me-2"></i> Generating Receipt...</>
                                        ) : (
                                            <><i className="fa-solid fa-check-double me-2"></i> Collect & Print Bill</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN PRINT LAYOUT: MEDICAL LAB REPORT
            ========================================= */}
            {selectedReport && (
                <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1000 }}>
                    <div className="print-offscreen" ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm', paddingBottom: '100px', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* HEADER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={logo} alt="Logo" style={{ width: '70px', height: '70px', marginRight: '15px' }} />
                                <div>
                                    <h1 style={{ margin: '0', color: '#10b981', fontSize: '28px', fontWeight: 'bold' }}>ArogyaOne Hospital</h1>
                                    <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Department of Laboratory Medicine</p>
                                    <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Mavdi Chokadi, 150ft Ring Road, Rajkot - Gujarat.</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ margin: '0', fontSize: '22px', fontWeight: 'bold', color: '#dc3545' }}>LABORATORY REPORT</h3>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Order ID: {selectedReport.id}</p>
                                <p style={{ margin: '0', fontSize: '12px' }}>Reported: {new Date(selectedReport.completed_at).toLocaleString('en-GB')}</p>
                            </div>
                        </div>

                        {/* PATIENT INFO BANNER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', border: '1px solid #ddd', padding: '12px', borderRadius: '5px', marginBottom: '25px', fontSize: '14px' }}>
                            <div style={{ width: '50%' }}>
                                <div style={{ marginBottom: '4px' }}><strong>Patient Name:</strong> <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedReport.patient_name}</span></div>
                                <div style={{ marginBottom: '4px' }}><strong>UHID:</strong> {selectedReport.patient_id}</div>
                                <div><strong>Source:</strong> {selectedReport.source}</div>
                            </div>
                            <div style={{ width: '50%', textAlign: 'right' }}>
                                <div style={{ marginBottom: '4px' }}><strong>Referring Doctor:</strong> {selectedReport.doctor_name}</div>
                                <div style={{ marginBottom: '4px' }}><strong>Collected:</strong> {new Date(selectedReport.accepted_at).toLocaleString('en-GB')}</div>
                                <div><strong>Status:</strong> Final / Verified</div>
                            </div>
                        </div>

                        {/* CLINICAL BODY (RESULTS) */}
                        <div style={{ padding: '0 10px' }}>
                            {selectedReport.results && Object.keys(selectedReport.results).length > 0 ? (
                                Object.entries(selectedReport.results).map(([testName, resultData], idx) => (
                                    <div key={idx} style={{ marginBottom: '30px' }}>
                                        <div style={{ borderBottom: '2px solid #10b981', paddingBottom: '5px', marginBottom: '10px' }}>
                                            <h4 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', color: '#333' }}>
                                                {testName}
                                            </h4>
                                        </div>
                                        {renderResultContent(testName, resultData, true)}
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontStyle: 'italic', color: '#777' }}>No specific parameter findings were recorded for this order.</p>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div style={{ position: 'absolute', bottom: '30px', left: '15px', right: '15px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                                *** END OF REPORT ***
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #000', paddingTop: '15px' }}>
                                <div style={{ fontSize: '11px', color: '#555', width: '60%' }}>
                                    <strong>Disclaimer:</strong> This is a digitally generated report from the ArogyaOne EMR System. 
                                    These results are strictly for medical professional correlation. Partial reproduction of this report is not permitted.
                                </div>
                                <div style={{ textAlign: 'center', width: '200px' }}>
                                    <div style={{ height: '40px' }}>
                                        <div style={{ color: '#10b981', fontStyle: 'italic', fontFamily: 'serif', fontSize: '18px', paddingTop: '10px' }}>
                                            Digitally Verified
                                        </div>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px solid #000', margin: '5px 0' }}/>
                                    <strong>Lab Technician / Pathologist</strong><br/>
                                    <span style={{ fontSize: '11px' }}>ArogyaOne Laboratory Dept.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                HIDDEN PRINT LAYOUT: BILLING INVOICE (A5 Size)
            ========================================= */}
            {billDataForPdf && (
                <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1000 }}>
                    <div className="print-offscreen" ref={billPrintRef} style={{ width: '148mm', minHeight: '210mm', padding: '10mm', background: 'white', color: 'black', fontFamily: 'Arial, sans-serif' }}>
                        
                        {/* INVOICE HEADER */}
                        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h1 style={{ margin: '0', color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>ArogyaOne Hospital</h1>
                            <p style={{ margin: '0', fontSize: '12px', color: '#555' }}>Mavdi Chokadi, 150ft Ring Road, Rajkot - Gujarat.</p>
                            <h3 style={{ margin: '10px 0 0 0', fontSize: '16px', fontWeight: 'bold', background: '#eee', padding: '5px', borderRadius: '3px' }}>LABORATORY PAYMENT RECEIPT</h3>
                        </div>

                        {/* INVOICE DETAILS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '20px' }}>
                            <div>
                                <div><strong>Invoice No:</strong> {billDataForPdf.invoiceNo}</div>
                                <div><strong>Date:</strong> {new Date(billDataForPdf.date).toLocaleString('en-GB')}</div>
                                <div><strong>Payment Mode:</strong> {billDataForPdf.paymentMode} {billDataForPdf.transactionId ? `(${billDataForPdf.transactionId})` : ''}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div><strong>Patient Name:</strong> {billDataForPdf.patient_name}</div>
                                <div><strong>UHID:</strong> {billDataForPdf.patient_id}</div>
                                <div><strong>Ref Doctor:</strong> {billDataForPdf.doctor_name}</div>
                            </div>
                        </div>

                        {/* ITEMIZED TESTS */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                                    <th style={{ padding: '5px 0' }}>S.No</th>
                                    <th style={{ padding: '5px 0' }}>Description (Lab Test)</th>
                                    <th style={{ padding: '5px 0', textAlign: 'right' }}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billDataForPdf.tests.map((testName, i) => {
                                    const masterTest = masterLabTests.find(m => m.test_name === testName);
                                    const price = masterTest?.price ? Number(masterTest.price) : 0;
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px 0' }}>{i + 1}</td>
                                            <td style={{ padding: '8px 0', fontWeight: 'bold' }}>{testName}</td>
                                            <td style={{ padding: '8px 0', textAlign: 'right' }}>{price.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* TOTAL */}
                        <div style={{ borderTop: '2px solid #000', paddingTop: '10px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                            {/* FIX: Corrected object property from billAmount to amount */}
                            Total Amount Paid: ₹{Number(billDataForPdf.amount).toFixed(2)}
                        </div>

                        {/* FOOTER */}
                        <div style={{ position: 'absolute', bottom: '15mm', left: '10mm', right: '10mm', textAlign: 'center', fontSize: '10px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                            Thank you for trusting ArogyaOne Hospital.<br/>
                            This is a computer-generated receipt and does not require a physical signature.
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CompletedReports;