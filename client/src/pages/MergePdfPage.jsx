import React from 'react';
import PdfToolPage from '@/components/PdfToolPage';

const MergePdfPage = () => {
  return (
    <PdfToolPage
      title="Merge PDFs"
      description="Combine multiple PDF files into one document"
      entity="merge"
      multipleFiles={true}
      maxFiles={10}
      showPreview={true}
    />
  );
};

export default MergePdfPage;
