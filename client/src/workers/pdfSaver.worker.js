/*
  Web Worker to merge Fabric overlays into the original PDF using pdf-lib.
  Accepts PNG blobs (faster than data URLs) and returns a final PDF Blob.
*/

import { PDFDocument } from "pdf-lib";

self.onmessage = async (e) => {
	const { type } = e.data || {};
	if (type !== "save") return;
	try {
		const { originalPdfBuffer, pages } = e.data; // pages: [{ pageNumber, blob }, ...]
		const pdfDoc = await PDFDocument.load(originalPdfBuffer);
		for (const { pageNumber, blob } of pages) {
			if (!blob) continue;
			const ab = await blob.arrayBuffer();
			const img = await pdfDoc.embedPng(ab);
			const page = pdfDoc.getPage(pageNumber - 1);
			const { width, height } = page.getSize();
			page.drawImage(img, { x: 0, y: 0, width, height, opacity: 1 });
		}
		const bytes = await pdfDoc.save();
		const outBlob = new Blob([bytes], { type: "application/pdf" });
		self.postMessage({ type: "saved", blob: outBlob });
	} catch (err) {
		self.postMessage({ type: "error", message: String(err?.message || err) });
	}
};


