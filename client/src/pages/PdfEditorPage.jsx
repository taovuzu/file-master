import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ColorPicker, InputNumber, message, Typography } from "antd";
import { EditOutlined, DeleteOutlined, FileTextOutlined, UndoOutlined, RedoOutlined, ZoomInOutlined, ZoomOutOutlined, SaveOutlined } from "@ant-design/icons";
import { Document, Page, pdfjs } from "react-pdf";
import * as fabric from 'fabric';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploadZone from "@/components/FileUploadZone";
// Align worker with API version to avoid UnknownErrorException
pdfjs.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs";
const { Title } = Typography;

const toHex = (c) => {
  if (!c) return "#000000";
  if (typeof c === "string") return c;
  if (typeof c === "object" && typeof c.toHexString === "function") return c.toHexString();
  const { r, g, b } = c || {};
  if ([r, g, b].every((v) => typeof v === "number")) {
    const h = (v) => v.toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  return "#000000";
};

const PdfEditorPage = () => {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [tool, setTool] = useState("select"); // select | text | pen | erase
  const [color, setColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState({});
  const [pageBitmaps, setPageBitmaps] = useState({}); // key `${p}@${Math.round(scale*100)}` -> dataURL
  const pdfDocRef = useRef(null);

  const containerRef = useRef(null);
  const pageHoldersRef = useRef({}); // page -> HTMLElement holder
  const fabricRefs = useRef({}); // page -> fabric.Canvas
  const histBack = useRef({}); // page -> JSON[]
  const histFwd = useRef({}); // page -> JSON[]
  const ioRef = useRef(null);

  const onFilesSelected = (files) => {
    if (!files?.length) return;
    const f = files[0];
    if (f.type !== "application/pdf") {
      message.error("Please select a PDF file");
      return;
    }
    setFile(f);
    setCurrentPage(1);
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // Load pdf.js document once per file to render bitmaps efficiently
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!file) { pdfDocRef.current = null; return; }
      try {
        const buf = await file.arrayBuffer();
        const task = pdfjs.getDocument({ data: buf });
        const pdf = await task.promise;
        if (!cancelled) pdfDocRef.current = pdf;
      } catch (_) {
        pdfDocRef.current = null;
      }
    };
    load();
    return () => { cancelled = true; };
  }, [file]);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!file || !numPages) return;
      try {
        const pdf = pdfDocRef.current || (await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise);
        for (let p = 1; p <= numPages; p++) {
          if (cancelled) return;
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: 0.18 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          if (!cancelled) setThumbnails(prev => ({ ...prev, [p]: dataUrl }));
        }
      } catch (_) {
        // ignore thumbnail failures
      }
    };
    setThumbnails({});
    generate();
    return () => { cancelled = true; };
  }, [file, numPages]);

  const ensureFabric = useCallback((pageNumber) => {
    const holder = pageHoldersRef.current[pageNumber];
    if (!holder || fabricRefs.current[pageNumber]) return;

    const canvasEl = document.createElement("canvas");
    canvasEl.className = "absolute inset-0 w-full h-full";
    holder.appendChild(canvasEl);

    const fc = new fabric.Canvas(canvasEl, {
      selection: true,
      preserveObjectStacking: true
    });

    const fit = () => {
      const rect = holder.getBoundingClientRect();
      fc.setWidth(rect.width);
      fc.setHeight(rect.height);
      fc.calcOffset();
      fc.requestRenderAll();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(holder);
    fc._ro = ro;

    const syncTool = () => {
      fc.isDrawingMode = tool === "pen";
      if (fc.freeDrawingBrush) {
        fc.freeDrawingBrush.color = toHex(color);
        fc.freeDrawingBrush.width = Math.max(1, fontSize / 6);
      }
    };
    syncTool();

    fc.on("mouse:down", (opt) => {
      if (tool === "text") {
        const p = fc.getPointer(opt.e);
        const tb = new fabric.Textbox("Text", {
          left: p.x,
          top: p.y,
          fill: toHex(color),
          fontSize,
          editable: true
        });
        fc.add(tb).setActiveObject(tb);
        saveHistory(pageNumber);
      } else if (tool === "erase") {
        const obj = fc.getActiveObject();
        if (obj) {
          fc.remove(obj);
          fc.discardActiveObject();
          fc.requestRenderAll();
          saveHistory(pageNumber);
        }
      }
    });

    const onChange = () => saveHistory(pageNumber);
    fc.on("object:added", onChange);
    fc.on("object:modified", onChange);
    fc.on("object:removed", onChange);

    fabricRefs.current[pageNumber] = fc;
  }, [tool, color, fontSize]);

  // Fabric is initialized when a Page finishes rendering via onRenderSuccess

  useEffect(() => {
    Object.values(fabricRefs.current).forEach((fc) => {
      fc.isDrawingMode = tool === "pen";
      if (fc.freeDrawingBrush) {
        fc.freeDrawingBrush.color = toHex(color);
        fc.freeDrawingBrush.width = Math.max(1, fontSize / 6);
      }
    });
  }, [tool, color, fontSize]);

  const saveHistory = (page) => {
    const fc = fabricRefs.current[page];
    if (!fc) return;
    const json = fc.toJSON();
    histBack.current[page] = [...(histBack.current[page] || []), json].slice(-50);
    histFwd.current[page] = [];
  };

  const undo = () => {
    const p = currentPage;
    const back = histBack.current[p] || [];
    if (back.length < 2) return;
    const fc = fabricRefs.current[p];
    const last = back.pop();
    const prev = back[back.length - 1];
    histBack.current[p] = back;
    histFwd.current[p] = [...(histFwd.current[p] || []), last].slice(-50);
    fc.loadFromJSON(prev, () => fc.requestRenderAll());
  };

  const redo = () => {
    const p = currentPage;
    const fwd = histFwd.current[p] || [];
    if (!fwd.length) return;
    const fc = fabricRefs.current[p];
    const next = fwd.pop();
    histBack.current[p] = [...(histBack.current[p] || []), next].slice(-50);
    histFwd.current[p] = fwd;
    fc.loadFromJSON(next, () => fc.requestRenderAll());
  };

  const eraseSelected = () => {
    const fc = fabricRefs.current[currentPage];
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) {
      fc.remove(obj);
      fc.discardActiveObject();
      fc.requestRenderAll();
      saveHistory(currentPage);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(2, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.25, +(s - 0.1).toFixed(2)));

  const onPageHolderRef = (p) => (el) => {
    if (el) {
      pageHoldersRef.current[p] = el;
      el.setAttribute("data-page", String(p));
    }
  };

  const savePdf = async () => {
    if (!file) return message.error("Upload a PDF first");
    try {
      setLoading(true);
      const { PDFDocument } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      for (let p = 1; p <= numPages; p++) {
        const fc = fabricRefs.current[p];
        if (!fc) continue;
        const dataUrl = fc.toDataURL({ format: "png", multiplier: 2, enableRetinaScaling: false });
        const imgBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
        const img = await pdfDoc.embedPng(imgBytes);
        const page = pdfDoc.getPage(p - 1);
        const { width, height } = page.getSize();
        page.drawImage(img, { x: 0, y: 0, width, height, opacity: 1 });
      }
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `edited_${file.name || "document"}`;
      a.click();
      message.success("PDF saved with edits");
    } catch (e) {
      console.error(e);
      message.error("Failed to save PDF");
    } finally {
      setLoading(false);
    }
  };

  const Sidebar = useMemo(() => (
    <div className="w-28 bg-white border-r border-gray-200 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
      <div className="p-2 space-y-3">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
          <button key={p} className={`w-full text-left cursor-pointer border rounded ${currentPage === p ? "border-blue-500 bg-blue-50" : "border-gray-200"}`} onClick={() => setCurrentPage(p)}>
            <div className="bg-white flex items-center justify-center overflow-hidden" style={{ width: 72, height: 96, margin: "0 auto" }}>
              {thumbnails[p] ? (
                <img src={thumbnails[p]} alt={`Page ${p}`} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">{`Page ${p}`}</div>
              )}
            </div>
            <div className="text-center text-[10px] py-1 text-gray-600">{p}</div>
          </button>
        ))}
      </div>
    </div>
  ), [numPages, currentPage, file, thumbnails]);

  const Toolbar = (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border rounded-lg shadow px-3 py-2 flex items-center gap-2">
      <Button type={tool === "select" ? "primary" : "default"} size="small" onClick={() => setTool("select")} icon={<EditOutlined />}>Select</Button>
      <Button type={tool === "text" ? "primary" : "default"} size="small" onClick={() => setTool("text")} icon={<FileTextOutlined />}>Text</Button>
      <Button type={tool === "pen" ? "primary" : "default"} size="small" onClick={() => setTool("pen")} icon={<EditOutlined />}>Pen</Button>
      <Button type={tool === "erase" ? "primary" : "default"} size="small" onClick={eraseSelected} icon={<DeleteOutlined />}>Erase</Button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <ColorPicker value={color} onChange={setColor} />
      <InputNumber min={10} max={72} value={fontSize} onChange={setFontSize} size="small" style={{ width: 70 }} />
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
      <span>{Math.round(scale * 100)}%</span>
      <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <Button size="small" icon={<UndoOutlined />} onClick={undo} />
      <Button size="small" icon={<RedoOutlined />} onClick={redo} />
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <Button type="primary" size="small" icon={<SaveOutlined />} loading={loading} onClick={savePdf}>Save PDF</Button>
    </div>
  );

  return (
    <div>
      <Header />
      {!file ? (
        <main style={{ padding: "8px" }}>
          <div className="text-center">
            <Title level={2} style={{ marginBottom: 8 }}>PDF Editor</Title>
          </div>
          <div className="flex items-start justify-center w-full">
            <FileUploadZone onFilesSelected={onFilesSelected} fileList={file} maxFiles={1} maxSize={50 * 1024 * 1024} multiple={false} acceptedTypes={["application/pdf"]} />
          </div>
          <Footer />
        </main>
      ) : (
        <div className="flex" style={{ maxHeight: "calc(100vh - 64px)", overflow: "hidden" }}>
          {Sidebar}
          <main className="flex-1 bg-gray-100" style={{ maxHeight: "calc(100vh - 64px)" }}>
            <div ref={containerRef} className="h-full overflow-auto px-6 py-4">
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="p-6">Loading PDF...</div>}>
                {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
                  const start = Math.max(1, currentPage - 2);
                  const end = Math.min(numPages, currentPage + 2);
                  const isVisible = p >= start && p <= end;
                  const pageWidth = 595 * scale;
                  const pageHeight = 842 * scale;
                  const cacheKey = `${p}@${Math.round(scale * 100)}`;
                  const dataUrl = pageBitmaps[cacheKey];

                  // Kick off bitmap render for visible pages if not cached
                  if (isVisible && !dataUrl && pdfDocRef.current) {
                    (async () => {
                      try {
                        const page = await pdfDocRef.current.getPage(p);
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = Math.ceil(viewport.width);
                        canvas.height = Math.ceil(viewport.height);
                        await page.render({ canvasContext: ctx, viewport }).promise;
                        const url = canvas.toDataURL('image/png');
                        setPageBitmaps(prev => (prev[cacheKey] ? prev : { ...prev, [cacheKey]: url }));
                      } catch (_) {}
                    })();
                  }

                  return (
                    <div key={p} ref={onPageHolderRef(p)} data-page={p} className="relative mx-auto bg-white shadow rounded mb-6" style={{ width: `${pageWidth}px`, height: `${pageHeight}px` }}>
                      {isVisible && (
                        dataUrl ? (
                          <img src={dataUrl} alt={`Page ${p}`} className="absolute inset-0 w-full h-full object-contain" onLoad={() => ensureFabric(p)} />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400">Rendering...</div>
                        )
                      )}
                    </div>
                  );
                })}
              </Document>
            </div>
          </main>
          {Toolbar}
        </div>
      )}
    </div>
  );
};

export default PdfEditorPage;