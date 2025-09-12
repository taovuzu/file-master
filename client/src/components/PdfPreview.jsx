import React, { useState } from "react";
import { Card, Tooltip, Empty, Spin } from "antd";
import { FileWordTwoTone } from "@ant-design/icons";
import {
  DeleteOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  PlusOutlined } from
"@ant-design/icons";
import usePdfPreview from "../hooks/usePdfPreview";

const PdfPreview = ({
  files = [],
  onUpdate,
  onRemove,
  onAdd,
  onReorder,
  onRotateChange,
  disabled = false,
  compact = true
}) => {
  const { previews, generatePreview } = usePdfPreview(files);
  const [rotations, setRotations] = useState({});
  const [dragId, setDragId] = useState(null);

  const handleDelete = (fileId) => {
    onRemove?.(fileId);
  };

  const handleRotate = async (fileId, direction) => {
    const delta = direction === "left" ? -90 : 90;
    const nextDeg = (rotations[fileId] || 0) + delta;
    setRotations((prev) => ({ ...prev, [fileId]: nextDeg }));
    await generatePreview(fileId, nextDeg);
    onRotateChange?.(fileId, nextDeg);
  };

  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const fromIndex = files.findIndex((f) => f.id === dragId);
    const toIndex = files.findIndex((f) => f.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...files];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onReorder?.(next);
    setDragId(null);
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8">
        <Empty description="No PDF files to preview" />
      </div>);

  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((pdf) =>
        <div
          key={pdf.id}
          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all duration-200 group"
          draggable
          onDragStart={() => handleDragStart(pdf.id)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(pdf.id)}>
          
            <div className="relative mb-3">
              <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                {previews && pdf?.id && previews[pdf.id] ?
              previews[pdf.id]?.fallback ?
              <FileWordTwoTone style={{ fontSize: 36 }} /> :
              <img src={previews[pdf.id]} alt={pdf.name} /> :
              <Spin size="small" />}
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {pdf.name}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Tooltip title="Rotate Left">
                  <button
                  onClick={() => handleRotate(pdf.id, "left")}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  disabled={disabled}>
                  
                    <RotateLeftOutlined className="w-3 h-3" />
                  </button>
                </Tooltip>
                <Tooltip title="Rotate Right">
                  <button
                  onClick={() => handleRotate(pdf.id, "right")}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                  disabled={disabled}>
                  
                    <RotateRightOutlined className="w-3 h-3" />
                  </button>
                </Tooltip>
              </div>

              <Tooltip title="Remove File">
                <button
                onClick={() => handleDelete(pdf.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                disabled={disabled}>
                
                  <DeleteOutlined className="w-3 h-3" />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {onAdd &&
        <button
          onClick={onAdd}
          disabled={disabled}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-all">
          
            <PlusOutlined className="text-2xl text-gray-400" />
            <span className="text-sm text-gray-500 mt-2">Add More</span>
          </button>
        }
      </div>);

  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {files.map((pdf) =>
        <Card
          key={pdf.id}
          hoverable
          style={{ width: 180 }}
          cover={
          <div className="h-40 bg-gray-100 flex items-center justify-center">
                {previews[pdf.id] ?
            previews[pdf.id]?.fallback ?
            <FileWordTwoTone style={{ fontSize: 48 }} /> :
            <img src={previews[pdf.id]} alt={pdf.name} /> :
            <Spin size="large" />}
              </div>
          }
          actions={[
          <Tooltip title="Rotate Left" key="rotate-left">
                <RotateLeftOutlined
              onClick={() => handleRotate(pdf.id, "left")}
              disabled={disabled} />
            
              </Tooltip>,
          <Tooltip title="Rotate Right" key="rotate-right">
                <RotateRightOutlined
              onClick={() => handleRotate(pdf.id, "right")}
              disabled={disabled} />
            
              </Tooltip>,
          <Tooltip title="Delete File" key="delete">
                <DeleteOutlined
              onClick={() => handleDelete(pdf.id)}
              disabled={disabled} />
            
              </Tooltip>]
          }>
          
            <Card.Meta
            title={pdf.name}
            description={`Size: ${(pdf.size / 1024 / 1024).toFixed(2)} MB`} />
          
          </Card>
        )}

        {onAdd &&
        <Card
          hoverable
          style={{ width: 180, textAlign: "center" }}
          onClick={onAdd}>
          
            <PlusOutlined style={{ fontSize: 24, color: "#999" }} />
            <p className="mt-2 text-gray-500">Add More</p>
          </Card>
        }
      </div>
    </div>);

};

export default PdfPreview;