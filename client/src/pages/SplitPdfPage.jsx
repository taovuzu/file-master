import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import SplitPdfForm from '@/forms/SplitPdfForm';

const SplitPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Split PDF"
      description="Split a PDF into multiple files by pages or ranges"
      toolType="split"
      FormComponent={SplitPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default SplitPdfPage;
