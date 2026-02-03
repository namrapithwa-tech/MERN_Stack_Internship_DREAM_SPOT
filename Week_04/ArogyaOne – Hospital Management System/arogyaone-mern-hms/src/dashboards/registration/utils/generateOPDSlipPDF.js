import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const generateOPDSlipPDF = async () => {
  const element = document.getElementById("opd-slip");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  pdf.save("OPD_Slip.pdf");

  setTimeout(() => window.close(), 800);
};

export default generateOPDSlipPDF;
