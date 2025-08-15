// src/hooks/usePdfPreview.js
import { useState, useEffect } from "react";
import { message } from "antd";
import { getDocument } from "pdfjs-dist/legacy/build/pdf";

/**
 * usePdfPreview - Custom hook to preview PDF files
 *
 * @param {File|Array} file - PDF file(s) to preview
 */
const usePdfPreview = (file) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to read file as ArrayBuffer
  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      setLoading(true);
      try {
        // Handle both single file and array of files
        const fileToProcess = Array.isArray(file) ? file[0] : file;
        
        if (!fileToProcess) {
          throw new Error("No file provided");
        }

        // Read file as ArrayBuffer
        const arrayBuffer = await readFileAsArrayBuffer(fileToProcess);
        
        // Load PDF document
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        message.error("Failed to load PDF file.");
        console.error("PDF loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [file]);

  const renderPage = async (pageNum) => {
    if (!pdfDoc) return null;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (err) {
      console.error("Error rendering page:", err);
      return null;
    }
  };

  const loadAllPages = async () => {
    if (!pdfDoc) return;
    
    setLoading(true);
    try {
      const images = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const dataUrl = await renderPage(i);
        if (dataUrl) {
          images.push(dataUrl);
        }
      }
      setPageImages(images);
    } catch (err) {
      console.error("Error loading all pages:", err);
      message.error("Failed to load PDF pages.");
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  return {
    pdfDoc,
    totalPages,
    currentPage,
    pageImages,
    loading,
    goToPage,
    loadAllPages,
    renderPage,
  };
};

export default usePdfPreview;
