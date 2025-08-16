import React from 'react';
import EnhancedPdfToolPage from '@/components/EnhancedPdfToolPage';
import WatermarkPdfForm from '@/forms/WatermarkPdfForm';

const WatermarkPdfPage = () => {
  return (
    <EnhancedPdfToolPage
      title="Add Watermark"
      description="Add text watermark to your PDF document"
      toolType="watermark"
      FormComponent={WatermarkPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
      }}
    />
  );
};

export default WatermarkPdfPage;
