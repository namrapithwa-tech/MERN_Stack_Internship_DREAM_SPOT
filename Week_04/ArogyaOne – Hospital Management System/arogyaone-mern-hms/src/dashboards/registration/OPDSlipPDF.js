import jsPDF from "jspdf";

const generateOPDSlip = (data) => {
  const pdf = new jsPDF("p", "mm", "a5");

  pdf.setFontSize(12);
  pdf.text("ArogyaOne Hospital", 10, 10);
  pdf.text("OPD SLIP", 70, 10);

  pdf.line(10, 12, 140, 12);

  pdf.text(`Patient ID: ${data.patientId}`, 10, 20);
  pdf.text(`Name: ${data.full_name}`, 10, 26);
  pdf.text(`Blood Group: ${data.blood_group}`, 10, 32);
  pdf.text(`Doctor: ${data.doctorId}`, 10, 38);
  pdf.text(`Date: ${data.date}`, 10, 44);

  pdf.line(10, 60, 70, 60);
  pdf.text("Authorized By", 10, 66);

  pdf.line(80, 60, 140, 60);
  pdf.text("Payment Received", 80, 66);

  pdf.save(`OPD_${data.patientId}.pdf`);
};

export default generateOPDSlip;
