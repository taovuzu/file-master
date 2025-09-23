import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.4.54/build/pdf.worker.min.mjs";

/** @type {import('pdfjs-dist').PDFDocumentProxy | null} */
let pdfDoc = null;
/** active render tasks keyed by jobId */
const activeTasks = new Map();

/**
 * Create an OffscreenCanvas and return PNG Blob URL
 */
async function renderPageToBlobUrl(page, scale) {
	const viewport = page.getViewport({ scale });
	const width = Math.ceil(viewport.width);
	const height = Math.ceil(viewport.height);
	const canvas = new OffscreenCanvas(width, height);
	const ctx = canvas.getContext("2d");
	const renderTask = page.render({ canvasContext: ctx, viewport });
	const promise = renderTask.promise.then(async () => {
		const blob = await canvas.convertToBlob({ type: "image/png" });
		return URL.createObjectURL(blob);
	});
	return { renderTask, promise };
}

self.onmessage = async (e) => {
	const { type, jobId } = e.data || {};
	try {
		if (type === "load") {
			// Initialize a document from ArrayBuffer
			if (pdfDoc) {
				try { pdfDoc.destroy(); } catch {}
				pdfDoc = null;
			}
			const { buffer } = e.data;
			const task = getDocument({ data: buffer });
			pdfDoc = await task.promise;
			self.postMessage({ type: "loaded", numPages: pdfDoc.numPages });
			return;
		}

		if (type === "render" && pdfDoc) {
			const { pageNumber, scale } = e.data;
			const page = await pdfDoc.getPage(pageNumber);
			const { renderTask, promise } = await renderPageToBlobUrl(page, scale);
			activeTasks.set(jobId, renderTask);
			const url = await promise;
			// cleanup
			activeTasks.delete(jobId);
			self.postMessage({ type: "rendered", jobId, pageNumber, scale, url });
			return;
		}

		if (type === "cancel") {
			const task = activeTasks.get(jobId);
			if (task) {
				try { task.cancel(); } catch {}
				activeTasks.delete(jobId);
			}
			return;
		}
	} catch (err) {
		self.postMessage({ type: "error", jobId, message: String(err?.message || err) });
	}
};


