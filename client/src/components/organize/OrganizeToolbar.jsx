import React from "react";

const OrganizeToolbar = ({
  onRotateLeft,
  onRotateRight,
  onUndo,
  onRedo,
  onReset,
  onZoomIn,
  onZoomOut,
  onDelete,
  onDownload,
  canUndo,
  canRedo,
  zoom
}) => {
  return (
    <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
        <button onClick={onRotateLeft} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Rotate Left</button>
        <button onClick={onRotateRight} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Rotate Right</button>
        <button onClick={onDelete} className="px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">Delete</button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button onClick={onUndo} disabled={!canUndo} className={`px-3 py-2 rounded-md ${canUndo ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}>Undo</button>
        <button onClick={onRedo} disabled={!canRedo} className={`px-3 py-2 rounded-md ${canRedo ? "bg-gray-100 hover:bg-gray-200 text-gray-800" : "bg-gray-50 text-gray-400 cursor-not-allowed"}`}>Redo</button>
        <button onClick={onReset} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Reset</button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button onClick={onZoomOut} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Zoom -</button>
        <span className="text-sm text-gray-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800">Zoom +</button>
        <div className="flex-1" />
        <button onClick={onDownload} className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow">Download PDF</button>
      </div>
    </div>
  );
};

export default OrganizeToolbar;


