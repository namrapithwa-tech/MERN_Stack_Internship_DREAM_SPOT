import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../../assets/images/logo.png'; 

const IPDBilling = () => {
    // --- State Management ---
    const [patients, setPatients] = useState([]);
    const [billedInvoices, setBilledInvoices] = useState([]);
    const [roomsMaster, setRoomsMaster] = useState([]);
    const [doctorsMaster, setDoctorsMaster] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    // Modal States
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Advance Payment State
    const [advanceData, setAdvanceData] = useState({ amount: '', payment_mode: 'Cash', transaction_id: '' });

    // Billing Aggregation State
    const [billDetails, setBillDetails] = useState(null);
    
    // Custom Form States for Billing
    const [extraCharges, setExtraCharges] = useState([]);
    const [newExtraCharge, setNewExtraCharge] = useState({ name: '', rate: '', qty: '1' });
    const [discount, setDiscount] = useState(0);
    const [finalPaymentMode, setFinalPaymentMode] = useState('Cash');
    const [finalTxnId, setFinalTxnId] = useState('');

    // --- Initial Data Fetching ---
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [admissionsRes, billsRes, roomsRes, doctorsRes] = await Promise.all([
                api.get('/ipd_admissions'),
                api.get('/ipd_bills').catch(() => ({ data: [] })),
                api.get('/rooms').catch(() => ({ data: [] })),
                api.get('/doctors').catch(() => ({ data: [] }))
            ]);

            setPatients(admissionsRes.data || []);
            setBilledInvoices((billsRes.data || []).sort((a, b) => new Date(b.bill_date) - new Date(a.bill_date)));
            setRoomsMaster(roomsRes.data || []);
            setDoctorsMaster(doctorsRes.data || []);
        } catch (error) {
            console.error("Error fetching Billing Data:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- ADVANCE PAYMENT HANDLERS ---
    const handleOpenAdvance = (patient) => {
        setSelectedPatient(patient);
        setAdvanceData({ amount: '', payment_mode: 'Cash', transaction_id: '' });
        setShowAdvanceModal(true);
    };

    const handleSaveAdvance = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const payload = {
                id: `ADV-${Date.now()}`,
                ipd_admission_id: selectedPatient.id,
                amount: Number(advanceData.amount),
                payment_mode: advanceData.payment_mode,
                transaction_id: advanceData.payment_mode === 'UPI' ? advanceData.transaction_id : null,
                date: new Date().toISOString()
            };
            await api.post('/ipd_advances', payload);
            alert(`Advance of ₹${payload.amount} saved successfully!`);
            setShowAdvanceModal(false);
        } catch (error) {
            console.error("Failed to save advance", error);
            alert("Failed to save advance payment.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- AGGREGATION ENGINE (Triggered on "Generate Final Bill") ---
    const handleGenerateBill = async (patient) => {
        setSelectedPatient(patient);
        setExtraCharges([]);
        setDiscount(0);
        setFinalPaymentMode('Cash');
        setFinalTxnId('');

        try {
            const [labRes, surgRes, roundsRes, advancesRes] = await Promise.all([
                api.get(`/lab_active_orders?patient_id=${patient.patient_id}&source=IPD&status=completed`).catch(() => ({ data: [] })),
                api.get(`/surgery_schedules?ipd_admission_id=${patient.id}&status=Completed`).catch(() => ({ data: [] })),
                api.get(`/ipd_rounds?ipd_admission_id=${patient.id}`).catch(() => ({ data: [] })),
                api.get(`/ipd_advances?ipd_admission_id=${patient.id}`).catch(() => ({ data: [] }))
            ]);

            // Calculate Days Stayed using clinical discharge date if available
            const admDate = new Date(patient.admission_date);
            const disDateStr = patient.discharge_details?.discharge_date;
            const endPoint = disDateStr ? new Date(disDateStr) : new Date();
            
            const diffTime = Math.abs(endPoint - admDate);
            let daysStayed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (daysStayed === 0) daysStayed = 1; 
            
            const matchedRoom = roomsMaster.find(r => r.room_number === patient.room_number);
            const roomRate = matchedRoom ? Number(matchedRoom.room_rent_per_day) : 0;
            const roomTotal = daysStayed * roomRate;

            const totalRounds = (roundsRes.data || []).length;
            const roundRate = 400;
            const roundsTotal = totalRounds * roundRate;

            const docName = patient.consultant_doctor_name || patient.admitting_doctor || patient.doctor_name || 'Not Assigned';
            const matchedDoctor = doctorsMaster.find(d => d.full_name === docName);
            const doctorDept = matchedDoctor ? matchedDoctor.department : 'General';

            const labMaster = await api.get('/lab_test_master').then(res=>res.data).catch(()=>[]);
            let labTotal = 0;
            (labRes.data || []).forEach(order => {
                order.tests.forEach(testName => {
                    const testDef = labMaster.find(m => m.test_name === testName);
                    if (testDef && testDef.price) labTotal += Number(testDef.price);
                });
            });

            const otMaster = await api.get('/operation_theaters').then(res=>res.data).catch(()=>[]);
            let surgeryTotal = 0;
            (surgRes.data || []).forEach(surgery => {
                const otRoom = otMaster.find(r => r.id === surgery.ot_room_id);
                if (otRoom && otRoom.base_price) surgeryTotal += Number(otRoom.base_price);
                if (surgery.post_op_details) {
                    surgeryTotal += Number(surgery.post_op_details.surgeon_fee || 0);
                    surgeryTotal += Number(surgery.post_op_details.anesthesia_fee || 0);
                }
            });

            const advancesArray = advancesRes.data || [];
            const advanceTotal = advancesArray.reduce((sum, adv) => sum + Number(adv.amount), 0);

            setBillDetails({
                daysStayed, roomRate, roomTotal,
                totalRounds, roundRate, roundsTotal,
                docName, doctorDept,
                labTotal,
                surgeryTotal,
                advanceTotal,
                advancesList: advancesArray 
            });

            setShowBillModal(true);
        } catch (error) {
            console.error("Aggregation Error:", error);
            alert("Failed to aggregate bill data.");
        }
    };

    const handleAddExtraCharge = () => {
        if (!newExtraCharge.name || !newExtraCharge.rate || !newExtraCharge.qty) return;
        const amount = Number(newExtraCharge.rate) * Number(newExtraCharge.qty);
        setExtraCharges([...extraCharges, { ...newExtraCharge, amount }]);
        setNewExtraCharge({ name: '', rate: '', qty: '1' });
    };

    const handleRemoveExtraCharge = (index) => {
        const updated = [...extraCharges];
        updated.splice(index, 1);
        setExtraCharges(updated);
    };

    const extraTotal = extraCharges.reduce((sum, item) => sum + item.amount, 0);
    const grossTotal = billDetails ? (billDetails.roomTotal + billDetails.roundsTotal + billDetails.labTotal + billDetails.surgeryTotal + extraTotal) : 0;
    const netPayable = grossTotal - Number(discount) - (billDetails?.advanceTotal || 0);

    // --- SAVE TO DB & CLOSE FILE ---
    const handleConfirmBill = async () => {
        setIsGenerating(true);
        try {
            const invoiceNo = `INV-IPD-${Date.now()}`;
            const billDate = new Date().toISOString();
            
            const finalDischargeDate = selectedPatient.discharge_details?.discharge_date || billDate;

            const finalBillRecord = {
                id: invoiceNo,
                ipd_admission_id: selectedPatient.id,
                patient_name: selectedPatient.patient_name,
                patient_id: selectedPatient.patient_id,
                admitting_doctor: billDetails.docName,
                doctor_dept: billDetails.doctorDept,
                room_number: selectedPatient.room_number,
                admission_date: selectedPatient.admission_date,
                discharge_date: finalDischargeDate,
                itemized: {
                    room: { days: billDetails.daysStayed, rate: billDetails.roomRate, total: billDetails.roomTotal },
                    rounds: { count: billDetails.totalRounds, rate: billDetails.roundRate, total: billDetails.roundsTotal },
                    labTotal: billDetails.labTotal,
                    surgeryTotal: billDetails.surgeryTotal,
                    extras: extraCharges,
                    advances: billDetails.advancesList
                },
                gross_total: grossTotal,
                discount: Number(discount),
                advance_paid: billDetails.advanceTotal,
                net_payable: Math.max(0, netPayable),
                payment_mode: finalPaymentMode,
                transaction_id: finalPaymentMode === 'UPI' ? finalTxnId : null,
                bill_date: billDate,
                status: 'Billed'
            };

            await api.post('/ipd_bills', finalBillRecord);
            
            await api.patch(`/ipd_admissions/${selectedPatient.id}`, { 
                billing_status: 'CLOSED'
            });

            setBilledInvoices([finalBillRecord, ...billedInvoices]);
            setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, billing_status: 'CLOSED' } : p));
            setShowBillModal(false);

            generateInvoicePDF(finalBillRecord);
            setSelectedPatient(null);

        } catch (error) {
            console.error("Billing Error:", error);
            alert("Failed to save final bill.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateInvoicePDF = (billData) => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const totalPagesExp = '{total_pages_count_string}';
            
            const admDate = new Date(billData.admission_date).toLocaleDateString('en-GB');
            
            let disDate = 'N/A';
            if (billData.discharge_date) {
                const d = new Date(billData.discharge_date);
                if (!isNaN(d.getTime())) {
                    disDate = d.toLocaleDateString('en-GB'); 
                }
            }

            const tableBody = [
                [{ content: 'A. Room & Visit Charges', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['1', `IPD Room Rent (${billData.itemized.room.days} Days @ Rs.${billData.itemized.room.rate}/day)`, '', `Rs. ${billData.itemized.room.total.toFixed(2)}`],
                ['2', `Doctor IPD Visits (${billData.itemized.rounds.count} Rounds @ Rs.${billData.itemized.rounds.rate}/visit)`, '', `Rs. ${billData.itemized.rounds.total.toFixed(2)}`],
                
                [{ content: 'B. Laboratory & Diagnostics', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['3', 'Pathology & Diagnostic Tests (Consolidated)', '', `Rs. ${billData.itemized.labTotal.toFixed(2)}`],
                
                [{ content: 'C. Operation Theater & Surgery', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['4', 'OT Rent, Surgeon Fees & Anesthesia (Consolidated)', '', `Rs. ${billData.itemized.surgeryTotal.toFixed(2)}`],
                
                [{ content: 'D. Pharmacy, Consumables & Miscellaneous', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
            ];

            if (billData.itemized.extras && billData.itemized.extras.length > 0) {
                billData.itemized.extras.forEach((charge, idx) => {
                    tableBody.push([`5.${idx + 1}`, charge.name, `${charge.qty} @ Rs.${charge.rate}`, `Rs. ${charge.amount.toFixed(2)}`]);
                });
            } else {
                tableBody.push(['', 'No extra charges added', '', '-']);
            }

            tableBody.push([{ content: '', colSpan: 4, styles: { fillColor: [255, 255, 255], border: 0, minCellHeight: 5 } }]);
            
            tableBody.push(['', { content: 'Gross Total:', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `Rs. ${billData.gross_total.toFixed(2)}`, styles: { fontStyle: 'bold' } }]);
            tableBody.push(['', { content: 'Less: Discount:', colSpan: 2, styles: { halign: 'right' } }, `Rs. ${billData.discount.toFixed(2)}`]);
            
            if (billData.itemized.advances && billData.itemized.advances.length > 0) {
                tableBody.push(['', { content: 'Advance Payments Breakdown:', colSpan: 3, styles: { fontStyle: 'italic', textColor: [100,100,100] } }]);
                billData.itemized.advances.forEach(adv => {
                    const advDate = new Date(adv.date).toLocaleDateString('en-GB');
                    tableBody.push(['', { content: `Paid on ${advDate} via ${adv.payment_mode}`, colSpan: 2, styles: { halign: 'right', textColor: [100,100,100] } }, `(Rs. ${adv.amount.toFixed(2)})`]);
                });
            } else {
                tableBody.push(['', { content: 'Less: Total Advance Paid:', colSpan: 2, styles: { halign: 'right' } }, `Rs. ${billData.advance_paid.toFixed(2)}`]);
            }

            tableBody.push([{ content: '', colSpan: 4, styles: { fillColor: [255, 255, 255], border: 0, minCellHeight: 2 } }]);
            tableBody.push(['', { content: `FINAL NET PAYABLE (${billData.payment_mode}):`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 12, textColor: [16, 185, 129] } }, { content: `Rs. ${Math.max(0, billData.net_payable).toFixed(2)}`, styles: { fontStyle: 'bold', fontSize: 12 } }]);

            if (billData.transaction_id) {
                tableBody.push(['', { content: `Txn ID: ${billData.transaction_id}`, colSpan: 3, styles: { halign: 'right', fontSize: 9, textColor: [100,100,100] } }]);
            }

            autoTable(doc, {
                startY: 75,
                head: [['S.No', 'Description / Particulars', 'Qty/Rate', 'Amount (INR)']],
                body: tableBody,
                theme: 'grid',
                styles: { font: 'helvetica', fontSize: 10, lineColor: [40, 40, 40], lineWidth: 0.3, textColor: [20, 20, 20] },
                headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
                columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 35 }, 3: { cellWidth: 35, halign: 'right' } },
                margin: { bottom: 35 },
                
                didDrawPage: function (data) {
                    if (logo) {
                        try { doc.addImage(logo, 'PNG', 14, 8, 14, 14); } catch (e) { console.warn("Logo failed", e); }
                    }

                    doc.setDrawColor(16, 185, 129);
                    doc.setLineWidth(1);
                    doc.line(14, 25, 196, 25);

                    doc.setFontSize(22);
                    doc.setTextColor(16, 185, 129);
                    doc.setFont('helvetica', 'bold');
                    doc.text("ArogyaOne Hospital", 32, 18);
                    
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.setFont('helvetica', 'normal');
                    doc.text("Mavdi Chokadi, 150ft Ring Road, Rajkot - Gujarat", 32, 23);
                    
                    doc.setFontSize(18);
                    doc.setTextColor(40, 40, 40);
                    doc.setFont('helvetica', 'bold');
                    doc.text("FINAL DISCHARGE INVOICE", 196, 18, { align: 'right' });

                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Patient Name: ${billData.patient_name}`, 14, 35);
                    doc.text(`UHID: ${billData.patient_id}`, 14, 41);
                    doc.text(`Consultant: ${billData.admitting_doctor} (${billData.doctor_dept})`, 14, 47);
                    doc.text(`Ward/Room: Room ${billData.room_number}`, 14, 53);
                    
                    doc.text(`Invoice No: ${billData.id}`, 196, 35, { align: 'right' });
                    doc.text(`Admission Date: ${admDate}`, 196, 41, { align: 'right' });
                    doc.text(`Discharge Date: ${disDate}`, 196, 47, { align: 'right' });
                    
                    const pageHeight = doc.internal.pageSize.getHeight();
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(0.5);
                    doc.line(150, pageHeight - 25, 196, pageHeight - 25);
                    doc.setFontSize(10);
                    doc.text("Authorized Signatory", 196, pageHeight - 20, { align: 'right' });

                    doc.setFontSize(9);
                    doc.setTextColor(100, 100, 100);
                    doc.text("Thank you for choosing ArogyaOne Hospital. Wishing you a speedy recovery!", 105, pageHeight - 12, { align: 'center' });
                    
                    let str = "Page " + doc.internal.getNumberOfPages();
                    if (typeof doc.putTotalPages === 'function') str = str + " of " + totalPagesExp;
                    doc.text(str, 105, pageHeight - 6, { align: 'center' });
                }
            });

            if (typeof doc.putTotalPages === 'function') doc.putTotalPages(totalPagesExp);
            doc.save(`Final_Bill_${billData.patient_name.replace(/\s+/g, '_')}_${billData.id}.pdf`);
        } catch (err) {
            console.error("PDF Print Error:", err);
            alert("Error generating PDF.");
        }
    };

    const pendingList = patients.filter(p => 
        (p.status === 'ADMITTED' || p.billing_status === 'PENDING_FINAL_BILL') && 
        (p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.patient_id?.includes(searchTerm))
    );
    
    const billedList = billedInvoices.filter(b => b.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.id?.includes(searchTerm));

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">
                        <i className="fa-solid fa-file-invoice-dollar text-success me-2"></i> IPD Final Billing
                    </h2>
                    <p className="text-muted mb-0 mt-1">Manage advances, aggregate charges, and generate final invoices for clinically discharged patients.</p>
                </div>
                <button className="btn btn-outline-secondary fw-bold rounded-4 shadow-sm" onClick={fetchInitialData}>
                    <i className="fa-solid fa-arrows-rotate me-2"></i> Refresh Data
                </button>
            </div>

            <div className="card-common bg-white shadow-sm border-0 rounded-4 mb-4 p-3">
                <div className="row g-3 align-items-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 rounded-start-4"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 ps-0 rounded-end-4" placeholder="Search by Name, UHID, or Invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <ul className="nav nav-pills d-inline-flex bg-light p-1 rounded-4 border">
                            <li className="nav-item">
                                <button className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'pending' ? 'active bg-white text-primary shadow-sm border' : 'text-muted'}`} onClick={() => setActiveTab('pending')}>
                                    <i className="fa-solid fa-bed-pulse me-2"></i> Pending Bills & Advances
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link rounded-4 fw-bold px-4 ${activeTab === 'billed' ? 'active bg-white text-success shadow-sm border' : 'text-muted'}`} onClick={() => setActiveTab('billed')}>
                                    <i className="fa-solid fa-folder-closed me-2"></i> Billed Archives
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border-0 rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">{activeTab === 'pending' ? 'Status' : 'Admission & Discharge Date'}</th>
                                <th>Patient Details</th>
                                <th>{activeTab === 'pending' ? 'Ward & Room' : 'Invoice Details'}</th>
                                <th>Doctor</th>
                                <th className="text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-success"></div></td></tr>
                            ) : activeTab === 'pending' ? (
                                pendingList.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted"><i className="fa-solid fa-check-double fs-1 mb-3 text-secondary opacity-50"></i><h5>No pending bills found</h5></td></tr>
                                ) : pendingList.map((patient) => (
                                    <tr key={patient.id}>
                                        <td className="ps-4">
                                            {patient.billing_status === 'PENDING_FINAL_BILL' ? (
                                                <span className="badge bg-warning text-dark"><i className="fa-solid fa-file-invoice me-1"></i> Ready for Bill</span>
                                            ) : (
                                                <span className="badge bg-primary"><i className="fa-solid fa-bed me-1"></i> Currently Admitted</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-bold text-primary">{patient.patient_name}</div>
                                            <div className="small text-muted">UHID: {patient.patient_id}</div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-dark">{patient.ward_type}</div>
                                            <div className="small text-muted badge bg-light text-dark border mt-1"><i className="fa-solid fa-door-closed me-1"></i> Room {patient.room_number}</div>
                                        </td>
                                        <td><div className="fw-semibold text-dark"><i className="fa-solid fa-user-doctor text-muted me-1"></i> {patient.consultant_doctor_name || patient.admitting_doctor || 'Not Assigned'}</div></td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-info fw-bold px-3 rounded-pill me-2" onClick={() => handleOpenAdvance(patient)}>
                                                <i className="fa-solid fa-hand-holding-dollar me-1"></i> Advance
                                            </button>
                                            <button 
                                                className={`btn btn-sm fw-bold px-4 rounded-pill shadow-sm ${patient.billing_status === 'PENDING_FINAL_BILL' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => handleGenerateBill(patient)}
                                            >
                                                <i className="fa-solid fa-calculator me-1"></i> Generate Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                billedList.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted"><i className="fa-solid fa-folder-open fs-1 mb-3 text-secondary opacity-50"></i><h5>No billed records found</h5></td></tr>
                                ) : billedList.map((bill) => {
                                    
                                    // Safe date parsing for rendering in table
                                    let disDateStr = 'N/A';
                                    if (bill.discharge_date) {
                                        const d = new Date(bill.discharge_date);
                                        if(!isNaN(d.getTime())) disDateStr = d.toLocaleString('en-GB', {dateStyle:'short', timeStyle:'short'});
                                    }

                                    return (
                                        <tr key={bill.id}>
                                            <td className="ps-4">
                                                <div className="small text-muted mb-1">Adm: {new Date(bill.admission_date).toLocaleDateString('en-GB')}</div>
                                                <div className="fw-bold text-danger">Dis: {disDateStr}</div>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-primary">{bill.patient_name}</div>
                                                <div className="small text-muted">UHID: {bill.patient_id}</div>
                                            </td>
                                            <td>
                                                <div className="fw-bold text-dark">Inv: {bill.id}</div>
                                                <div className="small text-success fw-bold mt-1">₹{bill.net_payable.toLocaleString('en-IN')}</div>
                                            </td>
                                            <td><div className="fw-semibold text-dark"><i className="fa-solid fa-user-doctor text-muted me-1"></i> {bill.admitting_doctor || 'Not Assigned'}</div></td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-dark fw-bold px-4 rounded-pill shadow-sm" onClick={() => generateInvoicePDF(bill)}>
                                                    <i className="fa-solid fa-print me-1"></i> Reprint Bill
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =========================================
                MODAL: TAKE ADVANCE
            ========================================= */}
            {showAdvanceModal && selectedPatient && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
                            <div className="modal-header bg-info text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-hand-holding-dollar me-2"></i> Collect Advance Payment</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAdvanceModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveAdvance}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <strong>Patient:</strong> {selectedPatient.patient_name} (UHID: {selectedPatient.patient_id})
                                    </div>
                                    <div className="mb-3">
                                        <label className="fw-bold small mb-1">Amount (₹)</label>
                                        <input type="number" className="form-control rounded-3" required value={advanceData.amount} onChange={e => setAdvanceData({...advanceData, amount: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="fw-bold small mb-1">Payment Mode</label>
                                        <select className="form-select rounded-3" value={advanceData.payment_mode} onChange={e => setAdvanceData({...advanceData, payment_mode: e.target.value})}>
                                            <option>Cash</option>
                                            <option>UPI</option>
                                        </select>
                                    </div>
                                    {advanceData.payment_mode === 'UPI' && (
                                        <div className="mb-3">
                                            <label className="fw-bold small mb-1">Transaction ID</label>
                                            <input type="text" className="form-control rounded-3" required value={advanceData.transaction_id} onChange={e => setAdvanceData({...advanceData, transaction_id: e.target.value})} />
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowAdvanceModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-info fw-bold rounded-pill px-4 text-white" disabled={isGenerating}>Save Advance</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL: FINAL BILL REVIEW
            ========================================= */}
            {showBillModal && selectedPatient && billDetails && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow rounded-4 overflow-hidden bg-light">
                            <div className="modal-header bg-success text-white border-bottom-0 p-4">
                                <h5 className="modal-title fw-bold"><i className="fa-solid fa-file-invoice me-2"></i> Generate Final Bill</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillModal(false)}></button>
                            </div>
                            
                            <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '75vh' }}>
                                
                                {selectedPatient.billing_status !== 'PENDING_FINAL_BILL' && (
                                    <div className="alert alert-warning border-warning border-2 rounded-4 mb-4 fw-bold">
                                        <i className="fa-solid fa-triangle-exclamation me-2"></i> 
                                        Note: This patient is still Admitted. Generating a bill now will finalize their account.
                                    </div>
                                )}

                                <div className="bg-white p-3 rounded-4 shadow-sm border mb-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold text-primary mb-1">{selectedPatient.patient_name}</h5>
                                        <small className="text-muted">UHID: {selectedPatient.patient_id} | Admitting Dr: {billDetails.docName} ({billDetails.doctorDept})</small>
                                    </div>
                                    <div className="text-end">
                                        <span className="badge bg-secondary mb-1">Admitted: {new Date(selectedPatient.admission_date).toLocaleDateString('en-GB')}</span>
                                        <br />
                                        <small className="text-dark fw-bold">Room {selectedPatient.room_number} | {billDetails.daysStayed} Days</small>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    <div className="col-lg-8">
                                        <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100">
                                            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">System Aggregated Charges</h6>
                                            <table className="table table-sm table-borderless align-middle mb-4">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-muted fw-bold"><i className="fa-solid fa-bed text-primary me-2"></i> Room Rent ({billDetails.daysStayed} days @ ₹{billDetails.roomRate})</td>
                                                        <td className="text-end fw-bold text-dark">₹ {billDetails.roomTotal.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-muted fw-bold"><i className="fa-solid fa-user-doctor text-success me-2"></i> Doctor Rounds ({billDetails.totalRounds} visits @ ₹{billDetails.roundRate})</td>
                                                        <td className="text-end fw-bold text-dark">₹ {billDetails.roundsTotal.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-muted fw-bold"><i className="fa-solid fa-vial text-info me-2"></i> Laboratory & Diagnostics</td>
                                                        <td className="text-end fw-bold text-dark">₹ {billDetails.labTotal.toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-muted fw-bold"><i className="fa-solid fa-scissors text-danger me-2"></i> Surgery & OT Charges</td>
                                                        <td className="text-end fw-bold text-dark">₹ {billDetails.surgeryTotal.toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Add Extra Charges (Pharmacy, Ventilator, Consumables)</h6>
                                            <div className="row g-2 mb-3">
                                                <div className="col-md-5">
                                                    <input type="text" className="form-control rounded-3" placeholder="Item Name" value={newExtraCharge.name} onChange={(e) => setNewExtraCharge({...newExtraCharge, name: e.target.value})} />
                                                </div>
                                                <div className="col-md-3">
                                                    <input type="number" className="form-control rounded-3" placeholder="Rate (₹)" value={newExtraCharge.rate} onChange={(e) => setNewExtraCharge({...newExtraCharge, rate: e.target.value})} />
                                                </div>
                                                <div className="col-md-2">
                                                    <input type="number" className="form-control rounded-3" placeholder="Qty" value={newExtraCharge.qty} onChange={(e) => setNewExtraCharge({...newExtraCharge, qty: e.target.value})} />
                                                </div>
                                                <div className="col-md-2">
                                                    <button type="button" className="btn btn-primary w-100 fw-bold rounded-3" onClick={handleAddExtraCharge}>Add</button>
                                                </div>
                                            </div>

                                            {extraCharges.length > 0 && (
                                                <table className="table table-sm table-hover align-middle border">
                                                    <thead className="table-light text-muted small">
                                                        <tr><th>Description</th><th className="text-center">Qty x Rate</th><th className="text-end">Amount</th><th></th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {extraCharges.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td>{item.name}</td>
                                                                <td className="text-center">{item.qty} x ₹{item.rate}</td>
                                                                <td className="text-end fw-bold text-dark">₹ {item.amount.toFixed(2)}</td>
                                                                <td className="text-center"><button className="btn btn-sm text-danger" onClick={() => handleRemoveExtraCharge(idx)}><i className="fa-solid fa-trash"></i></button></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-lg-4">
                                        <div className="card-common bg-white rounded-4 shadow-sm border-0 p-4 h-100 d-flex flex-column">
                                            <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">Final Summary</h6>
                                            
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted fw-bold">Gross Total:</span>
                                                <span className="fw-bold text-dark fs-5">₹ {grossTotal.toFixed(2)}</span>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted fw-bold small mb-1">Less: Discount (₹)</label>
                                                <input type="number" className="form-control rounded-3 border-warning" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-muted fw-bold small mb-1">Less: Auto-Fetched Advance (₹)</label>
                                                <input type="number" className="form-control rounded-3 bg-light" disabled value={billDetails.advanceTotal} />
                                            </div>

                                            <div className="mb-3 border-top pt-3">
                                                <label className="text-dark fw-bold small mb-1">Final Payment Mode</label>
                                                <select className="form-select rounded-3 border-success" value={finalPaymentMode} onChange={e => setFinalPaymentMode(e.target.value)}>
                                                    <option>Cash</option>
                                                    <option>UPI</option>
                                                </select>
                                                {finalPaymentMode === 'UPI' && (
                                                    <input type="text" className="form-control rounded-3 mt-2 border-success" placeholder="Txn ID Required" required value={finalTxnId} onChange={e => setFinalTxnId(e.target.value)} />
                                                )}
                                            </div>

                                            <div className="mt-auto bg-success bg-opacity-10 p-3 rounded-4 border border-success">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold text-success">NET PAYABLE:</span>
                                                    <span className="fw-bold text-success fs-3">₹ {Math.max(0, netPayable).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer bg-white border-top p-3 rounded-bottom-4">
                                <button type="button" className="btn btn-secondary px-4 fw-bold rounded-pill" onClick={() => setShowBillModal(false)} disabled={isGenerating}>Cancel</button>
                                <button type="button" className="btn btn-success fw-bold px-4 rounded-pill shadow-sm" onClick={handleConfirmBill} disabled={isGenerating || (finalPaymentMode === 'UPI' && !finalTxnId)}>
                                    {isGenerating ? <><i className="fa-solid fa-spinner fa-spin me-2"></i> Processing...</> : <><i className="fa-solid fa-print me-2"></i> Finalize Bill & Print</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default IPDBilling;