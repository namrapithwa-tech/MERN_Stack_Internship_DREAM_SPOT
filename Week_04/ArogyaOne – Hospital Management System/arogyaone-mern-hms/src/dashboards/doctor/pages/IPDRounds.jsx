import React, { useState, useEffect, useContext } from 'react';
import api from '../../../api/axios';
import { AuthContext } from '../../../context/AuthContext';
import '../../../assets/css/doctor.css';

const IPDRounds = () => {
    // --- CONTEXT & STATE ---
    const { user } = useContext(AuthContext);
    
    // Separate State for Active vs Discharged
    const [activeAdmissions, setActiveAdmissions] = useState([]);
    const [dischargedAdmissions, setDischargedAdmissions] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false); // NEW: For manual refresh

    // --- NEW: Master Lab Tests State ---
    const [masterLabTests, setMasterLabTests] = useState([]);
    const [labSearchTerm, setLabSearchTerm] = useState('');
    const [showLabDropdown, setShowLabDropdown] = useState(false);

    // Workspace State
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [roundHistory, setRoundHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('new_note'); // 'new_note' or 'history'
    const [isSaving, setIsSaving] = useState(false);

    // Form State (UPDATED: Added LabTest_advised)
    const initialFormState = {
        vitals: { bp: '', temp: '', pulse: '', spo2: '' },
        clinical_progress: '',
        nursing_instructions: '',
        LabTest_advised: [] 
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    useEffect(() => {
        let interval;
        if (user) {
            fetchMyAdmissions();
            fetchMasterLabTests(); // Fetch the lab master list on load

            // NEW: Live Queue Polling (Fetches silently every 15 seconds)
            interval = setInterval(() => {
                fetchMyAdmissions(true); // background fetch
            }, 15000); 
        }
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // NEW: Fetch Master Lab Tests
    const fetchMasterLabTests = async () => {
        try {
            const res = await api.get('/lab_test_master');
            setMasterLabTests(res.data);
        } catch (error) {
            console.error("Error fetching lab test master:", error);
        }
    };

    // UPDATED: Added isBackground parameter for silent polling
    const fetchMyAdmissions = async (isBackground = false) => {
        if (!isBackground) setIsRefreshing(true);
        try {
            // Fetch ALL admissions (Active and Discharged)
            const res = await api.get('/ipd_admissions');
            
            // Filter to show ONLY patients assigned to the logged-in doctor
            const myPatients = res.data.filter(adm => 
                adm.consultant_doctor_name === user?.name || adm.doctor_id === user?.linked_id
            );
            
            // Split into Active and Discharged
            const active = myPatients.filter(adm => adm.status === 'ADMITTED')
                                     .sort((a, b) => new Date(b.admission_date) - new Date(a.admission_date));
            
            const discharged = myPatients.filter(adm => adm.status === 'DISCHARGED')
                                         .sort((a, b) => new Date(b.discharge_details?.discharge_date || 0) - new Date(a.discharge_details?.discharge_date || 0));

            setActiveAdmissions(active);
            setDischargedAdmissions(discharged);
        } catch (error) {
            console.error("Error fetching IPD admissions:", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchRoundHistory = async (admissionId) => {
        try {
            const res = await api.get(`/ipd_rounds?ipd_admission_id=${admissionId}`);
            // Sort newest to oldest
            const sortedHistory = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setRoundHistory(sortedHistory);
        } catch (error) {
            console.error("Error fetching round history:", error);
        }
    };

    // --- HANDLERS ---
    const handleSelectPatient = (adm) => {
        setSelectedAdmission(adm);
        setFormData(initialFormState); // Reset form
        
        // If patient is discharged, force to history tab. Else default to new note.
        if (adm.status === 'DISCHARGED') {
            setActiveTab('history');
        } else {
            setActiveTab('new_note');
        }

        fetchRoundHistory(adm.id);
        
        // Scroll to top of window to easily see the workspace
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVitalChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            vitals: { ...prev.vitals, [field]: value }
        }));
    };

    // --- NEW: Lab Test Dropdown Handlers ---
    const handleAddLabTest = (test) => {
        const testIdentifier = test.test_name; // Hide ID, use name only
        
        if (!formData.LabTest_advised.includes(testIdentifier)) {
            setFormData({
                ...formData,
                LabTest_advised: [...formData.LabTest_advised, testIdentifier]
            });
        }
        setLabSearchTerm('');
        setShowLabDropdown(false);
    };

    const handleRemoveLabTest = (testToRemove) => {
        setFormData({
            ...formData,
            LabTest_advised: formData.LabTest_advised.filter(t => t !== testToRemove)
        });
    };

    const filteredLabTests = masterLabTests.filter(test =>
        test.test_name.toLowerCase().includes(labSearchTerm.toLowerCase())
    );

    const handleSubmitRound = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                id: `RND-${new Date().getFullYear()}-${Date.now()}`,
                ipd_admission_id: selectedAdmission.id,
                patient_id: selectedAdmission.patient_id,
                patient_name: selectedAdmission.patient_name,
                doctor_id: user.linked_id,
                doctor_name: user.name,
                round_date: new Date().toISOString().split('T')[0],
                round_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                vitals: formData.vitals,
                clinical_progress: formData.clinical_progress,
                nursing_instructions: formData.nursing_instructions,
                LabTest_advised: formData.LabTest_advised, // NEW: Added Lab Tests array
                lab_status: formData.LabTest_advised.length > 0 ? 'pending' : 'none', // NEW: Triggers Lab Queue
                created_at: new Date().toISOString()
            };

            await api.post('/ipd_rounds', payload);
            
            // On Success: Reset form, fetch fresh history, and switch tab to view it
            setFormData(initialFormState);
            await fetchRoundHistory(selectedAdmission.id);
            setActiveTab('history');
            
        } catch (error) {
            console.error("Error saving round note:", error);
            alert("Failed to save round note.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-success"></div></div>;

    const isSelectedDischarged = selectedAdmission?.status === 'DISCHARGED';

    return (
        <div className="container-fluid py-3">
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0 text-dark"><i className="fa-solid fa-bed-pulse me-2 text-danger"></i> IPD Rounds Workspace</h4>
                <div className="badge bg-light text-dark border p-2">
                    <i className="fa-solid fa-user-doctor text-success me-2"></i>{user?.name}
                </div>
            </div>

            {/* --- TOP SECTION: 30/70 SPLIT WORKSPACE --- */}
            <div className="row g-4 mb-5" style={{ minHeight: '600px' }}>
                
                {/* --- LEFT PANE: ACTIVE PATIENT LIST (30%) --- */}
                <div className="col-lg-4 col-xl-3">
                    <div className="card-common bg-white p-0 overflow-hidden shadow-sm border border-light h-100">
                        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold m-0 text-dark">My Admitted Queue</h6>
                            {/* NEW: Refresh Button next to badge */}
                            <div className="d-flex align-items-center gap-2">
                                <button 
                                    className="btn btn-sm btn-outline-success p-1 px-2 border-0" 
                                    onClick={() => fetchMyAdmissions(false)}
                                    disabled={isRefreshing}
                                    title="Refresh Queue"
                                >
                                    <i className={`fa-solid fa-arrows-rotate ${isRefreshing ? 'fa-spin' : ''}`}></i>
                                </button>
                                <span className="badge bg-danger rounded-pill">{activeAdmissions.length} Active</span>
                            </div>
                        </div>
                        <div className="list-group list-group-flush overflow-auto" style={{ height: 'calc(100% - 55px)' }}>
                            {activeAdmissions.length > 0 ? activeAdmissions.map(adm => (
                                <button 
                                    key={adm.id} 
                                    className={`list-group-item list-group-item-action p-3 border-bottom ${selectedAdmission?.id === adm.id ? 'bg-success bg-opacity-10 border-start border-4 border-success' : ''}`}
                                    onClick={() => handleSelectPatient(adm)}
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold text-primary">{adm.patient_name}</span>
                                        <span className="badge bg-secondary text-white"><i className="fa-solid fa-bed me-1"></i>{adm.room_number}</span>
                                    </div>
                                    <div className="small text-muted d-flex justify-content-between">
                                        <span>UHID: {adm.patient_id}</span>
                                        <span>Adm: {new Date(adm.admission_date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </button>
                            )) : (
                                <div className="text-center p-4 text-muted fst-italic">
                                    No patients currently admitted under your care.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANE: WORKSPACE (70%) --- */}
                <div className="col-lg-8 col-xl-9">
                    {selectedAdmission ? (
                        <div className="card-common bg-white p-0 shadow-sm border border-light h-100 d-flex flex-column">
                            
                            {/* Patient Header Banner */}
                            <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold text-dark m-0">
                                        {selectedAdmission.patient_name}
                                        {isSelectedDischarged && <span className="badge bg-secondary ms-3 fs-6 align-middle"><i className="fa-solid fa-file-medical me-1"></i>Archived File</span>}
                                    </h5>
                                    <div className="text-muted small mt-1">
                                        <span className="me-3"><strong>UHID:</strong> {selectedAdmission.patient_id}</span>
                                        <span className="me-3"><strong>IPD ID:</strong> {selectedAdmission.id}</span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <h4 className="fw-bold text-danger m-0">{selectedAdmission.room_number}</h4>
                                    <div className="small text-muted">Room / Bed</div>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="px-4 pt-3 border-bottom">
                                <ul className="nav nav-tabs border-0 gap-3">
                                    {/* Hide the 'Add Note' tab entirely if patient is discharged */}
                                    {!isSelectedDischarged && (
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link fw-bold border-0 border-bottom border-3 px-1 pb-2 ${activeTab === 'new_note' ? 'active border-success text-success bg-transparent' : 'border-transparent text-muted bg-transparent'}`}
                                                onClick={() => setActiveTab('new_note')}
                                            >
                                                <i className="fa-solid fa-plus-circle me-2"></i>Add Round Note
                                            </button>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link fw-bold border-0 border-bottom border-3 px-1 pb-2 ${activeTab === 'history' ? 'active border-success text-success bg-transparent' : 'border-transparent text-muted bg-transparent'}`}
                                            onClick={() => setActiveTab('history')}
                                        >
                                            <i className="fa-solid fa-clock-rotate-left me-2"></i>Round History 
                                            <span className="badge bg-secondary ms-2 rounded-pill">{roundHistory.length}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Tabs Content */}
                            <div className="p-4 overflow-auto flex-grow-1" style={{ maxHeight: '600px' }}>
                                
                                {/* TAB 1: ADD NEW NOTE (Only available for active admissions) */}
                                {activeTab === 'new_note' && !isSelectedDischarged && (
                                    <form onSubmit={handleSubmitRound}>
                                        
                                        <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-heart-pulse text-danger me-2"></i>Today's Vitals</h6>
                                        <div className="row g-3 mb-4 bg-light p-3 rounded border">
                                            <div className="col-md-3">
                                                <label className="doc-label">Blood Pressure</label>
                                                <div className="input-group input-group-sm">
                                                    <input type="text" className="form-control" placeholder="120/80" value={formData.vitals.bp} onChange={(e) => handleVitalChange('bp', e.target.value)} required />
                                                    <span className="input-group-text bg-white text-muted">mmHg</span>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="doc-label">Temperature</label>
                                                <div className="input-group input-group-sm">
                                                    <input type="number" step="0.1" className="form-control" placeholder="98.6" value={formData.vitals.temp} onChange={(e) => handleVitalChange('temp', e.target.value)} required />
                                                    <span className="input-group-text bg-white text-muted">°F</span>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="doc-label">Pulse Rate</label>
                                                <div className="input-group input-group-sm">
                                                    <input type="number" className="form-control" placeholder="72" value={formData.vitals.pulse} onChange={(e) => handleVitalChange('pulse', e.target.value)} required />
                                                    <span className="input-group-text bg-white text-muted">bpm</span>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <label className="doc-label">SpO2 (Oxygen)</label>
                                                <div className="input-group input-group-sm">
                                                    <input type="number" className="form-control" placeholder="99" value={formData.vitals.spo2} onChange={(e) => handleVitalChange('spo2', e.target.value)} required />
                                                    <span className="input-group-text bg-white text-muted">%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row g-4 mb-4">
                                            <div className="col-md-6">
                                                <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-user-doctor text-primary me-2"></i>Clinical Progress Notes</h6>
                                                <textarea 
                                                    className="doc-input border-primary" 
                                                    rows="5" 
                                                    placeholder="Describe the patient's current condition, symptom improvements, or new observations..."
                                                    value={formData.clinical_progress}
                                                    onChange={(e) => setFormData({...formData, clinical_progress: e.target.value})}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-user-nurse text-info me-2"></i>Nursing & Diet Instructions</h6>
                                                <textarea 
                                                    className="doc-input border-info" 
                                                    rows="5" 
                                                    placeholder="Instructions for the ward nurse (e.g., Medicine changes, IV fluid rate, shift to soft diet, monitor BP every 2 hours)..."
                                                    value={formData.nursing_instructions}
                                                    onChange={(e) => setFormData({...formData, nursing_instructions: e.target.value})}
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* --- NEW: SMART LAB TEST DROPDOWN ROW --- */}
                                        <div className="bg-light p-3 rounded border mb-4 position-relative">
                                            <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-flask text-warning me-2"></i>Advised Lab Tests (Optional)</h6>
                                            
                                            {/* Selected Tests Chips */}
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                {formData.LabTest_advised.map((test, i) => (
                                                    <span key={i} className="badge bg-primary d-flex align-items-center p-2 fs-6">
                                                        {test}
                                                        <i className="fa-solid fa-xmark ms-2" style={{ cursor: 'pointer' }} onClick={() => handleRemoveLabTest(test)}></i>
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Search Input */}
                                            <input 
                                                type="text" 
                                                className="doc-input border-secondary" 
                                                placeholder="Search & select tests to advise from Master List..." 
                                                value={labSearchTerm}
                                                onChange={(e) => {
                                                    setLabSearchTerm(e.target.value);
                                                    setShowLabDropdown(true);
                                                }}
                                                onFocus={() => setShowLabDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowLabDropdown(false), 200)} 
                                            />

                                            {/* Dropdown Results */}
                                            {showLabDropdown && labSearchTerm && (
                                                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', left: 0, top: '100%' }}>
                                                    {filteredLabTests.length > 0 ? filteredLabTests.map(test => (
                                                        <li 
                                                            key={test._id || test.id} 
                                                            className="list-group-item list-group-item-action"
                                                            style={{ cursor: 'pointer' }}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); 
                                                                handleAddLabTest(test);
                                                            }}
                                                        >
                                                            <strong>{test.test_name}</strong>
                                                        </li>
                                                    )) : (
                                                        <li className="list-group-item text-muted">No tests found in Master</li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="text-end pt-3 border-top">
                                            <button type="submit" className="btn btn-success fw-bold px-4 py-2" disabled={isSaving}>
                                                <i className="fa-solid fa-check-circle me-2"></i> {isSaving ? 'Saving Note...' : 'Save Round Note'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* TAB 2: ROUND HISTORY TIMELINE */}
                                {activeTab === 'history' && (
                                    <div>
                                        {/* Display Discharge Summary Header if looking at an archived patient */}
                                        {isSelectedDischarged && selectedAdmission.discharge_details && (
                                            <div className="bg-white border rounded p-3 mb-4 shadow-sm border-start border-4 border-secondary">
                                                <h6 className="fw-bold text-dark mb-2"><i className="fa-solid fa-file-medical text-muted me-2"></i>Final Discharge Summary</h6>
                                                <div className="small">
                                                    <strong>Discharge Date:</strong> {new Date(selectedAdmission.discharge_details.discharge_date).toLocaleDateString('en-GB')}<br/>
                                                    <strong>Diagnosis:</strong> <span className="text-danger fw-bold">{selectedAdmission.discharge_details.clinical_summary}</span><br/>
                                                    <strong>Condition:</strong> {selectedAdmission.discharge_details.discharge_condition}
                                                </div>
                                            </div>
                                        )}

                                        <h6 className="fw-bold text-dark mb-4 border-bottom pb-2">Historical Round Notes</h6>
                                        
                                        {roundHistory.length > 0 ? (
                                            <div className="timeline ps-3 ms-2 mt-2">
                                                {roundHistory.map((round) => (
                                                    <div className="timeline-item position-relative mb-5" key={round.id}>
                                                        {/* Timeline Dot */}
                                                        <div className="position-absolute bg-success rounded-circle" style={{ width: '14px', height: '14px', left: '-25px', top: '3px' }}></div>
                                                        
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <div className="fw-bold text-dark fs-5">
                                                                {new Date(round.round_date).toLocaleDateString('en-GB')} 
                                                                <span className="text-muted fw-normal ms-2 fs-6"><i className="fa-regular fa-clock me-1"></i>{round.round_time}</span>
                                                            </div>
                                                            <span className="badge bg-light text-muted border">ID: {round.id}</span>
                                                        </div>

                                                        {/* Vitals Ribbon */}
                                                        <div className="d-flex gap-3 mb-3">
                                                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger"><i className="fa-solid fa-heart-pulse me-1"></i>BP: {round.vitals.bp}</span>
                                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning"><i className="fa-solid fa-temperature-half me-1"></i>Temp: {round.vitals.temp}°F</span>
                                                            <span className="badge bg-info bg-opacity-10 text-info border border-info"><i className="fa-solid fa-wave-square me-1"></i>Pulse: {round.vitals.pulse}</span>
                                                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary"><i className="fa-solid fa-wind me-1"></i>SpO2: {round.vitals.spo2}%</span>
                                                        </div>

                                                        <div className="row g-3">
                                                            <div className="col-md-6">
                                                                <div className="bg-light p-3 rounded h-100 border">
                                                                    <strong className="text-primary small text-uppercase"><i className="fa-solid fa-user-doctor me-1"></i> Clinical Progress</strong>
                                                                    <p className="mb-0 mt-2 text-dark small" style={{ whiteSpace: 'pre-wrap' }}>{round.clinical_progress}</p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="bg-light p-3 rounded h-100 border">
                                                                    <strong className="text-info small text-uppercase"><i className="fa-solid fa-user-nurse me-1"></i> Nursing Orders</strong>
                                                                    <p className="mb-0 mt-2 text-dark small" style={{ whiteSpace: 'pre-wrap' }}>{round.nursing_instructions}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* NEW: Display Lab Tests if ordered in this round */}
                                                        {round.LabTest_advised && round.LabTest_advised.length > 0 && (
                                                            <div className="mt-3 bg-white border border-warning p-2 rounded shadow-sm">
                                                                <strong className="text-warning small text-uppercase"><i className="fa-solid fa-flask me-2"></i>Lab Tests Advised: </strong>
                                                                <span className="small text-dark fw-bold">{round.LabTest_advised.join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5">
                                                <i className="fa-solid fa-folder-open text-muted fs-1 mb-3 opacity-50"></i>
                                                <h6 className="text-muted">No round history found for this admission.</h6>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card-common bg-light d-flex flex-column align-items-center justify-content-center h-100 text-muted border-0 shadow-sm">
                            <i className="fa-solid fa-bed-pulse fs-1 mb-3 text-success opacity-50"></i>
                            <h5>Select a patient to begin</h5>
                            <p className="small">Choose a patient from the queues to view their workspace.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- BOTTOM SECTION: DISCHARGED PATIENTS ARCHIVE --- */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border border-light">
                <div className="bg-light p-3 border-bottom d-flex align-items-center">
                    <h5 className="fw-bold m-0 text-dark"><i className="fa-solid fa-folder-closed text-secondary me-2"></i>Recently Discharged Archive</h5>
                    <span className="badge bg-secondary ms-3">{dischargedAdmissions.length} Records</span>
                </div>
                
                <table className="table table-hover align-middle mb-0">
                    <thead className="bg-white text-muted small">
                        <tr>
                            <th className="ps-4">IPD ID / UHID</th>
                            <th>Patient Details</th>
                            <th>Room at Discharge</th>
                            <th>Dates</th>
                            <th>Condition</th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dischargedAdmissions.length > 0 ? dischargedAdmissions.map(adm => (
                            <tr key={adm.id} className={selectedAdmission?.id === adm.id ? 'bg-light' : ''}>
                                <td className="ps-4">
                                    <div className="fw-bold text-dark">{adm.id}</div>
                                    <div className="small text-muted">{adm.patient_id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-primary">{adm.patient_name}</div>
                                    <div className="small text-muted"><i className="fa-solid fa-phone me-1"></i>{adm.mobile_number}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark"><i className="fa-solid fa-bed me-1 text-muted"></i>{adm.room_number}</div>
                                </td>
                                <td>
                                    <div className="small"><strong>Adm:</strong> {new Date(adm.admission_date).toLocaleDateString('en-GB')}</div>
                                    <div className="small text-danger"><strong>Dis:</strong> {adm.discharge_details ? new Date(adm.discharge_details.discharge_date).toLocaleDateString('en-GB') : 'N/A'}</div>
                                </td>
                                <td>
                                    <span className="badge bg-secondary">{adm.discharge_details?.discharge_condition || 'N/A'}</span>
                                </td>
                                <td className="text-center">
                                    <button 
                                        className={`btn btn-sm fw-bold px-3 shadow-sm ${selectedAdmission?.id === adm.id ? 'btn-dark' : 'btn-outline-dark'}`} 
                                        onClick={() => handleSelectPatient(adm)}
                                        title="View Round History"
                                    >
                                        <i className="fa-solid fa-folder-open me-2"></i> {selectedAdmission?.id === adm.id ? 'Viewing' : 'View File'}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center p-4 text-muted fst-italic">No recently discharged patients found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default IPDRounds;