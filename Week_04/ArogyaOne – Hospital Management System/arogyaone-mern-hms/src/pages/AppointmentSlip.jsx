import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AppointmentSlip = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const slipRef = useRef();

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const apptRes = await api.get(`/appointments/${appointmentId}`);
      setAppointment(apptRes.data);

      const docRes = await api.get(`/doctors/${apptRes.data.doctorId}`);
      setDoctor(docRes.data);
    };

    fetchData();
  }, [appointmentId]);

  const downloadPDF = async () => {
    const element = slipRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Appointment_${appointment.id}.pdf`);

    setDownloaded(true);
  };

  if (!appointment || !doctor) return null;

  return (
    <div className="container mt-4">

      {/* SUCCESS MESSAGE */}
      <div className="alert alert-success">
        <h5>Appointment Booked Successfully</h5>
        <p>
          Appointment No: <b>{appointment.id}</b>
        </p>
      </div>

      {/* PDF CONTENT */}
      <div ref={slipRef} className="border p-4 bg-white">

        <h4 className="mb-3">ArogyaOne Hospital</h4>
        <hr />

        <div class="card border-success mb-3">
          <div class="card-body text-success">
            <h5 class="card-title">Appointment Confirmed</h5>
            <p class="card-text">
              <strong>Appointment number : </strong>
              <span class="fw-bold">{appointment.id}</span>
            </p>
          </div>
        </div>

        <h6>Patient Information</h6>
        <p>Name: {appointment.name}</p>
        <p>Mobile: {appointment.phone}</p>
        <p>Gender: {appointment.gender}</p>
        <p>Age: {appointment.age}</p>

        <hr />

        <h6>Doctor Information</h6>
        <p>{doctor.full_name}</p>
        <p>{doctor.department}</p>

        <hr />

        <h6>Appointment Details</h6>
        <p>Date: {appointment.date}</p>
        <p>Time: {appointment.time}</p>
        {/* <p>Status: {appointment.status}</p> */}

        <hr />

        <h6>Important Instructions</h6>
        <ul>
          <li>Please arrive 15 minutes early</li>
          <li>Carry this appointment slip</li>
          <li>Bring previous medical records if available</li>
        </ul>

        <p className="mt-3">
          <small>
            This is a system-generated appointment slip and does not require a
            signature.
          </small>
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-3 d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={downloadPDF}
          disabled={downloaded}
        >
          {downloaded ? "PDF Downloaded" : "Download PDF"}
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default AppointmentSlip;
