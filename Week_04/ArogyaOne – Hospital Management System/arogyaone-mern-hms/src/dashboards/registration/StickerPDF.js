import jsPDF from "jspdf";

const colors = {
  GENERAL: "#d0ebff",
  ICU: "#ffd6d6",
  SEMI_GENERAL: "#d3f9d8",
  SEMI_DELUXE: "#ffe8cc",
  DELUXE: "#e5dbff"
};

const generateStickerPDF = (patient) => {
  const pdf = new jsPDF("p", "mm", "a4");

  let x = 10;
  let y = 10;
  let count = 0;

  for (let i = 0; i < 24; i++) {
    pdf.setFillColor(colors[patient.room_category] || "#ffffff");
    pdf.rect(x, y, 60, 30, "F");

    pdf.setFontSize(8);
    pdf.text(`ID: ${patient.id}`, x + 2, y + 6);
    pdf.text(patient.full_name, x + 2, y + 11);
    pdf.text(`Room: ${patient.room_number}`, x + 2, y + 16);
    pdf.text(`Doctor: ${patient.consultant_doctor_id}`, x + 2, y + 21);

    x += 65;
    count++;

    if (count % 3 === 0) {
      x = 10;
      y += 35;
    }
  }

  pdf.save(`Room_Stickers_${patient.id}.pdf`);
};

export default generateStickerPDF;
