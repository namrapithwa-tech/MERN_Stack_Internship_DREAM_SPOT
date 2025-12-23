import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null); // To store doctor timings

    const [form, setForm] = useState({
        name: "",
        phone: "",
        age: "",
        gender: "",
        date: "",
        time: ""
    });

    // 1. Fetch doctor details to get timings
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                // Note: If doctorId contains slashes, remember to encode it or 
                // handle it as discussed in our first conversation.
                const response = await api.get(`/doctors/${encodeURIComponent(doctorId)}`);
                setDoctor(response.data);
            } catch (error) {
                console.error("Error fetching doctor:", error);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleSubmit = async () => {
        const appointmentId = `A-${new Date().getFullYear()}-${Date.now()}`;

        await api.post("/appointments", {
            id: appointmentId,
            doctorId,
            patientId: null,
            status: "PENDING",
            ...form // Shorthand to include all form fields
        });

        navigate(`/appointment-slip/${appointmentId}`);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm p-4">
                <h3 className="mb-4 text-primary">Book Appointment</h3>

                <input className="form-control mb-2" placeholder="Name"
                    onChange={e => setForm({ ...form, name: e.target.value })} />

                <input className="form-control mb-2" placeholder="Phone"
                    onChange={e => setForm({ ...form, phone: e.target.value })} />

                <div className="row mb-2">
                    <div className="col">
                        <input className="form-control" placeholder="Age"
                            onChange={e => setForm({ ...form, age: e.target.value })} />
                    </div>
                    <div className="col">
                        <select className="form-select" 
                            onChange={e => setForm({ ...form, gender: e.target.value })}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <input type="date" className="form-control mb-3"
                    onChange={e => setForm({ ...form, date: e.target.value })} />

                {/* --- RADIO BUTTONS FOR OPD TIMINGS --- */}
                <div className="mb-4">
                    <label className="form-label d-block fw-bold">Select Available Slot:</label>
                    
                    {doctor ? (
                        <div className="d-flex flex-column gap-2">
                            {/* Morning Slot */}
                            <div className="form-check p-3 border rounded">
                                <input 
                                    className="form-check-input ms-0 me-2" 
                                    type="radio" 
                                    name="timing" 
                                    id="morning"
                                    value={doctor.opd_timings.morning}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                />
                                <label className="form-check-label w-100" htmlFor="morning">
                                    ☀️ Morning: {doctor.opd_timings.morning}
                                </label>
                            </div>

                            {/* Evening Slot */}
                            <div className="form-check p-3 border rounded">
                                <input 
                                    className="form-check-input ms-0 me-2" 
                                    type="radio" 
                                    name="timing" 
                                    id="evening"
                                    value={doctor.opd_timings.evening}
                                    onChange={e => setForm({ ...form, time: e.target.value })}
                                />
                                <label className="form-check-label w-100" htmlFor="evening">
                                    🌙 Evening: {doctor.opd_timings.evening}
                                </label>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted">Loading available slots...</p>
                    )}
                </div>

                <button 
                    className="btn btn-primary w-100 py-2" 
                    onClick={handleSubmit}
                    disabled={!form.time || !form.date} // Disable if time or date not picked
                >
                    Confirm Appointment
                </button>
            </div>
        </div>
    );
};

export default BookAppointment;