import jsPDF from "jspdf";

const generateOPDSlip = (data) => {
  const pdf = new jsPDF("p", "mm", "a5");

  /* COLORS */
  const GREEN = [0, 128, 0];

  /* HEADER */
  pdf.setTextColor(...GREEN);
  pdf.setFontSize(16);
  pdf.text("AROGYAONE HOSPITAL", 40, 15);

  pdf.setFontSize(9);
  pdf.text("Complete Healthcare Solution", 50, 21);
  pdf.text("   Contact: +91 91733 16294 | Rajkot", 35, 26);

  pdf.setDrawColor(...GREEN);
  pdf.line(10, 30, 140, 30);

  /* OPD TITLE */
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text("OPD SLIP", 65, 38);

  /* PATIENT BOX */
  pdf.setDrawColor(0, 128, 0);
  pdf.rect(10, 42, 120, 30);

  pdf.setFontSize(10);
  pdf.text(`Patient ID : ${data.patientId}`, 12, 50);
  pdf.text(`Name       : ${data.patient_name}`, 12, 56);
  pdf.text(`Age/Gender : ${data.age}`, 12, 62);
  pdf.text(`Blood Group: ${data.blood_group}`, 12, 68);

  /* DOCTOR BOX */
  pdf.rect(10, 75, 120, 20);
  pdf.text(`Consultant Doctor : ${data.doctor_name}`, 12, 83);
  pdf.text(`Consultation Fee  : Rs. ${data.consultation_fee}`, 12, 89);

  /* FOOTER BOX */
  pdf.rect(10, 98, 120, 18);
  pdf.text(`Date : ${data.date}`, 12, 106);
  pdf.text("OPD Timing: Morning / Evening", 12, 112);

  /* SIGNATURES */
  pdf.line(15, 125, 60, 125);
  pdf.text("Registration Desk", 18, 130);

  pdf.line(80, 125, 125, 125);
  pdf.text("Billing Desk", 88, 130);

  /* SAVE */
  pdf.save(`OPD_Slip_${data.patientId}.pdf`);
};

export default generateOPDSlip;
