import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import RegistrationLayout from "./RegistrationLayout";
import generateDischargeSummary from "./DischargeSummaryPDF";
import BillingHandoff from "./BillingHandoff";


const PatientView = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [vitals, setVitals] = useState([]);
    const [admission, setAdmission] = useState(null);

    useEffect(() => {
        api.get(`/patients/${id}`).then(res => setPatient(res.data));
        api.get(`/vitals?patientId=${id}`).then(res => setVitals(res.data));
        api.get(`/admissions?patient_id=${id}`).then(res => {
            if (res.data.length) setAdmission(res.data[0]);
        });
    }, [id]);

    if (!patient) return null;

    return (
        <RegistrationLayout>
            <h4>Patient Profile</h4>

            <div className="card p-3 mb-3">
                <p><b>Patient ID:</b> {patient.id}</p>
                <p><b>Name:</b> {patient.full_name}</p>
                <p><b>Age:</b> {patient.age}</p>
                <p><b>Gender:</b> {patient.gender}</p>
                <p><b>Blood Group:</b> {patient.blood_group}</p>
                <p><b>Mobile:</b> {patient.mobile_number}</p>
                <p><b>Doctor:</b> {patient.consultant_doctor_id}</p>
                <p><b>Status:</b> {patient.room_number ? "IPD" : "OPD"}</p>
            </div>

            <h5>Vitals</h5>
            <table className="table table-bordered mb-3">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>Height</th>
                        <th>BP</th>
                    </tr>
                </thead>
                <tbody>
                    {vitals.map(v => (
                        <tr key={v.id}>
                            <td>{new Date(v.recorded_at).toLocaleDateString()}</td>
                            <td>{v.weight}</td>
                            <td>{v.height}</td>
                            <td>{v.blood_pressure}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {admission && (
                <>
                    <h5>Admission Details</h5>
                    <div className="card p-3 mb-3">
                        <p><b>Room:</b> {patient.room_number}</p>
                        <p><b>Admitted On:</b> {new Date(admission.admission_date).toLocaleDateString()}</p>
                        <p><b>Expected Discharge:</b> {admission.expected_discharge_date}</p>
                        <p><b>Status:</b> {admission.status}</p>
                    </div>
                </>
            )}

            {admission && admission.status === "DISCHARGED" && (
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() =>
                        generateDischargeSummary({
                            patient,
                            admission,
                            doctor: null // doctor details can be fetched later
                        })
                    }
                >
                    Download Discharge Summary
                </button>
            )}

            <BillingHandoff patientId={patient.id} />


            <Link to={`/registration/patient/edit/${patient.id}`} className="btn btn-warning me-2">
                Edit
            </Link>

            {admission && admission.status === "ADMITTED" && (
                <Link to={`/registration/patient/discharge/${patient.id}`} className="btn btn-danger">
                    Discharge
                </Link>
            )}
        </RegistrationLayout>
    );
};

export default PatientView;
