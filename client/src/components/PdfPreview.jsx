// src/components/PdfPreview.jsx
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Card, Button, Space, Tooltip, Empty } from 'antd';
import { DeleteOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * PdfPreview component
 * @param {File[]} files - Array of File objects (PDFs)
 * @param {function} onUpdate - Callback when PDF pages are updated (reorder, delete, rotate)
 */
const PdfPreview = ({ files = [], onUpdate }) => {
  const [pdfFiles, setPdfFiles] = useState([]);

  useEffect(() => {
    if (files && files.length > 0) {
      const processedFiles = files.map(file => ({
        file,
        id: URL.createObjectURL(file),
        rotation: 0,
      }));
      setPdfFiles(processedFiles);
    } else {
      setPdfFiles([]);
    }
  }, [files]);

  const handleDelete = (index) => {
    const updated = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(updated);
    onUpdate?.(updated);
  };

  const handleRotate = (index, direction) => {
    const updated = pdfFiles.map((f, i) => {
      if (i === index) {
        return { ...f, rotation: direction === 'left' ? f.rotation - 90 : f.rotation + 90 };
      }
      return f;
    });
    setPdfFiles(updated);
    onUpdate?.(updated);
  };

  if (!files || files.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Empty description="No PDF files to preview" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {pdfFiles.map((pdf, index) => (
        <Card
          key={pdf.id}
          hoverable
          style={{ width: 150 }}
          cover={
            <Document 
              file={pdf.file}
              onLoadError={(error) => {
                console.error('PDF load error:', error);
              }}
              loading="Loading PDF..."
            >
              <Page 
                pageNumber={1} 
                width={140} 
                rotate={pdf.rotation}
                onLoadError={(error) => {
                  console.error('Page load error:', error);
                }}
                loading="Loading page..."
              />
            </Document>
          }
          actions={[
            <Tooltip title="Rotate Left">
              <RotateLeftOutlined onClick={() => handleRotate(index, 'left')} />
            </Tooltip>,
            <Tooltip title="Rotate Right">
              <RotateRightOutlined onClick={() => handleRotate(index, 'right')} />
            </Tooltip>,
            <Tooltip title="Delete Page">
              <DeleteOutlined onClick={() => handleDelete(index)} />
            </Tooltip>,
          ]}
        >
          <Card.Meta title={pdf.file.name} />
        </Card>
      ))}
    </div>
  );
};

export default PdfPreview;
