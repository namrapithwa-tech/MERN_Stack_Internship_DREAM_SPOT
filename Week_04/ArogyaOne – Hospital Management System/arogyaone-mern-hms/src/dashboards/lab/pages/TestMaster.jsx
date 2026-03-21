import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import '../../../assets/css/doctor.css'; 

const TestMaster = () => {
    // --- STATE ---
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const initialFormState = {
        id: '',
        test_name: '',
        department: 'Pathology',
        price: '',
        parameters: [{ name: '', unit: '', normal_range: '' }]
    };
    const [formData, setFormData] = useState(initialFormState);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/lab_test_master');
            setTests(res.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching test master data:", error);
            setTests([]); 
            setLoading(false);
        }
    };

    // --- CALCULATE STATS ---
    const stats = {
        total: tests.length,
        pathology: tests.filter(t => t.department === 'Pathology').length,
        biochemistry: tests.filter(t => t.department === 'Biochemistry').length,
        microbiology: tests.filter(t => t.department === 'Microbiology').length,
        immunology: tests.filter(t => t.department === 'Immunology').length
    };

    // --- FILTER LOGIC ---
    const filteredTests = tests.filter(test => {
        const matchesSearch = test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              test.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'All' || test.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    // --- FORM HANDLERS ---
    const openAddModal = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (test) => {
        setFormData({ ...test });
        setIsEditing(true);
        setShowModal(true);
    };

    // Dynamic Parameter Handlers
    const handleParamChange = (index, field, value) => {
        const updatedParams = [...formData.parameters];
        updatedParams[index][field] = value;
        setFormData({ ...formData, parameters: updatedParams });
    };

    const addParameterRow = () => {
        setFormData({
            ...formData,
            parameters: [...formData.parameters, { name: '', unit: '', normal_range: '' }]
        });
    };

    const removeParameterRow = (index) => {
        const updatedParams = formData.parameters.filter((_, i) => i !== index);
        setFormData({ ...formData, parameters: updatedParams });
    };

    const handleSaveTest = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = {
                ...formData,
                id: isEditing ? formData.id : `TEST-${new Date().getFullYear()}-${Date.now()}`,
                price: Number(formData.price) 
            };

            if (isEditing) {
                await api.put(`/lab_test_master/${payload.id}`, payload);
                setTests(tests.map(t => t.id === payload.id ? payload : t));
            } else {
                await api.post('/lab_test_master', payload);
                setTests([...tests, payload]);
            }

            setShowModal(false);
        } catch (error) {
            console.error("Error saving test:", error);
            alert("Failed to save the test configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- HELPER ---
    const getDeptBadgeColor = (dept) => {
        switch (dept) {
            case 'Pathology': return 'danger';
            case 'Biochemistry': return 'warning text-dark';
            case 'Microbiology': return 'info text-dark';
            case 'Immunology': return 'primary';
            default: return 'secondary';
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container-fluid py-4 h-100 position-relative">
            
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                    <h3 className="fw-bolder text-dark mb-1"><i className="fa-solid fa-tags text-primary me-2"></i>Test Master & Pricing</h3>
                    <p className="text-muted m-0 fs-6">Configure lab tests, pricing, and normal reference ranges.</p>
                </div>
            </div>

            {/* TOP STAT CARDS */}
            <div className="row g-4 mb-4">
                <div className="col-md-4 col-xl">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-primary border-4 shadow-sm h-100">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-vials text-primary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0 small">Total Configured</h6><h4 className="fw-bold mb-0">{stats.total}</h4></div>
                    </div>
                </div>
                <div className="col-md-4 col-xl">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-danger border-4 shadow-sm h-100">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-droplet text-danger fs-4"></i></div>
                        <div><h6 className="text-muted mb-0 small">Pathology</h6><h4 className="fw-bold mb-0">{stats.pathology}</h4></div>
                    </div>
                </div>
                <div className="col-md-4 col-xl">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-warning border-4 shadow-sm h-100">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-flask text-warning fs-4"></i></div>
                        <div><h6 className="text-muted mb-0 small">Biochemistry</h6><h4 className="fw-bold mb-0">{stats.biochemistry}</h4></div>
                    </div>
                </div>
                <div className="col-md-6 col-xl">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-info border-4 shadow-sm h-100">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-bacteria text-info fs-4"></i></div>
                        <div><h6 className="text-muted mb-0 small">Microbiology</h6><h4 className="fw-bold mb-0">{stats.microbiology}</h4></div>
                    </div>
                </div>
                <div className="col-md-6 col-xl">
                    <div className="card-common d-flex align-items-center bg-white p-3 border-start border-success border-4 shadow-sm h-100">
                        <div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3"><i className="fa-solid fa-dna text-secondary fs-4"></i></div>
                        <div><h6 className="text-muted mb-0 small">Immunology</h6><h4 className="fw-bold mb-0">{stats.immunology}</h4></div>
                    </div>
                </div>
            </div>

            {/* SEARCH, FILTER & ADD BAR */}
            <div className="card-common bg-white p-3 shadow-sm border border-light mb-4 rounded-4">
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 bg-light" 
                                placeholder="Search by Test Name or ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select bg-light" 
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            <option value="Pathology">Pathology</option>
                            <option value="Biochemistry">Biochemistry</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Immunology">Immunology</option>
                        </select>
                    </div>
                    <div className="col-md-3 text-md-end">
                        <button className="btn btn-primary fw-bold w-100 shadow-sm" onClick={openAddModal}>
                            <i className="fa-solid fa-plus me-2"></i>Add New Test
                        </button>
                    </div>
                </div>
            </div>

            {/* MASTER TABLE */}
            <div className="card-common bg-white p-0 overflow-hidden shadow-sm border border-light rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3">Test ID</th>
                                <th>Test Name</th>
                                <th>Department</th>
                                <th>Parameters</th>
                                <th>Price (₹)</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.length > 0 ? filteredTests.map(test => (
                                <tr key={test.id}>
                                    <td className="ps-4 fw-bold text-dark">{test.id}</td>
                                    <td className="fw-bold text-primary">{test.test_name}</td>
                                    <td>
                                        <span className={`badge bg-${getDeptBadgeColor(test.department)} bg-opacity-10 text-${getDeptBadgeColor(test.department).split(' ')[0]} border border-${getDeptBadgeColor(test.department).split(' ')[0]}`}>
                                            {test.department}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge bg-secondary rounded-pill">{test.parameters?.length || 0} Params</span>
                                    </td>
                                    <td className="fw-bold text-success">₹{test.price}</td>
                                    <td className="text-center pe-4">
                                        <button className="btn btn-sm btn-outline-primary shadow-sm" onClick={() => openEditModal(test)}>
                                            <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                                        <i className="fa-solid fa-folder-open fs-1 mb-3 opacity-25"></i>
                                        <br />No tests found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD/EDIT MODAL --- */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header bg-primary text-white border-0 p-4">
                                <h5 className="modal-title fw-bold">
                                    <i className={`fa-solid ${isEditing ? 'fa-pen-to-square' : 'fa-plus'} me-2`}></i>
                                    {isEditing ? 'Edit Test Configuration' : 'Add New Lab Test'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            
                            <form onSubmit={handleSaveTest}>
                                <div className="modal-body p-4 bg-light">
                                    
                                    {/* Basic Info Section */}
                                    <h6 className="fw-bold text-muted mb-3 text-uppercase small">Basic Information</h6>
                                    <div className="row g-3 mb-4 bg-white p-3 rounded-3 border shadow-sm">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small">Test Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. Liver Function Test"
                                                value={formData.test_name}
                                                onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small">Department</label>
                                            <select 
                                                className="form-select"
                                                value={formData.department}
                                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                                required
                                            >
                                                <option value="Pathology">Pathology</option>
                                                <option value="Biochemistry">Biochemistry</option>
                                                <option value="Microbiology">Microbiology</option>
                                                <option value="Immunology">Immunology</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold small">Price (₹)</label>
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Parameters Section */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold text-muted m-0 text-uppercase small">Test Parameters (Results to Measure)</h6>
                                        <span className="badge bg-secondary">{formData.parameters.length} Parameters</span>
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded-3 border shadow-sm">
                                        {/* Parameter Headers */}
                                        <div className="row g-2 mb-2 d-none d-md-flex text-muted small fw-bold">
                                            <div className="col-md-4">Parameter Name</div>
                                            <div className="col-md-3">Unit</div>
                                            <div className="col-md-4">Normal Reference Range</div>
                                            <div className="col-md-1 text-center">Action</div>
                                        </div>

                                        {formData.parameters.map((param, index) => (
                                            <div className="row g-2 mb-3 align-items-center" key={index}>
                                                <div className="col-md-4">
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        placeholder="e.g. Hemoglobin"
                                                        value={param.name}
                                                        onChange={(e) => handleParamChange(index, 'name', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        placeholder="e.g. g/dL"
                                                        value={param.unit}
                                                        onChange={(e) => handleParamChange(index, 'unit', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <input 
                                                        type="text" 
                                                        className="form-control form-control-sm" 
                                                        placeholder="e.g. 13.0 - 17.0"
                                                        value={param.normal_range}
                                                        onChange={(e) => handleParamChange(index, 'normal_range', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-1 text-center">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-sm btn-outline-danger border-0" 
                                                        onClick={() => removeParameterRow(index)}
                                                        disabled={formData.parameters.length === 1}
                                                        title="Remove Parameter"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button 
                                            type="button" 
                                            className="btn btn-sm btn-outline-primary mt-2 fw-bold w-100 border-dashed"
                                            style={{ borderStyle: 'dashed' }}
                                            onClick={addParameterRow}
                                        >
                                            <i className="fa-solid fa-plus me-2"></i>Add Another Parameter
                                        </button>
                                    </div>

                                </div>
                                <div className="modal-footer bg-white p-4 border-top">
                                    <button type="button" className="btn btn-light fw-bold px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold px-4 shadow-sm" disabled={isSaving}>
                                        {isSaving ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                        ) : (
                                            <><i className="fa-solid fa-check me-2"></i>Save Configuration</>
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

export default TestMaster;