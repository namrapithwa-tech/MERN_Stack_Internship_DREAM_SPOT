import React, { useState, useEffect } from 'react';

const PendingRequests = () => {
  // --- State Management ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [labMasterTests, setLabMasterTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All');
  
  // Modal State
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [testMappings, setTestMappings] = useState({});

  // --- Real API Data Fetching ---
  const fetchPendingQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch OPD, IPD, and Master Tests concurrently
      const [opdRes, ipdRes, masterRes] = await Promise.all([
        fetch('http://localhost:5000/opd_consultation'),
        fetch('http://localhost:5000/ipd_consultation'),
        fetch('http://localhost:5000/lab_test_master')
      ]);

      if (!opdRes.ok || !ipdRes.ok || !masterRes.ok) {
        throw new Error("Failed to fetch data from one or more APIs");
      }

      const opdData = await opdRes.json();
      const ipdData = await ipdRes.json();
      const masterData = await masterRes.json();

      setLabMasterTests(masterData);

      // Filter for pending lab status and format OPD data
      const pendingOPD = opdData
        .filter(item => item.lab_status === 'pending')
        .map(item => ({
          id: item._id, // Adjust if your schema uses a different ID field
          date: new Date(item.createdAt).toLocaleString(),
          patient_name: item.patient_name || item.patientName, 
          source: 'OPD',
          doctor: item.doctor_name || item.doctorName,
          prescribed_tests: item.prescribed_tests || []
        }));

      // Filter for pending lab status and format IPD data
      const pendingIPD = ipdData
        .filter(item => item.lab_status === 'pending')
        .map(item => ({
          id: item._id,
          date: new Date(item.createdAt).toLocaleString(),
          patient_name: item.patient_name || item.patientName,
          source: 'IPD',
          doctor: item.doctor_name || item.doctorName,
          prescribed_tests: item.prescribed_tests || []
        }));

      // Combine queues
      const combinedQueue = [...pendingOPD, ...pendingIPD].sort(
        (a, b) => new Date(b.date) - new Date(a.date) // Sort newest first
      );

      setPendingRequests(combinedQueue);
    } catch (err) {
      console.error("Error fetching lab queue:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  // --- Derived State (Stats & Filtering) ---
  const totalPending = pendingRequests.length;
  const pendingOPD = pendingRequests.filter(req => req.source === 'OPD').length;
  const pendingIPD = pendingRequests.filter(req => req.source === 'IPD').length;

  const filteredRequests = pendingRequests.filter(req => {
    // Safely handle missing data
    const patientName = req.patient_name ? req.patient_name.toLowerCase() : '';
    const reqId = req.id ? req.id.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = patientName.includes(search) || reqId.includes(search);
    const matchesSource = sourceFilter === 'All' || req.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  // --- Handlers ---
  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    const initialMappings = {};
    // Ensure prescribed_tests exists and is an array before iterating
    if (Array.isArray(request.prescribed_tests)) {
      request.prescribed_tests.forEach(test => { initialMappings[test] = ''; });
    }
    setTestMappings(initialMappings);
    setShowProcessModal(true);
  };

  const handleMappingChange = (prescribedTest, masterTestId) => {
    setTestMappings(prev => ({ ...prev, [prescribedTest]: masterTestId }));
  };

  const handleAcceptRequest = async () => {
    const unmapped = Object.values(testMappings).some(val => val === '');
    if (unmapped) {
      alert("Please map all prescribed tests before accepting.");
      return;
    }

    try {
      const payload = {
        original_request_id: selectedRequest.id,
        patient_name: selectedRequest.patient_name,
        source: selectedRequest.source,
        mapped_tests: testMappings 
      };

      // Real POST request to your backend
      const response = await fetch('http://localhost:5000/lab_active_orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to create active order: ${response.statusText}`);
      }

      // If successful, remove from local UI state
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setShowProcessModal(false);
      setSelectedRequest(null);
      
      // Optional: Add a success toast notification here

    } catch (err) {
      console.error("Error processing request:", err);
      alert("Failed to process request. Check console for details.");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Pending Lab Requests</h2>
        <button className="btn btn-outline-primary" onClick={fetchPendingQueue} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i>{loading ? 'Refreshing...' : 'Refresh Queue'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* --- Stats Row --- */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card card-common shadow-sm border-0 text-center py-3">
            <h5 className="text-muted mb-1">Total Pending</h5>
            <h2 className="mb-0 fw-bold">{loading ? '-' : totalPending}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-common shadow-sm border-0 text-center py-3 border-bottom border-primary border-3">
            <h5 className="text-muted mb-1">OPD Requests</h5>
            <h2 className="mb-0 fw-bold text-primary">{loading ? '-' : pendingOPD}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-common shadow-sm border-0 text-center py-3 border-bottom border-purple border-3" style={{ borderBottomColor: '#6f42c1'}}>
            <h5 className="text-muted mb-1">IPD Requests</h5>
            <h2 className="mb-0 fw-bold" style={{ color: '#6f42c1' }}>{loading ? '-' : pendingIPD}</h2>
          </div>
        </div>
      </div>

      {/* --- Filter Bar --- */}
      <div className="card card-common shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-6">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Patient Name or Request ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select 
              className="form-select" 
              value={sourceFilter} 
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="All">All Sources</option>
              <option value="OPD">OPD Only</option>
              <option value="IPD">IPD Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Master Table --- */}
      <div className="card card-common shadow-sm border-0">
        <div className="card-body p-0 table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-3">Date & Time</th>
                <th>Request ID</th>
                <th>Patient Name</th>
                <th>Source</th>
                <th>Referring Doctor</th>
                <th>Prescribed Tests</th>
                <th className="text-end px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading queue from API...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No pending requests found.</td></tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 text-muted">{req.date}</td>
                    <td><strong>{req.id.slice(-6).toUpperCase()}</strong></td> {/* Display short ID */}
                    <td>{req.patient_name}</td>
                    <td>
                      <span className={`badge ${req.source === 'OPD' ? 'bg-primary' : 'bg-purple'}`} style={req.source === 'IPD' ? { backgroundColor: '#6f42c1' } : {}}>
                        {req.source}
                      </span>
                    </td>
                    <td>{req.doctor}</td>
                    <td>
                      {Array.isArray(req.prescribed_tests) 
                        ? req.prescribed_tests.join(', ') 
                        : "No tests listed"}
                    </td>
                    <td className="text-end px-3">
                      <button 
                        className="btn btn-sm btn-success fw-bold"
                        onClick={() => handleOpenModal(req)}
                      >
                        Process
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Process Request Modal (Test Mapping) --- */}
      {showProcessModal && selectedRequest && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light border-bottom-0">
                  <h5 className="modal-title fw-bold">
                    Process Request: {selectedRequest.patient_name}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowProcessModal(false)}></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between mb-4 pb-3 border-bottom">
                    <div>
                      <small className="text-muted d-block">Source</small>
                      <strong>{selectedRequest.source} - {selectedRequest.doctor}</strong>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block">Request ID</small>
                      <strong>{selectedRequest.id}</strong>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">Map Prescribed Tests to Lab Master</h6>
                  
                  {Array.isArray(selectedRequest.prescribed_tests) && selectedRequest.prescribed_tests.map((testStr, idx) => (
                    <div className="row align-items-center mb-3 bg-light p-2 rounded" key={idx}>
                      <div className="col-md-5">
                        <span className="fw-semibold">"{testStr}"</span>
                        <small className="d-block text-muted">As written by doctor</small>
                      </div>
                      <div className="col-md-2 text-center text-muted">
                        <i className="bi bi-arrow-right fs-4"></i>
                      </div>
                      <div className="col-md-5">
                        <select 
                          className="form-select border-primary"
                          value={testMappings[testStr] || ''}
                          onChange={(e) => handleMappingChange(testStr, e.target.value)}
                        >
                          <option value="">-- Select Master Test --</option>
                          {labMasterTests.map(master => (
                            <option key={master._id || master.id} value={master._id || master.id}>
                              {master.test_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="modal-footer border-top-0 bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowProcessModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-primary fw-bold" onClick={handleAcceptRequest}>
                    Accept & Generate Barcode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PendingRequests;