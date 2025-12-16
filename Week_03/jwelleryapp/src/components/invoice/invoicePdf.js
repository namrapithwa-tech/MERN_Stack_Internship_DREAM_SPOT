import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateInvoicePDF = async (element, orderId) => {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
  pdf.save(`Invoice_${orderId}.pdf`);
};
