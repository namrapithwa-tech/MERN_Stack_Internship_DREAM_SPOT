import jsPDF from "jspdf";

const generateDischargeSummary = ({ patient, admission, doctor }) => {
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.setFontSize(14);
  pdf.text("ArogyaOne Hospital", 60, 15);
  pdf.setFontSize(10);
  pdf.text("Discharge Summary", 75, 22);

  pdf.line(10, 25, 200, 25);

  pdf.setFontSize(10);
  pdf.text(`Patient ID: ${patient.id}`, 10, 35);
  pdf.text(`Name: ${patient.full_name}`, 10, 42);
  pdf.text(`Age / Gender: ${patient.age} / ${patient.gender}`, 10, 49);
  pdf.text(`Blood Group: ${patient.blood_group}`, 10, 56);

  pdf.text(`Consultant Doctor: ${doctor?.full_name || patient.consultant_doctor_id}`, 10, 65);

  pdf.text(`Room Number: ${patient.room_number || "OPD"}`, 10, 72);
  pdf.text(`Admission Date: ${new Date(admission.admission_date).toLocaleDateString()}`, 10, 79);
  pdf.text(`Discharge Date: ${new Date(admission.discharge_date).toLocaleDateString()}`, 10, 86);
  pdf.text(`Total Days: ${admission.total_days}`, 10, 93);

  pdf.line(10, 98, 200, 98);

  pdf.text("Diagnosis & Treatment:", 10, 108);
  pdf.rect(10, 112, 190, 30);

  pdf.text("Doctor Signature", 20, 155);
  pdf.text("Billing Dept.", 90, 155);
  pdf.text("Hospital Stamp", 150, 155);

  pdf.save(`Discharge_Summary_${patient.id}.pdf`);
};

export default generateDischargeSummary;
