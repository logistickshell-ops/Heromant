import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function downloadAnalysisPdf(element: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    backgroundColor: "#f7f5f0",
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const usableHeight = pageHeight - margin * 2;
  let offset = 0;
  let page = 0;

  while (offset < imageHeight) {
    if (page > 0) pdf.addPage();
    const sourceY = Math.round((offset / imageHeight) * canvas.height);
    const sourceHeight = Math.min(canvas.height - sourceY, Math.round((usableHeight / imageHeight) * canvas.height));
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sourceHeight;
    const context = slice.getContext("2d");
    if (!context) throw new Error("Не удалось подготовить PDF");
    context.fillStyle = "#f7f5f0";
    context.fillRect(0, 0, slice.width, slice.height);
    context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, slice.width, slice.height);
    const sliceHeight = (sourceHeight * imageWidth) / canvas.width;
    pdf.addImage(slice.toDataURL("image/jpeg", 0.94), "JPEG", margin, margin, imageWidth, sliceHeight);
    offset += usableHeight;
    page += 1;
  }

  pdf.save(filename);
}
