import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { message } from "antd";
import { PDFDocument, degrees } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Proper worker configuration for Vite/ESM builds
GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * usePdfPreview - Custom hook to preview and manipulate PDF files
 *
 * @param {File|Blob|string|ArrayBuffer|Uint8Array|Array} input - PDF input to preview
 */
const usePdfPreview = (input) => {
  const [pdfDocLib, setPdfDocLib] = useState(null); // PDF-lib document (single-file mode)
  const [pdfDocJs, setPdfDocJs] = useState(null);   // pdfjs-dist document (single-file mode)
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImages, setPageImages] = useState([]); // single-file rendered pages
  const [loading, setLoading] = useState(false);

  // Multi-file: previews map for compact thumbnails in FileUploadZone/PdfPreview
  const [previews, setPreviews] = useState({}); // { [id: string]: dataUrl }
  const itemsRef = useRef([]);

  const inputsArray = useMemo(() => (Array.isArray(input) ? input : input ? [input] : []), [input]);
  useEffect(() => { itemsRef.current = inputsArray; }, [inputsArray]);

  // Helpers: type detection
  const getMimeType = useCallback((src) => {
    const maybe = src && src.file ? src.file : src;
    const type = maybe?.type || maybe?.file?.type || "";
    if (type) return type;
    const name = maybe?.name || maybe?.file?.name || "";
    const ext = (name.split(".").pop() || "").toLowerCase();
    const map = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      bmp: "image/bmp",
      svg: "image/svg+xml",
    };
    return map[ext] || "";
  }, []);

  const isPdfType = useCallback((src) => {
    const t = getMimeType(src);
    return t === "application/pdf";
  }, [getMimeType]);

  const isImageType = useCallback((src) => {
    const t = getMimeType(src);
    return typeof t === "string" && t.startsWith("image/");
  }, [getMimeType]);

  // Helper: normalize to ArrayBuffer
  const toArrayBuffer = useCallback(async (src) => {
    try {
      // Unwrap wrapper object from FileUploadZone { id, file, ... }
      const maybe = src && src.file ? src.file : src;

      if (!maybe) return null;
      if (maybe instanceof ArrayBuffer) return maybe;
      if (maybe instanceof Uint8Array) return maybe.buffer;
      if (typeof maybe === "string") {
        // URL
        const res = await fetch(maybe);
        return await res.arrayBuffer();
      }
      if (maybe && typeof maybe.arrayBuffer === "function") {
        // File / Blob
        return await maybe.arrayBuffer();
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);

  // Load PDF document when file changes (only for PDFs)
  useEffect(() => {
    if (!input) {
      // Reset state when no input is provided
      setPdfDocLib(null);
      setPdfDocJs(null);
      setTotalPages(0);
      setCurrentPage(1);
      setPageImages([]);
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      setLoading(true);
      try {
        const first = Array.isArray(input) ? input[0] : input;
        if (!first) {
          setLoading(false);
          return; // Silently return instead of throwing error
        }

        // If not a PDF, skip creating pdf-lib/pdfjs documents
        if (!isPdfType(first)) {
          setPdfDocLib(null);
          setPdfDocJs(null);
          setTotalPages(0);
          setCurrentPage(1);
          setLoading(false);
          return;
        }

        // Read file
        const arrayBuffer = await toArrayBuffer(first);
        if (!arrayBuffer) {
          setLoading(false);
          return; // Silently return instead of throwing error
        }

        // Load PDF using pdf-lib for manipulation
        const pdfLibDoc = await PDFDocument.load(arrayBuffer);
        setPdfDocLib(pdfLibDoc);

        // Load PDF using pdfjs-dist for rendering pages
        const pdfJsDoc = await getDocument({ data: arrayBuffer }).promise;
        setPdfDocJs(pdfJsDoc);

        setTotalPages(pdfJsDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("PDF loading error:", err);
        // Avoid noisy errors for non-PDFs or images; only show for actual PDF failures
        const first = Array.isArray(input) ? input[0] : input;
        if (first && isPdfType(first)) message.error("Failed to load PDF file.");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [input, toArrayBuffer, isPdfType]);

  // Render one page → return as base64 image
  const renderPage = useCallback(async (pageNum, rotationDeg = 0) => {
    if (!pdfDocJs) return null;

    try {
      const page = await pdfDocJs.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      let width = viewport.width;
      let height = viewport.height;
      const rads = ((rotationDeg % 360) + 360) % 360;
      // Always render upright then rotate image data to simplify pdfjs viewport
      canvas.width = width;
      canvas.height = height;
      await page.render({ canvasContext: context, viewport }).promise;
      if (rads !== 0) {
        const tmp = document.createElement('canvas');
        if (rads === 90 || rads === 270) {
          tmp.width = height; tmp.height = width;
        } else {
          tmp.width = width; tmp.height = height;
        }
        const tctx = tmp.getContext('2d');
        tctx.save();
        switch (rads) {
          case 90:
            tctx.translate(tmp.width, 0); tctx.rotate(Math.PI / 2); break;
          case 180:
            tctx.translate(tmp.width, tmp.height); tctx.rotate(Math.PI); break;
          case 270:
            tctx.translate(0, tmp.height); tctx.rotate((3 * Math.PI) / 2); break;
          default:
            break;
        }
        tctx.drawImage(canvas, 0, 0);
        tctx.restore();
        return tmp.toDataURL();
      }

      return canvas.toDataURL();
    } catch (err) {
      console.error("Error rendering page:", err);
      return null;
    }
  }, [pdfDocJs]);

  // Render all pages → return array of base64 images
  const loadAllPages = useCallback(async () => {
    if (!pdfDocJs) return;

    setLoading(true);
    try {
      const images = [];
      for (let i = 1; i <= pdfDocJs.numPages; i++) {
        const dataUrl = await renderPage(i);
        if (dataUrl) images.push(dataUrl);
      }
      setPageImages(images);
    } catch (err) {
      console.error("Error loading all pages:", err);
      message.error("Failed to load PDF pages.");
    } finally {
      setLoading(false);
    }
  }, [pdfDocJs, renderPage]);

  // Go to a specific page
  const goToPage = useCallback((pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  }, [totalPages]);

  // Save edited PDF → returns Blob
  const savePdf = useCallback(async () => {
    if (!pdfDocLib) return null;
    try {
      const pdfBytes = await pdfDocLib.save();
      return new Blob([pdfBytes], { type: "application/pdf" });
    } catch (err) {
      console.error("Error saving PDF:", err);
      return null;
    }
  }, [pdfDocLib]);

  // Generate compact preview thumbnails for each input item (first page or image)
  useEffect(() => {
    const maybeWrapperArray = Array.isArray(input) ? input : (input ? [input] : []);
    if (!maybeWrapperArray.length) {
      setPreviews({});
      return;
    }

    let isCancelled = false;
    (async () => {
      const newPreviews = {};
      for (const item of maybeWrapperArray) {
        const id = item?.id || item?.name || Math.random().toString(36).slice(2);
        try {
          if (isPdfType(item)) {
            const ab = await toArrayBuffer(item);
            if (!ab) continue;
            const doc = await getDocument({ data: ab }).promise;
            const page = await doc.getPage(1);
            const viewport = page.getViewport({ scale: 0.8 });
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            newPreviews[id] = canvas.toDataURL();
          } else if (isImageType(item)) {
            const srcObj = item?.file || item;
            const imgUrl = typeof srcObj === "string" ? srcObj : URL.createObjectURL(srcObj);
            const img = await new Promise((resolve, reject) => {
              const i = new Image();
              i.onload = () => resolve(i);
              i.onerror = reject;
              i.src = imgUrl;
            });
            const maxW = 600;
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = Math.max(1, Math.floor(img.width * scale));
            canvas.height = Math.max(1, Math.floor(img.height * scale));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            newPreviews[id] = canvas.toDataURL();
            if (typeof srcObj !== "string") URL.revokeObjectURL(imgUrl);
          } else {
            newPreviews[id] = { fallback: true };
          }
        } catch (e) {
          newPreviews[id] = { fallback: true };
        }
      }
      if (!isCancelled) setPreviews(newPreviews);
    })();

    return () => { isCancelled = true; };
  }, [input, toArrayBuffer, isPdfType, isImageType]);

  // Regenerate a specific preview (with rotation)
  const generatePreview = useCallback(async (fileId, rotationDeg = 0) => {
    try {
      const item = itemsRef.current.find((x) => (x?.id || x?.name) === fileId);
      if (!item) return;
      if (isPdfType(item)) {
        const ab = await toArrayBuffer(item);
        if (!ab) return;
        const doc = await getDocument({ data: ab }).promise;
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = viewport.width;
        let height = viewport.height;
        let deg = ((rotationDeg % 360) + 360) % 360;
        if (deg === 90 || deg === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.save();
        switch (deg) {
          case 90:
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            break;
          case 180:
            ctx.translate(canvas.width, canvas.height);
            ctx.rotate(Math.PI);
            break;
          case 270:
            ctx.translate(0, canvas.height);
            ctx.rotate((3 * Math.PI) / 2);
            break;
          default:
            break;
        }

        await page.render({ canvasContext: ctx, viewport }).promise;
        ctx.restore();
        setPreviews((prev) => ({ ...prev, [fileId]: canvas.toDataURL() }));
      } else if (isImageType(item)) {
        const srcObj = item?.file || item;
        const imgUrl = typeof srcObj === "string" ? srcObj : URL.createObjectURL(srcObj);
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = imgUrl;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let deg = ((rotationDeg % 360) + 360) % 360;
        const maxW = 600;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.max(1, Math.floor(img.width * scale));
        const h = Math.max(1, Math.floor(img.height * scale));

        if (deg === 90 || deg === 270) {
          canvas.width = h;
          canvas.height = w;
        } else {
          canvas.width = w;
          canvas.height = h;
        }

        ctx.save();
        switch (deg) {
          case 90:
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            break;
          case 180:
            ctx.translate(canvas.width, canvas.height);
            ctx.rotate(Math.PI);
            break;
          case 270:
            ctx.translate(0, canvas.height);
            ctx.rotate((3 * Math.PI) / 2);
            break;
          default:
            break;
        }
        ctx.drawImage(img, 0, 0, w, h);
        ctx.restore();
        setPreviews((prev) => ({ ...prev, [fileId]: canvas.toDataURL() }));
        if (typeof srcObj !== "string") URL.revokeObjectURL(imgUrl);
      } else {
        setPreviews((prev) => ({ ...prev, [fileId]: { fallback: true } }));
      }
    } catch (e) {
      setPreviews((prev) => ({ ...prev, [fileId]: { fallback: true } }));
    }
  }, [toArrayBuffer, isPdfType, isImageType]);

  const rotatePdfBlob = async (fileOrBlob, rotationDeg = 0) => {
    // Only rotate real PDFs here; pass through images/others
    const type = fileOrBlob?.type || "";
    const looksPdf = type === "application/pdf";
    if (!looksPdf || !rotationDeg || rotationDeg % 360 === 0) return fileOrBlob;
    const ab = await (fileOrBlob.arrayBuffer ? fileOrBlob.arrayBuffer() : fileOrBlob);
    const pdfDoc = await PDFDocument.load(ab);
    const pages = pdfDoc.getPages();
    const rot = ((rotationDeg % 360) + 360) % 360;
    pages.forEach((p) => p.setRotation(degrees(rot)));
    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  };


  return {
    // Multi-file thumbnails
    previews,
    generatePreview,
    rotatePdfBlob,

    // Single-file operations
    pdfDocLib,
    pdfDocJs,
    totalPages,
    currentPage,
    pageImages,
    loading,
    goToPage,
    loadAllPages,
    renderPage,
    savePdf,
  };
};

export default usePdfPreview;
