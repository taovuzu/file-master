// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useReducer,
// } from "react";
// import { Button, ColorPicker, InputNumber, message, Typography } from "antd";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   FileTextOutlined,
//   UndoOutlined,
//   RedoOutlined,
//   ZoomInOutlined,
//   ZoomOutOutlined,
//   SaveOutlined,
// } from "@ant-design/icons";
// import { Document, pdfjs } from "react-pdf";
// import { FixedSizeList as List } from "react-window";
// import * as fabric from "fabric";
// import { createBitmapCache } from "@/utils/lruCache";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import FileUploadZone from "@/components/FileUploadZone";

// pdfjs.GlobalWorkerOptions.workerSrc =
//   "https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.mjs";
// const { Title } = Typography;

// const toHex = (c) => {
//   if (!c) return "#000000";
//   if (typeof c === "string") return c;
//   if (typeof c === "object" && typeof c.toHexString === "function")
//     return c.toHexString();
//   const { r, g, b } = c || {};
//   if ([r, g, b].every((v) => typeof v === "number")) {
//     const h = (v) => v.toString(16).padStart(2, "0");
//     return `#${h(r)}${h(g)}${h(b)}`;
//   }
//   return "#000000";
// };

// // Memoized page row component to avoid hook misuse
// const PageRow = React.memo(({ index, style, data }) => {
//   const {
//     pageNumber,
//     renderScale,
//     uiScale,
//     pageBitmapCache,
//     pageHoldersRef,
//     fabricRefs,
//     ensureFabric,
//     requestPageBitmap,
//     numPages,
//     containerRef,
//   } = data;

//   const pageWidth = 595 * renderScale; // A4 width at 72 dpi
//   const pageHeight = 842 * renderScale;
//   const cacheKey = `${pageNumber}@${Math.round(renderScale * 100)}`;
//   const cached = pageBitmapCache.current.get(cacheKey);

//   // Preload neighboring pages when this page becomes visible
//   useEffect(() => {
//     const neighbors = [
//       pageNumber - 2,
//       pageNumber - 1,
//       pageNumber + 1,
//       pageNumber + 2,
//     ].filter((n) => n >= 1 && n <= numPages);
//     neighbors.forEach((np) => requestPageBitmap(np, renderScale));
//   }, [pageNumber, renderScale, numPages, requestPageBitmap]);

//   // Initialize Fabric when page becomes visible
//   useEffect(() => {
//     const holder = pageHoldersRef.current[pageNumber];
//     if (!holder) return;

//     // Use the shared IntersectionObserver from parent
//     const observer = data.intersectionObserver;
//     if (observer) {
//       observer.observe(holder);
//       return () => observer.unobserve(holder);
//     }
//   }, [pageNumber, data.intersectionObserver]);

//   // Request bitmap for this page if not cached
//   useEffect(() => {
//     if (!cached && data.pdfDocReady && data.pdfDocRef?.current) {
//       requestPageBitmap(pageNumber, renderScale);
//     }
//   }, [pageNumber, renderScale, cached, requestPageBitmap, data.pdfDocReady, data.pdfDocRef]);

//   return (
//     <div style={style}>
//       <div
//         ref={(el) => {
//           if (el) {
//             pageHoldersRef.current[pageNumber] = el;
//             el.setAttribute("data-page", String(pageNumber));
//           }
//         }}
//         data-page={pageNumber}
//         className="relative mx-auto bg-white shadow rounded mb-6"
//         style={{
//           width: `${pageWidth}px`,
//           height: `${pageHeight}px`,
//           transform: `scale(${uiScale / renderScale})`,
//           transformOrigin: "top center",
//         }}
//       >
//         {cached ? (
//           <img
//             data-layer="bitmap"
//             src={cached}
//             alt={`Page ${pageNumber}`}
//             className="absolute inset-0 w-full h-full object-contain"
//             onLoad={() => {
//               // Safety check: ensure the component is still mounted and PDF is ready
//               if (data.pdfDocRef?.current && data.pdfDocReady) {
//                 ensureFabric(pageNumber);
//               }
//             }}
//           />
//         ) : (
//           <div className="flex items-center justify-center w-full h-full text-gray-400">
//             Rendering...
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// // Memoized thumbnail component
// const ThumbnailItem = React.memo(
//   ({
//     pageNumber,
//     currentPage,
//     onPageSelect,
//     thumbnailsRef,
//     requestThumbnail,
//     thumbListeners,
//   }) => {
//     const [src, setSrc] = useState(() => thumbnailsRef.current[pageNumber]);

//     useEffect(() => {
//       if (!src) {
//         requestThumbnail(pageNumber);
//       }

//       const listener = (url) => setSrc(url);
//       if (!thumbListeners.current.get(pageNumber)) {
//         thumbListeners.current.set(pageNumber, new Set());
//       }
//       thumbListeners.current.get(pageNumber).add(listener);

//       return () => {
//         thumbListeners.current.get(pageNumber)?.delete(listener);
//       };
//     }, [pageNumber, src, requestThumbnail, thumbListeners]);

//     return (
//       <button
//         className={`w-full text-left cursor-pointer border rounded ${
//           currentPage === pageNumber
//             ? "border-blue-500 bg-blue-50"
//             : "border-gray-200"
//         }`}
//         onClick={() => onPageSelect(pageNumber)}
//       >
//         <div
//           className="bg-white flex items-center justify-center overflow-hidden"
//           style={{ width: 72, height: 96, margin: "0 auto" }}
//         >
//           {src ? (
//             <img
//               src={src}
//               alt={`Page ${pageNumber}`}
//               loading="lazy"
//               className="max-w-full max-h-full object-contain"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
//               {pageNumber}
//             </div>
//           )}
//         </div>
//         <div className="text-center text-[10px] py-1 text-gray-600">
//           {pageNumber}
//         </div>
//       </button>
//     );
//   }
// );

// const PdfEditorPage = () => {
//   const [file, setFile] = useState(null);
//   const [numPages, setNumPages] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   // uiScale updates immediately for smooth zoom via CSS transform
//   const [uiScale, setUiScale] = useState(1);
//   // renderScale is debounced to reduce re-rendering cost
//   const [renderScale, setRenderScale] = useState(1);
//   const [tool, setTool] = useState("select"); // select | text | pen | erase
//   const [color, setColor] = useState("#000000");
//   const [fontSize, setFontSize] = useState(16);
//   const [loading, setLoading] = useState(false);

//   // Refs for performance-critical data (avoid React re-renders)
//   const thumbnailsRef = useRef({}); // pageNumber -> objectURL
//   const pageBitmapCache = useRef(createBitmapCache(20)); // key `${pageNumber}@${Math.round(renderScale*100)}` -> objectURL
//   const pageActiveJobs = useRef(new Map()); // key -> jobId
//   const pdfDocRef = useRef(null);
//   const pdfBufferRef = useRef(null);
//   const containerRef = useRef(null);
//   const pageHoldersRef = useRef({}); // pageNumber -> HTMLElement holder
//   const fabricRefs = useRef({}); // pageNumber -> fabric.Canvas
//   const histBack = useRef({}); // pageNumber -> JSON[]
//   const histFwd = useRef({}); // pageNumber -> JSON[]
//   const thumbListeners = useRef(new Map()); // pageNumber -> Set<fn>
//   const rendererWorkerRef = useRef(null);
//   const saverWorkerRef = useRef(null);
//   const zoomDebounceRef = useRef(null);
//   const historyDebounceRef = useRef({}); // pageNumber -> timeout
//   const initializedPages = useRef(new Set()); // Track which pages have Fabric initialized
//   const intersectionObserverRef = useRef(null);
//   const ensureFabricRef = useRef(null); // Store reference to ensureFabric function

//   // Initialize workers
//   useEffect(() => {
//     rendererWorkerRef.current = new Worker(
//       new URL("@/workers/pdfRenderer.worker.js", import.meta.url),
//       { type: "module" }
//     );
//     saverWorkerRef.current = new Worker(
//       new URL("@/workers/pdfSaver.worker.js", import.meta.url),
//       { type: "module" }
//     );

//     const rw = rendererWorkerRef.current;
//     rw.onmessage = (e) => {
//       const { type } = e.data || {};
//       if (type === "loaded") {
//         // no-op here; numPages handled by react-pdf Document
//       } else if (type === "rendered") {
//         const { pageNumber, scale, url, jobId } = e.data;
//         const key = `${pageNumber}@${Math.round(scale * 100)}`;

//         // Safety check: only process if the component is still mounted and buffer is valid
//         if (!pdfBufferRef.current || !pdfDocRef.current) {
//           console.log('Component unmounted or buffer invalid, ignoring render result');
//           return;
//         }

//         pageBitmapCache.current.set(key, url);

//         const activeKey = key;
//         const currentJob = pageActiveJobs.current.get(activeKey);
//         if (currentJob === jobId) {
//           pageActiveJobs.current.delete(activeKey);
//           // Trigger repaint for that holder only by swapping its <img> src when present
//           const holder = pageHoldersRef.current[pageNumber];
//           if (holder) {
//             const img = holder.querySelector('img[data-layer="bitmap"]');
//             if (img) img.src = url;
//           }
//         }
//       }
//     };

//     return () => {
//       try {
//         rendererWorkerRef.current?.terminate();
//       } catch {}
//       try {
//         saverWorkerRef.current?.terminate();
//       } catch {}

//       // Clean up any remaining resources
//       pageActiveJobs.current.clear();
//       pageBitmapCache.current.clear();

//       // Clean up thumbnails and revoke object URLs
//       Object.values(thumbnailsRef.current).forEach(url => {
//         try {
//           URL.revokeObjectURL(url);
//         } catch {}
//       });
//       thumbnailsRef.current = {};

//       initializedPages.current.clear();

//       // Clean up Fabric canvases
//       Object.values(fabricRefs.current).forEach((fc) => {
//         try {
//           fc.dispose();
//         } catch {}
//       });
//       fabricRefs.current = {};

//       // Reset PDF state
//       pdfDocRef.current = null;
//       pdfBufferRef.current = null;
//     };
//   }, []);

//   // Initialize single IntersectionObserver for all pages
//   useEffect(() => {
//     if (!containerRef.current) return;

//     intersectionObserverRef.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             const pageNumber = parseInt(entry.target.getAttribute("data-page"));
//             if (pageNumber && !initializedPages.current.has(pageNumber)) {
//               // Use a ref to store the current ensureFabric function
//               if (ensureFabricRef.current) {
//                 ensureFabricRef.current(pageNumber);
//                 initializedPages.current.add(pageNumber);
//               }
//             }
//           }
//         });
//       },
//       {
//         root: containerRef.current,
//         threshold: 0.25,
//         rootMargin: "100px", // Preload pages slightly before they're visible
//       }
//     );

//     return () => {
//       if (intersectionObserverRef.current) {
//         intersectionObserverRef.current.disconnect();
//       }
//     };
//   }, []);

//     // Load pdf.js document once per file; keep buffer for saving later
//   useEffect(() => {
//     let cancelled = false;

//     // Clean up previous state when file changes
//     const cleanup = () => {
//       // Clear bitmap cache and active jobs
//       pageBitmapCache.current.clear();
//       pageActiveJobs.current.clear();

//       // Reset buffer state and mark workers as needing reload
//       if (rendererWorkerRef.current) {
//         rendererWorkerRef.current.bufferLoaded = false;
//       }
//       if (saverWorkerRef.current) {
//         saverWorkerRef.current.bufferLoaded = false;
//       }

//       // Clear thumbnails
//       Object.values(thumbnailsRef.current).forEach(url => {
//         try {
//           URL.revokeObjectURL(url);
//         } catch {}
//       });
//       thumbnailsRef.current = {};

//       // Reset document and buffer refs
//       pdfDocRef.current = null;
//       pdfBufferRef.current = null;
//     };

//     const load = async () => {
//       if (!file) {
//         cleanup();
//         return;
//       }

//       try {
//         const buf = await file.arrayBuffer();

//         // Validate buffer before storing
//         if (!buf || buf.byteLength === 0) {
//           throw new Error('Invalid or empty file buffer');
//         }

//         // Store a reference to the buffer and mark workers as needing buffer reload
//         pdfBufferRef.current = buf;
//         if (rendererWorkerRef.current) {
//           rendererWorkerRef.current.bufferLoaded = false;
//         }
//         if (saverWorkerRef.current) {
//           saverWorkerRef.current.bufferLoaded = false;
//         }

//         const task = pdfjs.getDocument({ data: buf });
//         const pdf = await task.promise;
//         if (!cancelled) pdfDocRef.current = pdf;
//       } catch (error) {
//         console.error('Failed to load PDF:', error);
//         cleanup();
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//       cleanup();
//     };
//   }, [file]);

//   // Generate thumbnails lazily per item; no bulk state updates
//   const requestThumbnail = useCallback(async (pageNumber) => {
//     if (!pdfDocRef.current || thumbnailsRef.current[pageNumber]) return;

//     try {
//       // Safety check: ensure the document is still valid
//       if (!pdfDocRef.current || !pdfBufferRef.current) {
//         console.log('PDF document or buffer no longer valid, skipping thumbnail request');
//         return;
//       }

//       const page = await pdfDocRef.current.getPage(pageNumber);
//       const viewport = page.getViewport({ scale: 0.18 });
//       const canvas = new OffscreenCanvas(
//         Math.ceil(viewport.width),
//         Math.ceil(viewport.height)
//       );
//       const ctx = canvas.getContext("2d");
//       await page.render({ canvasContext: ctx, viewport }).promise;
//       const blob = await canvas.convertToBlob({ type: "image/png" });
//       const url = URL.createObjectURL(blob);
//       thumbnailsRef.current[pageNumber] = url;

//       const listeners = thumbListeners.current.get(pageNumber);
//       if (listeners) listeners.forEach((fn) => fn(url));
//     } catch (error) {
//       console.warn('Thumbnail generation failed:', error);
//       // Ignore thumbnail failures
//     }
//   }, []);

//   const requestPageBitmap = useCallback((pageNumber, scale) => {
//     // Wait for worker, buffer, and document to be available
//     if (!rendererWorkerRef.current || !pdfDocRef.current) {
//       console.log('Worker or document not ready, skipping bitmap request');
//       return;
//     }

//     // Enhanced buffer validation
//     if (!pdfBufferRef.current) {
//       console.log('PDF buffer not available, skipping bitmap request');
//       return;
//     }

//     // Check if buffer is still valid and accessible
//     try {
//       if (pdfBufferRef.current.byteLength === undefined || pdfBufferRef.current.byteLength <= 0) {
//         console.warn('PDF buffer is invalid or has been detached');
//         // Reset buffer state and mark workers as needing reload
//         pdfBufferRef.current = null;
//         if (rendererWorkerRef.current) {
//           rendererWorkerRef.current.bufferLoaded = false;
//         }
//         if (saverWorkerRef.current) {
//           saverWorkerRef.current.bufferLoaded = false;
//         }
//         return;
//       }
//     } catch (error) {
//       console.warn('PDF buffer validation failed:', error);
//       // Reset buffer state and mark workers as needing reload
//       pdfBufferRef.current = null;
//       if (rendererWorkerRef.current) {
//         rendererWorkerRef.current.bufferLoaded = false;
//       }
//       if (saverWorkerRef.current) {
//         saverWorkerRef.current.bufferLoaded = false;
//       }
//       return;
//     }

//     const key = `${pageNumber}@${Math.round(scale * 100)}`;
//     if (pageBitmapCache.current.get(key)) return;

//     const activeKey = key;
//     const currentJob = pageActiveJobs.current.get(activeKey);
//     if (currentJob) {
//       rendererWorkerRef.current.postMessage({ type: 'cancel', jobId: currentJob });
//     }

//     const jobId = `${activeKey}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
//     pageActiveJobs.current.set(activeKey, jobId);

//     // Send buffer only once per file
//     if (!rendererWorkerRef.current.bufferLoaded) {
//       try {
//         // Clone buffer safely with additional validation
//         const clonedBuffer = pdfBufferRef.current.slice(0);
//         if (clonedBuffer && clonedBuffer.byteLength > 0) {
//           rendererWorkerRef.current.postMessage({
//             type: 'load',
//             buffer: clonedBuffer
//           });
//           rendererWorkerRef.current.bufferLoaded = true;
//         } else {
//           console.warn('Failed to clone PDF buffer - invalid result');
//           return;
//         }
//       } catch (error) {
//         console.warn('Failed to clone PDF buffer:', error);
//         // Reset buffer state and mark workers as needing reload
//         pdfBufferRef.current = null;
//         if (rendererWorkerRef.current) {
//           rendererWorkerRef.current.bufferLoaded = false;
//         }
//         if (saverWorkerRef.current) {
//           saverWorkerRef.current.bufferLoaded = false;
//         }
//         return;
//       }
//     }

//     // Send render command
//     rendererWorkerRef.current.postMessage({ type: 'render', jobId, pageNumber, scale });
//   }, []);

//   const saveHistory = (pageNumber) => {
//     const fc = fabricRefs.current[pageNumber];
//     if (!fc) return;
//     const json = fc.toJSON();
//     histBack.current[pageNumber] = [
//       ...(histBack.current[pageNumber] || []),
//       json,
//     ].slice(-50);
//     histFwd.current[pageNumber] = [];
//   };

//   const debounceHistory = (pageNumber) => {
//     clearTimeout(historyDebounceRef.current[pageNumber]);
//     historyDebounceRef.current[pageNumber] = setTimeout(
//       () => saveHistory(pageNumber),
//       500
//     );
//   };

//   const ensureFabric = useCallback(
//     (pageNumber) => {
//       const holder = pageHoldersRef.current[pageNumber];
//       if (!holder || fabricRefs.current[pageNumber]) return;

//       // Safety check: ensure the holder is still in the DOM
//       if (!document.contains(holder)) {
//         console.log('Page holder no longer in DOM, skipping Fabric initialization');
//         return;
//       }

//       const canvasEl = document.createElement("canvas");
//       canvasEl.className = "absolute inset-0 w-full h-full";
//       holder.appendChild(canvasEl);

//       const fc = new fabric.Canvas(canvasEl, {
//         selection: true,
//         preserveObjectStacking: true,
//       });

//       const fit = () => {
//         const rect = holder.getBoundingClientRect();
//         fc.setWidth(rect.width);
//         fc.setHeight(rect.height);
//         fc.calcOffset();
//         fc.requestRenderAll();
//       };
//       fit();

//       const ro = new ResizeObserver(fit);
//       ro.observe(holder);
//       fc._ro = ro;

//       const syncTool = () => {
//         fc.isDrawingMode = tool === "pen";
//         if (fc.freeDrawingBrush) {
//           fc.freeDrawingBrush.color = toHex(color);
//           fc.freeDrawingBrush.width = Math.max(1, fontSize / 6);
//         }
//       };
//       syncTool();

//       fc.on("mouse:down", (opt) => {
//         if (tool === "text") {
//           const p = fc.getPointer(opt.e);
//           const tb = new fabric.Textbox("Text", {
//             left: p.x,
//             top: p.y,
//             fill: toHex(color),
//             fontSize,
//             editable: true,
//           });
//           fc.add(tb).setActiveObject(tb);
//           debounceHistory(pageNumber);
//         } else if (tool === "erase") {
//           const obj = fc.getActiveObject();
//           if (obj) {
//             fc.remove(obj);
//             fc.discardActiveObject();
//             fc.requestRenderAll();
//             debounceHistory(pageNumber);
//           }
//         }
//       });

//       const onChange = () => debounceHistory(pageNumber);
//       fc.on("object:added", onChange);
//       fc.on("object:modified", onChange);
//       fc.on("object:removed", onChange);

//       fabricRefs.current[pageNumber] = fc;
//     },
//     [tool, color, fontSize]
//   );

//   // Update the ref whenever ensureFabric changes
//   useEffect(() => {
//     ensureFabricRef.current = ensureFabric;
//   }, [ensureFabric]);

//   // Sync Fabric tools when they change
//   useEffect(() => {
//     Object.values(fabricRefs.current).forEach((fc) => {
//       fc.isDrawingMode = tool === "pen";
//       if (fc.freeDrawingBrush) {
//         fc.freeDrawingBrush.color = toHex(color);
//         fc.freeDrawingBrush.width = Math.max(1, fontSize / 6);
//       }
//     });
//   }, [tool, color, fontSize]);

//   const undo = () => {
//     const p = currentPage;
//     const back = histBack.current[p] || [];
//     if (back.length < 2) return;
//     const fc = fabricRefs.current[p];
//     const last = back.pop();
//     const prev = back[back.length - 1];
//     histBack.current[p] = back;
//     histFwd.current[p] = [...(histFwd.current[p] || []), last].slice(-50);
//     fc.loadFromJSON(prev, () => fc.requestRenderAll());
//   };

//   const redo = () => {
//     const p = currentPage;
//     const fwd = histFwd.current[p] || [];
//     if (!fwd.length) return;
//     const fc = fabricRefs.current[p];
//     const next = fwd.pop();
//     histBack.current[p] = [...(histBack.current[p] || []), next].slice(-50);
//     histFwd.current[p] = fwd;
//     fc.loadFromJSON(next, () => fc.requestRenderAll());
//   };

//   const eraseSelected = () => {
//     const fc = fabricRefs.current[currentPage];
//     if (!fc) return;
//     const obj = fc.getActiveObject();
//     if (obj) {
//       fc.remove(obj);
//       fc.discardActiveObject();
//       fc.requestRenderAll();
//       debounceHistory(currentPage);
//     }
//   };

//   const clampScale = (s) => Math.max(0.25, Math.min(2, s));
//   const quantizeScale = (s) => Math.round(s / 0.25) * 0.25;

//   const applyRenderScaleDebounced = useCallback((nextUi) => {
//     clearTimeout(zoomDebounceRef.current);
//     zoomDebounceRef.current = setTimeout(() => {
//       setRenderScale(quantizeScale(nextUi));
//     }, 300);
//   }, []);

//   const zoomIn = () =>
//     setUiScale((s) => {
//       const u = clampScale(+(s + 0.1).toFixed(2));
//       applyRenderScaleDebounced(u);
//       return u;
//     });

//   const zoomOut = () =>
//     setUiScale((s) => {
//       const u = clampScale(+(s - 0.1).toFixed(2));
//       applyRenderScaleDebounced(u);
//       return u;
//     });

//   const onFilesSelected = (files) => {
//     if (!files?.length) return;
//     const f = files[0];
//     if (f.type !== "application/pdf") {
//       message.error("Please select a PDF file");
//       return;
//     }
//     setFile(f);
//     setCurrentPage(1);
//     setUiScale(1);
//     setRenderScale(1);

//     // Clear caches and reset state
//     pageBitmapCache.current.clear();
//     thumbnailsRef.current = {};
//     initializedPages.current.clear();

//     // Clean up Fabric canvases
//     Object.values(fabricRefs.current).forEach((fc) => {
//       try {
//         fc.dispose();
//       } catch {}
//     });
//     fabricRefs.current = {};
//     histBack.current = {};
//     histFwd.current = {};

//     // Reset worker buffer state
//     if (rendererWorkerRef.current) {
//       rendererWorkerRef.current.bufferLoaded = false;
//     }
//     if (saverWorkerRef.current) {
//       saverWorkerRef.current.bufferLoaded = false;
//     }

//     // Clear any active jobs
//     pageActiveJobs.current.clear();
//   };

//   const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

//   const savePdf = async () => {
//     if (!file) return message.error("Upload a PDF first");
//     try {
//       setLoading(true);
//       const pages = [];

//       for (let p = 1; p <= numPages; p++) {
//         const fc = fabricRefs.current[p];
//         if (!fc) continue;

//         const overlayCanvas = fc.toCanvasElement({ multiplier: 2, enableRetinaScaling: false });
//         const blob = await new Promise((resolve) => overlayCanvas.toBlob(resolve, 'image/png'));
//         if (blob) pages.push({ pageNumber: p, blob });
//       }

//       const ww = saverWorkerRef.current;
//       const done = new Promise((resolve, reject) => {
//         const onMsg = (e) => {
//           if (e.data?.type === 'saved') {
//             ww.removeEventListener('message', onMsg);
//             resolve(e.data.blob);
//           } else if (e.data?.type === 'error') {
//             ww.removeEventListener('message', onMsg);
//             reject(new Error(e.data.message));
//           }
//         };
//         ww.addEventListener('message', onMsg);
//       });

//              // Send a cloned buffer to avoid DataCloneError
//        try {
//          if (pdfBufferRef.current && pdfBufferRef.current.byteLength > 0) {
//            const clonedBuffer = pdfBufferRef.current.slice(0);
//            ww.postMessage({
//              type: 'save',
//              originalPdfBuffer: clonedBuffer,
//              pages
//            });
//          } else {
//            throw new Error('PDF buffer is not available or has been detached');
//          }
//        } catch (error) {
//          console.error('Failed to clone PDF buffer for saving:', error);
//          message.error('Failed to prepare PDF for saving. Please try uploading the file again.');
//          return;
//        }

//       const blob = await done;
//       const a = document.createElement("a");
//       a.href = URL.createObjectURL(blob);
//       a.download = `edited_${file.name || "document"}`;
//       a.click();
//       message.success("PDF saved with edits");
//     } catch (e) {
//       console.error(e);
//       message.error("Failed to save PDF");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const Sidebar = useMemo(
//     () => (
//       <div
//         className="w-28 bg-white border-r border-gray-200 overflow-y-auto"
//         style={{ maxHeight: "calc(100vh - 100px)" }}
//       >
//         <div className="p-2 space-y-3">
//           {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
//             <ThumbnailItem
//               key={p}
//               pageNumber={p}
//               currentPage={currentPage}
//               onPageSelect={setCurrentPage}
//               thumbnailsRef={thumbnailsRef}
//               requestThumbnail={requestThumbnail}
//               thumbListeners={thumbListeners}
//             />
//           ))}
//         </div>
//       </div>
//     ),
//     [numPages, currentPage, requestThumbnail]
//   );

//   // Memoized toolbar to prevent unnecessary re-renders
//   const Toolbar = useMemo(
//     () => (
//       <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border rounded-lg shadow px-3 py-2 flex items-center gap-2">
//         <Button
//           type={tool === "select" ? "primary" : "default"}
//           size="small"
//           onClick={() => setTool("select")}
//           icon={<EditOutlined />}
//         >
//           Select
//         </Button>
//         <Button
//           type={tool === "text" ? "primary" : "default"}
//           size="small"
//           onClick={() => setTool("text")}
//           icon={<FileTextOutlined />}
//         >
//           Text
//         </Button>
//         <Button
//           type={tool === "pen" ? "primary" : "default"}
//           size="small"
//           onClick={() => setTool("pen")}
//           icon={<EditOutlined />}
//         >
//           Pen
//         </Button>
//         <Button
//           type={tool === "erase" ? "primary" : "default"}
//           size="small"
//           onClick={eraseSelected}
//           icon={<DeleteOutlined />}
//         >
//           Erase
//         </Button>
//         <div className="mx-1 h-6 w-px bg-gray-200" />
//         <ColorPicker value={color} onChange={setColor} />
//         <InputNumber
//           min={10}
//           max={72}
//           value={fontSize}
//           onChange={setFontSize}
//           size="small"
//           style={{ width: 70 }}
//         />
//         <div className="mx-1 h-6 w-px bg-gray-200" />
//         <Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} />
//         <span>{Math.round(uiScale * 100)}%</span>
//         <Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} />
//         <div className="mx-1 h-6 w-px bg-gray-200" />
//         <Button size="small" icon={<UndoOutlined />} onClick={undo} />
//         <Button size="small" icon={<RedoOutlined />} onClick={redo} />
//         <div className="mx-1 h-6 w-px bg-gray-200" />
//         <Button
//           type="primary"
//           size="small"
//           icon={<SaveOutlined />}
//           loading={loading}
//           onClick={savePdf}
//         >
//           Save PDF
//         </Button>
//       </div>
//     ),
//     [
//       tool,
//       color,
//       fontSize,
//       uiScale,
//       loading,
//       zoomOut,
//       zoomIn,
//       undo,
//       redo,
//       eraseSelected,
//       savePdf,
//     ]
//   );

//   // Virtualized page item data for react-window
//   const pageItemData = useMemo(
//     () => ({
//       renderScale,
//       uiScale,
//       pageBitmapCache,
//       pageHoldersRef,
//       fabricRefs,
//       ensureFabric,
//       requestPageBitmap,
//       numPages,
//       containerRef,
//       intersectionObserver: intersectionObserverRef.current,
//       pdfDocReady: !!pdfDocRef.current,
//       pdfDocRef, // Pass the ref to PageRow components
//     }),
//     [renderScale, uiScale, numPages, ensureFabric, requestPageBitmap, pdfDocRef]
//   );

//   // Calculate item height for virtualization
//   const PAGE_BASE_HEIGHT = 842; // A4 height at 72 dpi
//   const itemHeight = Math.round(PAGE_BASE_HEIGHT * renderScale + 24); // include margin

//   // Kick off bitmap for current page and nearby when renderScale changes
//   useEffect(() => {
//     if (!numPages || !pdfBufferRef.current || !pdfDocRef.current) return;
//     requestPageBitmap(currentPage, renderScale);
//     [currentPage - 1, currentPage + 1]
//       .filter((p) => p >= 1 && p <= numPages)
//       .forEach((p) => requestPageBitmap(p, renderScale));
//   }, [renderScale, currentPage, numPages, requestPageBitmap, pdfBufferRef.current, pdfDocRef.current]);

//   return (
//     <div>
//       <Header />
//       {!file ? (
//         <main style={{ padding: "8px" }}>
//           <div className="text-center">
//             <Title level={2} style={{ marginBottom: 8 }}>
//               PDF Editor
//             </Title>
//           </div>
//           <div className="flex items-start justify-center w-full">
//             <FileUploadZone
//               onFilesSelected={onFilesSelected}
//               fileList={file}
//               maxFiles={1}
//               maxSize={50 * 1024 * 1024}
//               multiple={false}
//               acceptedTypes={["application/pdf"]}
//             />
//           </div>
//           <Footer />
//         </main>
//       ) : (
//         <div
//           className="flex"
//           style={{ maxHeight: "calc(100vh - 64px)", overflow: "hidden" }}
//         >
//           {Sidebar}
//           <main
//             className="flex-1 bg-gray-100"
//             style={{ maxHeight: "calc(100vh - 64px)" }}
//           >
//             <div ref={containerRef} className="h-full overflow-auto px-6 py-4">
//               <Document
//                 file={file}
//                 onLoadSuccess={onDocumentLoadSuccess}
//                 loading={<div className="p-6">Loading PDF...</div>}
//               >
//                                  {pdfBufferRef.current && pdfDocRef.current ? (
//                    <List
//                      height={window.innerHeight - 120}
//                      width="100%"
//                      itemCount={numPages}
//                      itemSize={itemHeight}
//                      overscanCount={4}
//                      className="pb-24"
//                      itemData={pageItemData}
//                    >
//                      {PageRow}
//                    </List>
//                  ) : (
//                    <div className="flex items-center justify-center h-full text-gray-400">
//                      <div>Loading PDF...</div>
//                    </div>
//                  )}
//               </Document>
//             </div>
//           </main>
//           {Toolbar}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PdfEditorPage;

const PdfEditorPage = () => {
  return <>Work in Progress.......</>;
};

export default PdfEditorPage;
