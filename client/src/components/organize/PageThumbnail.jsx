import React, { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions } from "@/utils/pdfWorker";
import * as pdfjsLib from "pdfjs-dist";

const PageThumbnail = ({
  pdfDocument,
  pageIndex,
  page,
  zoom,
  isSelected,
  onClick,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const canvasRef = useRef(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!pdfDocument || !canvasRef.current) return;
      setRendering(true);
      try {
        const pageObj = await pdfDocument.getPage(page.pageNumber);
        const viewport = pageObj.getViewport({ scale: 0.2 * zoom, rotation: page.rotation || 0 });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const renderContext = { canvasContext: context, viewport };
        await pageObj.render(renderContext).promise;
        if (!cancelled) setRendering(false);
      } catch (e) {
        if (!cancelled) setRendering(false);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [pdfDocument, page.pageNumber, page.rotation, zoom]);

  return (
    <div
      className={`relative select-none rounded-lg bg-white shadow hover:shadow-lg transition ring-2 ${isSelected ? "ring-primary-500" : "ring-transparent"}`}
      draggable
      onDragStart={(e) => onDragStart(e, pageIndex)}
      onDragOver={(e) => onDragOver(e, pageIndex)}
      onDrop={(e) => onDrop(e, pageIndex)}
      onClick={(e) => onClick(e, pageIndex)}
    >
      <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-black/60 text-white">{pageIndex + 1}</div>
      <div className="group">
        <canvas ref={canvasRef} className="block mx-auto" />
        <div className="opacity-0 group-hover:opacity-100 transition absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRotateLeft(pageIndex); }} className="px-2 py-1 rounded bg-white shadow">⟲</button>
          <button onClick={(e) => { e.stopPropagation(); onRotateRight(pageIndex); }} className="px-2 py-1 rounded bg-white shadow">⟳</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete([pageIndex]); }} className="px-2 py-1 rounded bg-red-600 text-white shadow">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default PageThumbnail;


