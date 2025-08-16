import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { message } from "antd";
import { PDFDocument, degrees } from "pdf-lib";
import { getDocument } from "pdfjs-dist";
import "/public/pdf.worker.min.mjs";

const usePdfPreview = (input) => {
  const [pdfDocLib, setPdfDocLib] = useState(null);
  const [pdfDocJs, setPdfDocJs] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(false);


  const [previews, setPreviews] = useState({});
  const itemsRef = useRef([]);

  const inputsArray = useMemo(() => Array.isArray(input) ? input : input ? [input] : [], [input]);
  useEffect(() => { 
    itemsRef.current = inputsArray; 
    return () => {
      // Cleanup: clear the ref when component unmounts
      itemsRef.current = [];
    };
  }, [inputsArray]);


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
      svg: "image/svg+xml"
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


  const toArrayBuffer = useCallback(async (src) => {
    try {

      const maybe = src && src.file ? src.file : src;

      if (!maybe) return null;
      if (maybe instanceof ArrayBuffer) return maybe;
      if (maybe instanceof Uint8Array) return maybe.buffer;
      if (typeof maybe === "string") {

        const res = await fetch(maybe);
        return await res.arrayBuffer();
      }
      if (maybe && typeof maybe.arrayBuffer === "function") {

        return await maybe.arrayBuffer();
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);


  useEffect(() => {
    let isCancelled = false;

    if (!input) {
      setPdfDocLib(null);
      setPdfDocJs(null);
      setTotalPages(0);
      setCurrentPage(1);
      setPageImages([]);
      setLoading(false);
      return;
    }

    const loadPdf = async () => {
      if (isCancelled) return;
      
      setLoading(true);
      try {
        const first = Array.isArray(input) ? input[0] : input;
        if (!first) {
          if (!isCancelled) setLoading(false);
          return;
        }

        if (!isPdfType(first)) {
          if (!isCancelled) {
            setPdfDocLib(null);
            setPdfDocJs(null);
            setTotalPages(0);
            setCurrentPage(1);
            setLoading(false);
          }
          return;
        }
        const arrayBuffer = await toArrayBuffer(first);
        if (!arrayBuffer || isCancelled) {
          if (!isCancelled) setLoading(false);
          return;
        }

        const pdfLibDoc = await PDFDocument.load(arrayBuffer);
        if (isCancelled) return;
        setPdfDocLib(pdfLibDoc);

        const pdfJsDoc = await getDocument({ data: arrayBuffer }).promise;
        if (isCancelled) return;
        setPdfDocJs(pdfJsDoc);

        if (!isCancelled) {
          setTotalPages(pdfJsDoc.numPages);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!isCancelled) {
          const first = Array.isArray(input) ? input[0] : input;
          if (first && isPdfType(first)) message.error("Failed to load PDF file.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [input, toArrayBuffer, isPdfType]);


  const renderPage = useCallback(async (pageNum, rotationDeg = 0) => {
    if (!pdfDocJs) return null;

    try {
      const page = await pdfDocJs.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      let width = viewport.width;
      let height = viewport.height;
      const rads = (rotationDeg % 360 + 360) % 360;

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
            tctx.translate(0, tmp.height); tctx.rotate(3 * Math.PI / 2); break;
          default:
            break;
        }
        tctx.drawImage(canvas, 0, 0);
        tctx.restore();
        return tmp.toDataURL();
      }

      return canvas.toDataURL();
    } catch (err) {
      return null;
    }
  }, [pdfDocJs]);


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
      message.error("Failed to load PDF pages.");
    } finally {
      setLoading(false);
    }
  }, [pdfDocJs]); // Removed renderPage from dependencies to avoid circular dependency


  const goToPage = useCallback((pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  }, [totalPages]);


  const savePdf = useCallback(async () => {
    if (!pdfDocLib) return null;
    try {
      const pdfBytes = await pdfDocLib.save();
      return new Blob([pdfBytes], { type: "application/pdf" });
    } catch (err) {
      return null;
    }
  }, [pdfDocLib]);


  useEffect(() => {
    const maybeWrapperArray = Array.isArray(input) ? input : input ? [input] : [];
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
        let deg = (rotationDeg % 360 + 360) % 360;
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
            ctx.rotate(3 * Math.PI / 2);
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
        let deg = (rotationDeg % 360 + 360) % 360;
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
            ctx.rotate(3 * Math.PI / 2);
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

    const type = fileOrBlob?.type || "";
    const looksPdf = type === "application/pdf";
    if (!looksPdf || !rotationDeg || rotationDeg % 360 === 0) return fileOrBlob;
    const ab = await (fileOrBlob.arrayBuffer ? fileOrBlob.arrayBuffer() : fileOrBlob);
    const pdfDoc = await PDFDocument.load(ab);
    const pages = pdfDoc.getPages();
    const rot = (rotationDeg % 360 + 360) % 360;
    pages.forEach((p) => p.setRotation(degrees(rot)));
    const bytes = await pdfDoc.save();
    return new Blob([bytes], { type: 'application/pdf' });
  };


  return {

    previews,
    generatePreview,
    rotatePdfBlob,


    pdfDocLib,
    pdfDocJs,
    totalPages,
    currentPage,
    pageImages,
    loading,
    goToPage,
    loadAllPages,
    renderPage,
    savePdf
  };
};

export default usePdfPreview;