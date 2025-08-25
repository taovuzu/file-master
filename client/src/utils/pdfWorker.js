import { GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure pdf.js worker once for the entire app
if (!GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = workerSrc;
}

export { GlobalWorkerOptions };


