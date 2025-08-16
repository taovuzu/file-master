import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import CompressPdfForm from '@/forms/CompressPdfForm';

const CompressPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      toolType="compress"
      FormComponent={CompressPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default CompressPdfPage;
