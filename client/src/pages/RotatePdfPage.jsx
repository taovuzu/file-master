import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import RotatePdfForm from '@/forms/RotatePdfForm';

const RotatePdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Rotate PDF"
      description="Rotate PDF pages by 90°, 180°, or 270°"
      toolType="rotate"
      FormComponent={RotatePdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default RotatePdfPage;
