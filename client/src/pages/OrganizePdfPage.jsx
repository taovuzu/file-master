// import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
// import FileUploadZone from "@/components/FileUploadZone";
// import { GlobalWorkerOptions } from "@/utils/pdfWorker";
// import * as pdfjsLib from "pdfjs-dist";
// import { PDFDocument, degrees } from "pdf-lib";

// const initialState = {
//   pages: [],
//   zoom: 1,
//   selected: new Set(),
//   history: [],
//   future: []
// };

// function cloneStateSlice(state) {
//   return {
//     pages: state.pages.map((p) => ({ ...p })),
//     zoom: state.zoom,
//     selected: new Set([...state.selected])
//   };
// }

// function reducer(state, action) {
//   const pushHistory = (next) => ({
//     ...next,
//     history: [...state.history, cloneStateSlice(state)],
//     future: []
//   });

//   switch (action.type) {
//     case "SET_PAGES": {
//       const next = { ...state, pages: action.pages, selected: new Set(), zoom: 1 };
//       return pushHistory(next);
//     }
//     case "ROTATE": {
//       const { direction } = action; // +90 or -90
//       const pages = state.pages.map((p, idx) => {
//         if (!state.selected.has(idx)) return p;
//         const rotation = ((p.rotation || 0) + direction + 360) % 360;
//         return { ...p, rotation };
//       });
//       return pushHistory({ ...state, pages });
//     }
//     case "DELETE_SELECTED": {
//       const pages = state.pages.filter((_, idx) => !state.selected.has(idx));
//       return pushHistory({ ...state, pages, selected: new Set() });
//     }
//     case "REORDER": {
//       const { from, to } = action;
//       const pages = state.pages.slice();
//       const [moved] = pages.splice(from, 1);
//       pages.splice(to, 0, moved);
//       // Recompute pageNumber to reflect new order for rendering
//       const normalized = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
//       // Update selection indices
//       const selected = new Set();
//       state.selected.forEach((i) => {
//         if (i === from) selected.add(to);
//         else if (from < i && i <= to) selected.add(i - 1);
//         else if (to <= i && i < from) selected.add(i + 1);
//         else selected.add(i);
//       });
//       return pushHistory({ ...state, pages: normalized, selected });
//     }
//     case "TOGGLE_SELECT": {
//       const next = new Set([...state.selected]);
//       if (next.has(action.index)) next.delete(action.index);
//       else next.add(action.index);
//       return { ...state, selected: next };
//     }
//     case "SELECT_SINGLE": {
//       return { ...state, selected: new Set([action.index]) };
//     }
//     case "CLEAR_SELECTION": {
//       return { ...state, selected: new Set() };
//     }
//     case "ZOOM_IN": {
//       return { ...state, zoom: Math.min(2.5, state.zoom + 0.1) };
//     }
//     case "ZOOM_OUT": {
//       return { ...state, zoom: Math.max(0.5, state.zoom - 0.1) };
//     }
//     case "RESET": {
//       if (state.history.length === 0) return state;
//       const first = state.history[0];
//       return { ...initialState, pages: first.pages, zoom: 1 };
//     }
//     case "UNDO": {
//       if (state.history.length === 0) return state;
//       const prev = state.history[state.history.length - 1];
//       const future = [cloneStateSlice(state), ...state.future];
//       const history = state.history.slice(0, -1);
//       return { ...state, ...prev, history, future };
//     }
//     case "REDO": {
//       if (state.future.length === 0) return state;
//       const [next, ...rest] = state.future;
//       const history = [...state.history, cloneStateSlice(state)];
//       return { ...state, ...next, history, future: rest };
//     }
//     default:
//       return state;
//   }
// }

// const OrganizePdfPage = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const [pdfBytes, setPdfBytes] = useState(null);
//   const [pdfjsDoc, setPdfjsDoc] = useState(null);
//   const dragIndexRef = useRef(null);
//   const isDraggingRef = useRef(false);

//   const canUndo = state.history.length > 0;
//   const canRedo = state.future.length > 0;

//   const handleFilesSelected = useCallback(async (files) => {
//     const file = files && files[0];
//     if (!file) return;
    
//     try {
//       const bytes = await file.arrayBuffer();
//       setPdfBytes(bytes);
      
//       const loadingTask = pdfjsLib.getDocument({ data: bytes });
//       const doc = await loadingTask.promise;
//       setPdfjsDoc(doc);
      
//       const pages = Array.from({ length: doc.numPages }).map((_, i) => ({
//         id: `${i + 1}`,
//         pageNumber: i + 1,
//         rotation: 0
//       }));
      
//       dispatch({ type: "SET_PAGES", pages });
//     } catch (error) {
//       console.error("Error loading PDF:", error);
//       alert("Error loading PDF file. Please try again.");
//     }
//   }, []);

//   const onThumbClick = useCallback((e, index) => {
//     // Don't handle clicks if we're dragging
//     if (isDraggingRef.current) return;
    
//     if (e.ctrlKey || e.metaKey) {
//       dispatch({ type: "TOGGLE_SELECT", index });
//     } else {
//       dispatch({ type: "SELECT_SINGLE", index });
//     }
//   }, []);

//   const onDragStart = useCallback((e, index) => {
//     isDraggingRef.current = true;
//     dragIndexRef.current = index;
//     e.dataTransfer.effectAllowed = "move";
//     e.dataTransfer.setData("text/plain", index.toString());
    
//     // Add visual feedback
//     e.target.style.opacity = "0.5";
//   }, []);

//   const onDragEnd = useCallback((e) => {
//     isDraggingRef.current = false;
//     e.target.style.opacity = "1";
//     dragIndexRef.current = null;
//   }, []);

//   const onDragOver = useCallback((e) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//   }, []);

//   const onDragEnter = useCallback((e) => {
//     e.preventDefault();
//     e.currentTarget.style.borderColor = "#3b82f6";
//     e.currentTarget.style.backgroundColor = "#eff6ff";
//   }, []);

//   const onDragLeave = useCallback((e) => {
//     e.currentTarget.style.borderColor = "transparent";
//     e.currentTarget.style.backgroundColor = "white";
//   }, []);

//   const onDrop = useCallback((e, index) => {
//     e.preventDefault();
//     e.currentTarget.style.borderColor = "transparent";
//     e.currentTarget.style.backgroundColor = "white";
    
//     const from = dragIndexRef.current;
//     const to = index;
    
//     if (from == null || to == null || from === to) return;
    
//     dispatch({ type: "REORDER", from, to });
//     dragIndexRef.current = null;
//   }, []);

//   const rotateSelected = useCallback((deg) => {
//     if (state.selected.size === 0) return;
//     dispatch({ type: "ROTATE", direction: deg });
//   }, [state.selected.size]);

//   const deleteSelected = useCallback(() => {
//     if (state.selected.size === 0) return;
//     if (confirm(`Are you sure you want to delete ${state.selected.size} page(s)?`)) {
//       dispatch({ type: "DELETE_SELECTED" });
//     }
//   }, [state.selected.size]);

//   const download = useCallback(async () => {
//     if (!pdfBytes || state.pages.length === 0) return;
    
//     try {
//       const srcDoc = await PDFDocument.load(pdfBytes);
//       const output = await PDFDocument.create();
//       const indices = state.pages.map((p) => p.pageNumber - 1);
//       const copied = await output.copyPages(srcDoc, indices);
      
//       copied.forEach((page, i) => {
//         const rot = state.pages[i].rotation || 0;
//         if (rot) page.setRotation(degrees(rot));
//         output.addPage(page);
//       });
      
//       const outBytes = await output.save();
//       const blob = new Blob([outBytes], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "organized.pdf";
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error creating PDF:", error);
//       alert("Error creating PDF. Please try again.");
//     }
//   }, [pdfBytes, state.pages]);

//   const clearSelection = useCallback(() => {
//     dispatch({ type: "CLEAR_SELECTION" });
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto p-4">
//         {state.pages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <FileUploadZone onFilesSelected={handleFilesSelected} multiple={false} acceptedTypes={["application/pdf"]} />
//           </div>
//         ) : (
//           <>
//             <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
//               <div className="max-w-6xl mx-auto px-2 py-3 flex items-center gap-2 flex-wrap">
//                 <button 
//                   onClick={() => rotateSelected(-90)} 
//                   disabled={state.selected.size === 0}
//                   className={`px-3 py-2 rounded-md ${state.selected.size > 0 ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
//                 >
//                   Rotate Left
//                 </button>
//                 <button 
//                   onClick={() => rotateSelected(+90)} 
//                   disabled={state.selected.size === 0}
//                   className={`px-3 py-2 rounded-md ${state.selected.size > 0 ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
//                 >
//                   Rotate Right
//                 </button>
//                 <button 
//                   onClick={deleteSelected} 
//                   disabled={state.selected.size === 0}
//                   className={`px-3 py-2 rounded-md ${state.selected.size > 0 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
//                 >
//                   Delete
//                 </button>
//                 <button 
//                   onClick={clearSelection}
//                   className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
//                 >
//                   Clear Selection
//                 </button>
//                 <div className="w-px h-6 bg-gray-300 mx-1" />
//                 <button onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} className={`px-3 py-2 rounded-md ${canUndo ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}>Undo</button>
//                 <button onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} className={`px-3 py-2 rounded-md ${canRedo ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}>Redo</button>
//                 <button onClick={() => dispatch({ type: "RESET" })} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Reset</button>
//                 <div className="w-px h-6 bg-gray-300 mx-1" />
//                 <button onClick={() => dispatch({ type: "ZOOM_OUT" })} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Zoom -</button>
//                 <span className="text-sm text-gray-600 w-12 text-center">{Math.round(state.zoom * 100)}%</span>
//                 <button onClick={() => dispatch({ type: "ZOOM_IN" })} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Zoom +</button>
//                 <div className="flex-1" />
//                 <button onClick={download} className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow">Download PDF</button>
//               </div>
//             </div>

//             <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//               {state.pages.map((p, index) => (
//                 <div
//                   key={p.id + "-" + index}
//                   className={`relative select-none rounded-lg bg-white shadow hover:shadow-lg transition-all duration-200 ring-2 cursor-pointer ${state.selected.has(index) ? "ring-primary-500 ring-4" : "ring-transparent hover:ring-gray-300"}`}
//                   draggable
//                   onDragStart={(e) => onDragStart(e, index)}
//                   onDragEnd={onDragEnd}
//                   onDragOver={onDragOver}
//                   onDragEnter={onDragEnter}
//                   onDragLeave={onDragLeave}
//                   onDrop={(e) => onDrop(e, index)}
//                   onClick={(e) => onThumbClick(e, index)}
//                 >
//                   <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white font-medium">
//                     {index + 1}
//                   </div>
//                   <ThumbCanvas pdfDoc={pdfjsDoc} pageNumber={p.pageNumber} rotation={p.rotation} zoom={state.zoom} />
//                   <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center gap-2">
//                     <button 
//                       onClick={(e) => { 
//                         e.stopPropagation(); 
//                         dispatch({ type: "SELECT_SINGLE", index });
//                         rotateSelected(-90); 
//                       }} 
//                       className="px-2 py-1 rounded bg-white shadow hover:bg-gray-50"
//                     >
//                       ⟲
//                     </button>
//                     <button 
//                       onClick={(e) => { 
//                         e.stopPropagation(); 
//                         dispatch({ type: "SELECT_SINGLE", index });
//                         rotateSelected(+90); 
//                       }} 
//                       className="px-2 py-1 rounded bg-white shadow hover:bg-gray-50"
//                     >
//                       ⟳
//                     </button>
//                     <button 
//                       onClick={(e) => { 
//                         e.stopPropagation(); 
//                         dispatch({ type: "SELECT_SINGLE", index });
//                         deleteSelected(); 
//                       }} 
//                       className="px-2 py-1 rounded bg-red-600 text-white shadow hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// const ThumbCanvas = ({ pdfDoc, pageNumber, rotation, zoom }) => {
//   const canvasRef = useRef(null);
  
//   useEffect(() => {
//     let cancelled = false;
    
//     const render = async () => {
//       if (!pdfDoc || !canvasRef.current) return;
      
//       try {
//         const page = await pdfDoc.getPage(pageNumber);
//         const viewport = page.getViewport({ scale: 0.22 * zoom, rotation: rotation || 0 });
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");
        
//         canvas.width = Math.floor(viewport.width);
//         canvas.height = Math.floor(viewport.height);
        
//         const renderContext = { canvasContext: ctx, viewport };
//         await page.render(renderContext).promise;
//       } catch (e) {
//         console.error("Error rendering page:", e);
//       }
//     };
    
//     render();
//     return () => { cancelled = true; };
//   }, [pdfDoc, pageNumber, rotation, zoom]);
  
//   return <canvas ref={canvasRef} className="block mx-auto rounded w-full h-auto" />;
// };

// export default OrganizePdfPage;

const OrganizePdfPage = () => {
  return <>Work in Progress.......</>;
};

export default OrganizePdfPage;