import React from 'react';
import PdfToolPage from '@/pages/PdfToolPage';
import WatermarkPdfForm from '@/forms/WatermarkPdfForm';

const WatermarkPdfPage = () => {
  return (
    <PdfToolPage
      title="Add Watermark"
      description="Add text watermark to your PDF document"
      toolType="watermark"
      FormComponent={WatermarkPdfForm}
      requirements={{
        multipleFiles: false,
        minFiles: 1,
        maxFiles: 1,
        maxSize: 10,
        acceptedTypes: ["application/pdf"]
      }} />);


};

export default WatermarkPdfPage;