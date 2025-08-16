import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import MergePdfForm from '@/forms/MergePdfForm';

const MergePdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Merge PDFs"
      description="Combine multiple PDF files into one document"
      toolType="merge"
      FormComponent={MergePdfForm}
      requirements={{
        multipleFiles: true,
        minFiles: 2,
        maxFiles: 15,
        maxSize: 10,
      }}
    />
  );
};

export default MergePdfPage;
