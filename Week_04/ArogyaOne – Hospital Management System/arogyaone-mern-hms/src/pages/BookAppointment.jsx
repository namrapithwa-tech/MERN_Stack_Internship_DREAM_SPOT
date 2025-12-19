import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

const BookAppointment = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        phone: "",
        age: "",
        gender: "",
        date: "",
        time: ""
    });

    const handleSubmit = async () => {
        const appointmentId = "A" + Date.now();

        await api.post("/appointments", {
            id: appointmentId,
            doctorId,
            patientId: null,
            status: "PENDING",
            name: form.name,
            phone: form.phone,
            age: form.age,
            gender: form.gender,
            date: form.date,
            time: form.time
        });

        navigate(`/appointment-slip/${appointmentId}`);
    };

    return (
        <div className="container mt-4">
            <h3>Book Appointment</h3>

            <input className="form-control mb-2" placeholder="Name"
                onChange={e => setForm({ ...form, name: e.target.value })} />

            <input className="form-control mb-2" placeholder="Phone"
                onChange={e => setForm({ ...form, phone: e.target.value })} />

            <input className="form-control mb-2" placeholder="Age"
                onChange={e => setForm({ ...form, age: e.target.value })} />

            <input className="form-control mb-2" placeholder="Gender"
                onChange={e => setForm({ ...form, gender: e.target.value })} />

            <input type="date" className="form-control mb-2"
                onChange={e => setForm({ ...form, date: e.target.value })} />

            <input type="time" className="form-control mb-3"
                onChange={e => setForm({ ...form, time: e.target.value })} />

            <button className="btn btn-primary" onClick={handleSubmit}>
                Confirm Appointment
            </button>
        </div>
    );
};

export default BookAppointment;
