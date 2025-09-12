import { GlobalWorkerOptions } from "pdfjs-dist";

// Configure pdf.js worker once for the entire app
// For pdfjs-dist v5+, we can use the local worker file
if (!GlobalWorkerOptions.workerSrc) {
  // Use the local worker file from the public directory
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export { GlobalWorkerOptions };


